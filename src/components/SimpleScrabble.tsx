import React, { useEffect, useState } from 'react';
import './styles/SimpleScrabble.css';
import { gql, useApolloClient } from '@apollo/client';
import GameHistory from './GameHistory';

type singlePlayerInfo = { name: string, score: number, words: { word: string[], mult: number[], points: number, bingo: boolean }[], lostPoints: number, lastLetters: string[], otherPlayerTiles: { tiles: string[], score: number} }

function SimpleScrabble(props: {names: string[], continueGame: boolean, handleNewGame: () => void}) {
  const apolloClient = useApolloClient();

  const [showGame, setShowGame] = useState(false);

  const [scrabbleWords, setScrabbleWords] = useState<string[]>([]);
  const [scrabbleDefinitions, setscrabbleDefinitions] = useState<string[]>([]);
  const [indexOfWord, setIndexOfWord] = useState(-1);
  const [showIsValidWord, setShowIsValidWord] = useState(false);
  const [currentWordToCheck, setCurrentWordToCheck] = useState('');

  const [playerInfo, setPlayerInfo] = useState<singlePlayerInfo[]>([]);

  const [remainingLetters, setRemainingLetters] = useState<{word: string, letters: string[]}[]>([]);

  const [playerTurn, setPlayerTurn] = useState(0);

  const [enteredTiles, setEnteredTiles] = useState<{ letter: string, mult: number }[]>([]);
  const [enteredWord, setEnteredWord] = useState('');

  const [changeTile, setChangeTile] = useState(false);
  const [currentSelectedTile, setCurrentSelectedTile] = useState(-1);

  const [isBingo, setIsBingo] = useState(false);

  const [enterTilesLeft, setEnterTilesLeft] = useState(false);
  const [showFinalScore, setShowFinalScore] = useState(false);

  const [isGameSaved, setIsGameSaved] = useState(false);
  const [showGameHistory, setShowGameHistory] = useState(false);
  const [gameHistoryPlayers, setGameHistoryPlayers] = useState<string[]>([]);

  const [isSavingGame, setIsSavingGame] = useState(false);
  const [saveGameText, setSaveGameText] = useState("save this game");

  // const validLettersLower = 'abcdefghijklmnopqrstuvwxyz';
  const validLettersUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const loadScrabbleWords = () => {
    const scrabbleWords = require("./scrabble_dictionary/scrabble_words_with_definitions.txt");

    let temp = [];
    let words : string[] = [];
    let definitions : string[] = []; 

    fetch(scrabbleWords).then((res) => res.text())
        .then((data) => {
            for (let line of data.split('\r\n')) {
                temp = line.split('\t');
                words.push(temp[0]);
                definitions.push(temp[1]);
            }

            setScrabbleWords(words);
            setscrabbleDefinitions(definitions);
        })
  }

  const gameSetup = () => {
    let temp = [];
    let temp2 = [];

    if (props.continueGame) {
      let currentGameInfoString = localStorage.getItem('currentGame');
      
      if (currentGameInfoString) {
        let currentGameInfo = JSON.parse(currentGameInfoString);
        temp = currentGameInfo.info;
        for (let i = 0; i < temp.length; i++) temp2.push({ word: '', letters: [] });
        setPlayerTurn(currentGameInfo.currentTurn);
      } else {
        props.handleNewGame();
      }
    } else {
      for (let n of props.names) {
        if (n.length > 0) {
          temp.push({ name: n, score: 0, words: [], lostPoints: 0, lastLetters: [], otherPlayerTiles: { tiles: [], score: 0 } });
          temp2.push({ word: '', letters: [] });
        }
      }
    }

    localStorage.setItem('version', '1');

    loadScrabbleWords();
    setPlayerInfo(temp);
    setRemainingLetters(temp2);
    setShowGameHistory(false);
    setShowGame(true);
  }

  useEffect(() => {
    gameSetup();
  }, []);

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

    if (temp.length < 7) setIsBingo(false);
    
    setChangeTile(false);
    setCurrentSelectedTile(-1);
    setShowIsValidWord(false);
    setEnteredWord(w);
    setEnteredTiles(temp);
  }

  const changeTileType = (i: number) => {
    if (changeTile) {
      setChangeTile(false);
      setCurrentSelectedTile(-1);
    } else {
      setChangeTile(true);
      setCurrentSelectedTile(i);
    }
  }

  const setNewTypeType = (k: number) => {
    let temp = [...enteredTiles];
    if (k === 5) {
      temp[currentSelectedTile].letter = '_';
    } else {
      temp[currentSelectedTile].mult = k;
    }
    setEnteredTiles(temp);
    setChangeTile(false);
    setCurrentSelectedTile(-1);
  }

  const resetTileType = () => {
    let temp = [...enteredTiles];
    temp[currentSelectedTile].letter = enteredWord.charAt(currentSelectedTile);
    temp[currentSelectedTile].mult = 0;
    setEnteredTiles(temp);
    setChangeTile(false);
    setCurrentSelectedTile(-1);
  }

  const bingo = () => {
    if (enteredWord.length < 7) return;

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

    let nextTurn = playerTurn === playerInfo.length - 1 ? 0 : playerTurn+1;
    
    localStorage.setItem('currentGame', JSON.stringify({info: playerInfo, currentTurn: nextTurn}));

    setPlayerTurn(nextTurn);
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

    localStorage.removeItem('currentGame');
    localStorage.removeItem('version');
  }

  const wordCheck = () => {
    if (enteredWord.length === 0) return;
    setCurrentWordToCheck(enteredWord);
    setIndexOfWord(scrabbleWords.indexOf(enteredWord.toUpperCase()));
    setShowIsValidWord(true);
  }

  const previousTurn = () => {
    let previousTurn = playerTurn > 0  ? playerTurn-1 : playerInfo.length - 1;
    setPlayerTurn(previousTurn);
  }

  // const undoLastWord = () => {
  //   let temp = [...playerInfo];

  //   let removedWord = temp[playerTurn].words.pop();
  //   if (removedWord !== undefined) {
  //     temp[playerTurn].score-=removedWord.points;
  //     setPlayerInfo(temp);
  //   }
  // }

  const deleteWord = (playerIndex: number, wordIndex: number) => {
    let temp = [...playerInfo];
    temp[playerIndex].score-=temp[playerIndex].words[wordIndex].points;
    temp[playerIndex].words = temp[playerIndex].words.slice(0, wordIndex).concat(temp[playerIndex].words.slice(wordIndex+1));
    setPlayerInfo(temp);
  }

  const leaveGame = () => {
    setShowGame(false);
    setPlayerInfo([]);
    setRemainingLetters([]);
    setPlayerTurn(0);
    setEnteredTiles([]);
    setEnteredWord('');
    setChangeTile(false);
    setCurrentSelectedTile(-1);
    setCurrentSelectedTile(-1);
    setIsBingo(false);
    setEnterTilesLeft(false);
    setShowFinalScore(false);
    setShowIsValidWord(false);
    setIsGameSaved(false);
    setShowGameHistory(false);
    setGameHistoryPlayers([]);
    setSaveGameText("save this game");
    props.handleNewGame();
  }

  const getGameHistoryAfterGame = () => {
    if (showGameHistory) return;

    let players = [];
    for (let p of playerInfo) players.push(p.name);
    players.sort();

    setGameHistoryPlayers(players);
    setShowGameHistory(true);
  }

  const saveGame = () => {
    if (isGameSaved) return;

    let players: string[] = [];
    for (let p of playerInfo) players.push(p.name);
    players.sort();

    let gameInfo = playerInfo;
    let boardState : string[][] = [];

    const SAVE_SCRABBLE_GAME = gql`
      mutation addScrabbleGame($players: [String], $gameInfo: [GameInfoInput], $boardState: [[String]]) {
        addScrabbleGame(players: $players, gameInfo: $gameInfo, boardState: $boardState) {
          id
        }
      }
    `;

    setIsSavingGame(true);

    apolloClient
      .mutate({
        mutation: SAVE_SCRABBLE_GAME,
        variables: { players, gameInfo, boardState }
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
      {showGame &&
        <div className="GameContainer">
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
                            {wordInfo.word[j] === '_' ?
                              <button className="SmallTile" id={'color' + wordInfo.mult[j]} />
                              :
                              <button className="SmallTile" id={'color' + wordInfo.mult[j]}>{letter}</button>
                            }
                          </span>
                        ))}

                        <span className="PlayerWordScore">{wordInfo.points}</span>

                        {wordInfo.bingo &&
                          <span className="BingoWord"> ★</span>
                        }

                        {!showFinalScore &&
                          <span><button className="DeleteWord" onClick={() => deleteWord(i, k)}>×</button></span>
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
                      {tile.letter === '_' ?
                        <button className="RegularTile" id={'color' + tile.mult + (i === currentSelectedTile)} onClick={() => changeTileType(i)} />
                        :
                        <button className="RegularTile" id={'color' + tile.mult + (i === currentSelectedTile)} onClick={() => changeTileType(i)}>{tile.letter}</button>
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
                    <button className="RegularTile" id="color0" onClick={() => resetTileType()}><p id="changeTileWords">reset</p></button>
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
                  {/* <button className="UndoLastWord" onClick={() => undoLastWord()}>undo your last word</button> */}
                  <button className="GoBackTurn" onClick={() => previousTurn()}>previous turn</button>
                  <button className="WordCheck" onClick={() => wordCheck()}>check word</button>
                </div>

                {showIsValidWord &&
                  <div className="WordValidity">
                    {indexOfWord === -1 ?
                      <div className="InvalidScrabbleWord">
                        <h2><span id="invalidWord">{currentWordToCheck}</span> is not a valid word -_-</h2>
                      </div>

                      :

                      <div className="ValidScrabbleWord">
                        <h2><span id="validWord">{currentWordToCheck}</span> is a valid word :D</h2>
                        <p>{scrabbleDefinitions[indexOfWord]}</p>
                      </div>
                    }
                  </div>
                }

                <div className="EndGameRow">
                  <button className="EndGame" onClick={() => finishGame()}>enter remaining tiles</button>
                </div>

                <button className="LeaveGame" onClick={() => leaveGame()}>leave game</button>
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

                    <button className="PlayAgain" onClick={() => leaveGame()}>exit</button>

                    <div>
                      <button className="SaveGame" id={"gameSaved" + isGameSaved} onClick={() => saveGame()}>
                        {isSavingGame ?
                          <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
                          :
                          <span>{saveGameText}</span>
                        }
                      </button>

                      <button className="GetGameHistoryAfter" id={"historyLoaded" + showGameHistory} onClick={() => getGameHistoryAfterGame()}>see game history</button>
                    </div>

                  </div>
                }
              </div>
            }
          </div>

          {showGameHistory &&
            <div className="GameHistoryAfterGame">
              <GameHistory names={gameHistoryPlayers} />
            </div>
          }
        </div>

      }
    </div>
  );
}

export default SimpleScrabble;
