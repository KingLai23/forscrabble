import React, { useState } from 'react';
import './styles/SimpleScrabble.css';
import { gql, useApolloClient } from '@apollo/client';

function SimpleScrabble() {
  const apolloClient = useApolloClient();

  const [nameScreen, setNameScreen] = useState(true);

  const [scrabbleWords, setScrabbleWords] = useState<string[]>([]);

  type singlePlayerInfo = { name: string, score: number, words: { word: string[], mult: number[], points: number, bingo: boolean }[], lostPoints: number, lastLetters: string[], otherPlayerTiles: { tiles: string[], score: number} }
  const [playerInfo, setPlayerInfo] = useState<singlePlayerInfo[]>([]);

  const [remainingLetters, setRemainingLetters] = useState<{word: string, letters: string[]}[]>([]);

  const [enteredNames, setEnteredNames] = useState(['', '', '', '']);

  const [playerTurn, setPlayerTurn] = useState(0);

  const [enteredTiles, setEnteredTiles] = useState<{ letter: string, mult: number }[]>([]);
  const [enteredWord, setEnteredWord] = useState('');

  const [changeTile, setChangeTile] = useState(false);
  const [currentSelectedTile, setCurrentSelectedTile] = useState(-1);

  const [isBingo, setIsBingo] = useState(false);

  const [enterTilesLeft, setEnterTilesLeft] = useState(false);
  const [showFinalScore, setShowFinalScore] = useState(false);

  const [isValidWord, setIsValidWord] = useState(false);
  const [showIsValidWord, setShowIsValidWord] = useState(false);


  const [isGameSaved, setIsGameSaved] = useState(false);
  const [showGameHistory, setShowGameHistory] = useState(false);
  const [gameHistory, setGameHistory] = useState<{players: string[], gameInfo: singlePlayerInfo[], date: string}[]>([]);

  const [isSavingGame, setIsSavingGame] = useState(false);
  const [isLoadingGameHistory, setIsLoadingGameHistory] = useState(false);
  const [saveGameText, setSaveGameText] = useState("save this game");

  // const validLettersLower = 'abcdefghijklmnopqrstuvwxyz';
  const validLettersUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const setName = (i: number, n: string) => {
    let temp = [...enteredNames];
    temp[i] = n;
    setEnteredNames(temp);
  }

  const loadScrabbleWords = () => {
    const scrabbleWords = require("./scrabble_dictionary/scrabble_words.txt");

    fetch(scrabbleWords).then((res) => res.text())
      .then((data) => {
        setScrabbleWords(data.split('\r\n'));
      })
  }

  const setupAndStartGame = () => {
    let temp = [];
    let temp2 = [];
    for (let n of enteredNames) {
      if (n.length > 0) {
        temp.push({ name: n, score: 0, words: [], lostPoints: 0, lastLetters: [], otherPlayerTiles: { tiles: [], score: 0}});
        temp2.push({word: '', letters: []});
      }
    }

    if (temp.length === 0) return;

    setPlayerInfo(temp);
    setRemainingLetters(temp2);
    setShowGameHistory(false);
    setNameScreen(false);
    loadScrabbleWords();
  }

  const filterAndLowercaseLetters = (w:string) => {
    let filtered = '';
    for (let l of w.toUpperCase()) {
      if (validLettersUpper.includes(l)) filtered+=l;
    }
    return filtered;
  }

  const configEnteredWord = (x: string) => {
    let w = filterAndLowercaseLetters(x);

    let temp = [];
    for (let l of w) temp.push({ letter: l, mult: 0 });

    setChangeTile(false);
    setShowIsValidWord(false);
    setEnteredWord(w);
    setEnteredTiles(temp);
  }

  const changeTileType = (i: number) => {
    if (changeTile) {
      setChangeTile(false);
    } else {
      setChangeTile(true);
      setCurrentSelectedTile(i);
    }
  }

  const setNewTypeType = (k: number) => {
    let temp = [...enteredTiles];
    temp[currentSelectedTile].mult = k;
    setEnteredTiles(temp);
    setChangeTile(false);
  }

  const bingo = () => {
    setIsBingo(!isBingo);
  }

  const getTileValue = (n: string) => {
    switch (n) {
      case 'e':
      case 'a':
      case 'i':
      case 'o':
      case 'n':
      case 'r':
      case 't':
      case 'l':
      case 's':
      case 'u':
        return 1;
      case 'd':
      case 'g':
        return 2;
      case 'b':
      case 'c':
      case 'm':
      case 'p':
        return 3;
      case 'f':
      case 'h':
      case 'v':
      case 'w':
      case 'y':
        return 4;
      case 'k':
        return 5;
      case 'j':
      case 'x':
        return 8;
      case 'q':
      case 'z':
        return 10;
      default:
        return 0;
    }
  }

  const getScore = () => {
    let beforeWordMult = 0;
    let wordMult = 1;

    for (let tile of enteredTiles) {
      let value = getTileValue(tile.letter.toLowerCase());

      if (tile.mult === 1 || tile.mult === 2) {
        value*=(tile.mult + 1);
      } else if (tile.mult === 3 || tile.mult === 4) {
        wordMult *=(tile.mult - 1);
      } else if (tile.mult === 5) {
        value = 0;
      }

      beforeWordMult += value;
    }

    beforeWordMult *= wordMult;

    return isBingo ? beforeWordMult + 50 : beforeWordMult;
  }

  const resetEnteredWord = () => {
    setChangeTile(false);
    setCurrentSelectedTile(-1);
    setEnteredTiles([]);
    setEnteredWord('');
  }

  const submitWord = () => {
    if (enteredTiles.length === 0) return;

    let score = getScore();

    let temp = [...playerInfo];

    let mult = [];
    let word = [];
    for (let enteredTile of enteredTiles) {
      mult.push(enteredTile.mult);
      word.push(enteredTile.letter);
    }

    temp[playerTurn].words.push({word: word, mult: mult, points: score, bingo: isBingo});
    temp[playerTurn].score += score;

    setShowIsValidWord(false);
    setIsBingo(false);
    setPlayerInfo(temp);
    resetEnteredWord();
  }

  const endTurn = () => {
    submitWord();

    if (playerTurn === playerInfo.length - 1) {
      setPlayerTurn(0);
    } else {
      setPlayerTurn(playerTurn+1);
    }
  }

  const finishGame = () => {
    for (let pi of playerInfo) {
      if (pi.words.length === 0) return;
    }
    setEnterTilesLeft(true);
  }

  const continueGame = () => {
    setEnterTilesLeft(false);
  }

  const configureRemainingTiles = (i: number, s: string) => {
    let temp = [...remainingLetters];
    let filtered = filterAndLowercaseLetters(s);
    let lettersFiltered = [];
    for (let l of filtered) lettersFiltered.push(l);

    temp[i] = {word: filtered, letters: lettersFiltered};
    setRemainingLetters(temp);
  }

  const setRemainingTiles = () => {
    let temp = [...playerInfo];
    for (let i = 0; i < temp.length; i++) temp[i].lastLetters = remainingLetters[i].letters;
    setPlayerInfo(temp);
  }

  const finalizeGame = () => {
    setRemainingTiles();

    let temp = [...playerInfo];
    let allTilesLeft: string[] = [];
    let allTilesLeftScore = 0;
    let playerWithNoTilesLeft = -1;

    for (let i = 0; i < temp.length; i++) {
      let totalSubtraction = 0;

      allTilesLeft = allTilesLeft.concat(temp[i].lastLetters);

      if (temp[i].lastLetters.length === 0) {
        playerWithNoTilesLeft = i;
      } else {
        for (let letter of temp[i].lastLetters) {
          totalSubtraction+=getTileValue(letter.toLowerCase());
        }
  
        temp[i].lostPoints = totalSubtraction;
        temp[i].score-=totalSubtraction;

        allTilesLeftScore+=totalSubtraction;
      }
    }

    if (playerWithNoTilesLeft > -1) {
      temp[playerWithNoTilesLeft].otherPlayerTiles = {tiles: allTilesLeft, score: allTilesLeftScore};
      temp[playerWithNoTilesLeft].score+=allTilesLeftScore;
    }

    setPlayerInfo(temp);
    setShowFinalScore(true);
  }

  const wordCheck = () => {
    if (enteredWord.length === 0) return;
    setIsValidWord(scrabbleWords.indexOf(enteredWord.toUpperCase()) > -1);
    setShowIsValidWord(true);
  }

  const undoLastWord = () => {
    let temp = [...playerInfo];

    let removedWord = temp[playerTurn].words.pop();
    if (removedWord !== undefined) {
      temp[playerTurn].score-=removedWord.points;
      setPlayerInfo(temp);
    }
  }

  const playAgain = () => {
    setNameScreen(true);
    setPlayerInfo([]);
    setRemainingLetters([]);
    setEnteredNames(['', '', '', '']);
    setPlayerTurn(0);
    setEnteredTiles([]);
    setEnteredWord('');
    setChangeTile(false);
    setCurrentSelectedTile(-1);
    setIsBingo(false);
    setEnterTilesLeft(false);
    setShowFinalScore(false);
    setShowIsValidWord(false);
    setIsGameSaved(false);
    setShowGameHistory(false);
    setGameHistory([]);
    setSaveGameText("save this game");
  }

  const getGames = (players: string[]) => {
    if (isLoadingGameHistory) return;

    const GET_SCRABBLE_GAMES_BY_PLAYER = gql`
      query getScrabbleGamesByPlayers($players: [String]) {
        getScrabbleGamesByPlayers(players: $players) {
          players
          gameInfo {
            name
            score
            words {
              word
              mult
              points
              bingo
            }
            lostPoints
            lastLetters
            otherPlayerTiles {
              tiles
              score
            }
          }
          date
        }
      }
    `;

    setIsLoadingGameHistory(true);

    apolloClient
        .query({
            query: GET_SCRABBLE_GAMES_BY_PLAYER,
            variables: { players },
            fetchPolicy: 'network-only'
        })
        .then((res) => {
            setShowGameHistory(true);
            setGameHistory(res.data.getScrabbleGamesByPlayers);
            setIsLoadingGameHistory(false);
        })
        .catch((err) => {
          console.log(err);
          setIsLoadingGameHistory(false);
        });
  }

  const getGameHistoryAfterGame = () => {
    let players = [];
    for (let p of playerInfo) players.push(p.name);
    players.sort();

    getGames(players);
  }

  const getGameHistoryBeforeGame = () => {
    let players = [];
    for (let n of enteredNames) {
      if (n.length > 0) {
        players.push(n);
      }
    }
    players.sort();

    if (players.length > 0) getGames(players);
  }

  const saveGame = () => {
    if (isGameSaved) return;

    let players: string[] = [];
    for (let p of playerInfo) players.push(p.name);
    players.sort();

    let gameInfo = playerInfo;

    const SAVE_SCRABBLE_GAME = gql`
      mutation addScrabbleGame($players: [String], $gameInfo: [GameInfoInput]) {
        addScrabbleGame(players: $players, gameInfo: $gameInfo) {
          id
        }
      }
    `;

    setIsSavingGame(true);

    apolloClient
      .mutate({
        mutation: SAVE_SCRABBLE_GAME,
        variables: { players, gameInfo }
      })
      .then((res) => {
        setIsGameSaved(true);
        setIsSavingGame(false);
        setSaveGameText("game saved");
      })
      .catch((err) => {
        console.log(err);
        setIsSavingGame(false);
      });
  }

  return (
    <div className="SimpleScrabble">
      <div className="Title">
        <h1>scrabble calc</h1>
      </div>
      
      {nameScreen ?
        <div className="NameScreen">
          <h1>enter names</h1>

          <div className="InputBars">
            {enteredNames.map((n: string, i: number) => (
              <div className="InputBar" key={i}>
                <input
                  placeholder={"player " + (i + 1)}
                  name="playerNameInput"
                  id="playerNameInput"
                  autoComplete='off'
                  value={n}
                  onChange={(e) => setName(i, e.currentTarget.value)}
                />
              </div>
            ))}
          </div>

          <button className="confirmPlayerNames" onClick={() => setupAndStartGame()}>confirm</button>
          <br></br>
          <button className="GetGameHistoryBefore" onClick={() => getGameHistoryBeforeGame()}>
            {isLoadingGameHistory ?
              <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
              :
              <span>see game history</span>
            }
          </button>
        </div>

        :

        <div className="ScrabbleGame">
          <div className="ScoreInfo">  
            <div className="ScoreTable">
              {playerInfo.map((info, i) => (
                <div className="PlayerScore" key={i}>
                  <h2>{info.name}</h2>

                  {info.words.map((wordInfo, k) => (
                    <div className="PlayerWordHistory" key={k}>
                      {wordInfo.word.map((letter, j) => (
                        <span className="IndividualTile" key={j}>
                          {wordInfo.mult[j] === 5 ?
                            <button className="SmallTile" id='color5'/>
                            :
                            <button className="SmallTile" id={'color' + wordInfo.mult[j]}>{letter}</button>
                          }
                        </span>
                      ))}

                      <span className="PlayerWordScore">{wordInfo.points}</span>

                      {wordInfo.bingo &&
                        <span className="BingoWord"> ★</span>
                      }
                    </div>
                  ))}

                  {info.lostPoints > 0 &&
                    <div className="SubtractedTiles" key={i}>
                      {info.lastLetters.map((lastLetter, p) => (
                        <span className="LastTiles" key={p}>
                          <button className="SmallTile" id="color0">{lastLetter}</button>
                        </span>
                      ))}

                      <span className="PlayerWordScore">-{info.lostPoints}</span>
                    </div>
                  }

                  {info.otherPlayerTiles.score > 0 &&
                    <div className="OtherPlayerTiles" key={'opt' + i}>
                      {info.otherPlayerTiles.tiles.map((tile, y) => (
                        <span className="OtherPlayerTile" key={y}>
                          <button className="SmallTile" id='color0'>{tile}</button>
                        </span>
                      ))}

                      <span className="PlayerWordScore">+{info.otherPlayerTiles.score}</span>
                    </div>
                  }

                </div>
              ))}
            </div>

            <div className="PlayerTotalScore">
              {playerInfo.map((info, i) => (
                <div className="IndividualScore" key={i}>
                  <h1>{info.score}</h1>
                </div>
              ))}
            </div>
          </div>

          {!enterTilesLeft ?
            <div className="WordEnter">
              <h2>{playerInfo[playerTurn].name}'s turn</h2>

              <div className="EnteredTiles">
                {enteredTiles.map((tile, i) => (
                  <span className="IndividualTile" key={i}>
                    {tile.mult === 5 ?
                      <button className="RegularTile" id='color5' onClick={() => changeTileType(i)}/>
                      :
                      <button className="RegularTile" id={'color' + tile.mult} onClick={() => changeTileType(i)}>{tile.letter}</button>
                    }
                  </span>
                ))}

                {isBingo &&
                   <span className="ShowBingoPoints">+50</span>
                }
              </div>

              {changeTile &&
                <div className="ChangeTileType">
                  <button className="RegularTile" id="color0" onClick={() => setNewTypeType(5)}><p id="changeTileWords">blank</p></button>
                  <button className="RegularTile" id="color1" onClick={() => setNewTypeType(1)}><p id="changeTileWords">double letter</p></button>
                  <button className="RegularTile" id="color2" onClick={() => setNewTypeType(2)}><p id="changeTileWords">triple letter</p></button>
                  <button className="RegularTile" id="color3" onClick={() => setNewTypeType(3)}><p id="changeTileWords">double word</p></button>
                  <button className="RegularTile" id="color4" onClick={() => setNewTypeType(4)}><p id="changeTileWords">triple word</p></button>
                  <button className="RegularTile" id="color0" onClick={() => setNewTypeType(0)}><p id="changeTileWords">reset</p></button>
                </div>
              }

              <div className="WordInputBar">
                <input
                  placeholder={"type a word"}
                  name="wordInput"
                  id="wordInput"
                  autoComplete='off'
                  value={enteredWord}
                  onChange={(e) => configEnteredWord(e.target.value)}
                />
                <button className="EndTurn" onClick={() => endTurn()}>end turn</button>
              </div>

              <button className="Bingo" onClick={() => bingo()}>bingo ★</button>
              <button className="ConfirmWord" onClick={() => submitWord()}>another word</button>

              <div className="CheckWordRow">
                <button className="UndoLastWord" onClick={() => undoLastWord()}>undo your last word</button>
                <button className="WordCheck" onClick={() => wordCheck()}>check word</button>
              </div>

              {showIsValidWord &&
                <div className="WordValidity">
                  {isValidWord ?
                    <h1 id="validWord">good ✓</h1>
                    :
                    <h1 id="invalidWord">nice try ✖</h1>
                  }
                </div>
              }

              <div className="EndGameRow">
                <button className="EndGame" onClick={() => finishGame()}>finish game</button>
              </div>
            </div>

            :

            <div className="EndGameSection">
              {!showFinalScore ?
                <div className="LastTiles">
                    <div className="PlayerLastTilesSection">
                      {playerInfo.map((info, i) => (
                        <div className="LastTilesInput" key={i}>
                          <h2>{info.name}</h2>

                          <div className="LastTilesTile">
                            {remainingLetters[i].letters.map((letter, j) => (
                              <span className="IndividualTile" key={j}>
                                <button className="SmallTile" id="color0">{letter}</button>
                              </span>
                            ))}
                          </div>

                          <input
                            placeholder="what's left?"
                            name="playerNameInput"
                            id="playerNameInput"
                            autoComplete='off'
                            value={remainingLetters[i].word}
                            onChange={(e) => configureRemainingTiles(i, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>

                  <div className="LastTileSectionButtons">
                    <button className="ContinueGame" onClick={() => continueGame()}>continue game</button>
                    <button className="FinalizeGame" onClick={() => finalizeGame()}>end game</button>
                  </div>
                </div>

                :

                <div className="FinalizeScores">
                  <h1>final scores</h1>

                  <div className="FinalScoreSections">
                    {playerInfo.map((info, i) => (
                      <div className="PlayerIndividualScore" key={i}>
                        <h2>{info.name}</h2>

                        {info.score.toString().split('').map((num, k) => (
                          <span className="ScoreTiles" key={k}>
                            <button className="RegularTile" id="scoreTileColor">{num}</button>
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                  
                  <button className="PlayAgain" onClick={() => playAgain()}>play again</button>
                  
                  <div>
                    <button className="SaveGame" id={"gameSaved" + isGameSaved} onClick={() => saveGame()}>
                      {isSavingGame ?
                        <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
                        :
                        <span>{saveGameText}</span>
                      }
                    </button>

                    <button className="GetGameHistoryAfter" onClick={() => getGameHistoryAfterGame()}>
                      {isLoadingGameHistory ?
                        <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
                        :
                        <span>see game history</span>
                      }
                    </button>
                  </div>

                </div>
              }
            </div>
          }
        </div>
      }

      {showGameHistory &&
        <div className="GameHistory">
          <h2>your game history together</h2>

          {gameHistory.length > 0 ?
            <div className="FoundGameHistory">
              {gameHistory.map((game, i) => (
                <div className="IndividualGame" key={i}>
                  <div className="IndividualGameBorder" />

                  <h3>{new Date(game.date).toDateString()}</h3>

                  <div className="IndividualGameInfoContainer">
                    {game.gameInfo.map((info, k) => (
                      <div className="IndividualGameInfo" key={k}>
                        <h2>{info.name}</h2>
                        <h1>{info.score}</h1>

                        {info.words.map((wordInfo, j) => (
                          <div className="IndividualGameInfoWordHistory" key={j}>
                            {wordInfo.word.map((letter, y) => (
                              <span className="IndividualTile" key={y}>
                                {wordInfo.mult[y] === 5 ?
                                  <button className="SmallTile" id='color5' />
                                  :
                                  <button className="SmallTile" id={'color' + wordInfo.mult[y]}>{letter}</button>
                                }
                              </span>
                            ))}

                            <span className="PlayerWordScore">{wordInfo.points}</span>

                            {wordInfo.bingo &&
                              <span className="BingoWord"> ★</span>
                            }
                          </div>
                        ))}

                        {info.lostPoints > 0 &&
                          <div className="IndividualGameInfoSubtractedTiles" key={i}>
                            {info.lastLetters.map((lastLetter, p) => (
                              <span className="LastTiles" key={p}>
                                <button className="SmallTile" id="color0">{lastLetter}</button>
                              </span>
                            ))}

                            <span className="PlayerWordScore">-{info.lostPoints}</span>
                          </div>
                        }

                        {info.otherPlayerTiles.score > 0 &&
                          <div className="IndividualGameInfoOtherPlayerTiles" key={'opt' + i}>
                            {info.otherPlayerTiles.tiles.map((tile, y) => (
                              <span className="OtherPlayerTile" key={y}>
                                <button className="SmallTile" id='color0'>{tile}</button>
                              </span>
                            ))}

                            <span className="PlayerWordScore">+{info.otherPlayerTiles.score}</span>
                          </div>
                        }
                      </div>
                    ))}

                  </div>

                  {/* <div className="IndividualGameInfoScore">
                        {game.gameInfo.map((info, q) => (
                          <h4 key={q}>{info.score}</h4>
                        ))}
                      </div> */}
                </div>
              ))}
            </div>

            :

            <div className="NoGameHistory">
              <h3>none found, it's your first game together!</h3>
            </div>
          }


        </div>
      }
    </div>
  );
}

export default SimpleScrabble;
