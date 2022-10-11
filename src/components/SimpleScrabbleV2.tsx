import React, { useEffect, useState } from 'react';
import './styles/SimpleScrabbleV2.css';
import { gql, useApolloClient } from '@apollo/client';
import ScrabbleWordChecker from './ScrabbleWordChecker';

type singlePlayerInfo = { name: string, score: number, words: { word: string[], mult: number[], points: number, bingo: boolean }[], lostPoints: number, lastLetters: string[], otherPlayerTiles: { tiles: string[], score: number} }

function SimpleScrabble(props: {names: string[], continueGame: boolean, handleNewGame: () => void}) {

  const apolloClient = useApolloClient();

  const defaultBoardLetters = 
  [['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '']];

  const defaultFinalizedLetters = 
  [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

  const [boardLetters, setBoardLetters] = useState(defaultBoardLetters);

  const [finalizedLetters, setFinalizedLetters] = useState(defaultFinalizedLetters);

  const multipliers =
    [[4, 0, 0, 1, 0, 0, 0, 4, 0, 0, 0, 1, 0, 0, 4],
    [0, 3, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 3, 0],
    [0, 0, 3, 0, 0, 0, 1, 0, 1, 0, 0, 0, 3, 0, 0],
    [1, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 1],
    [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0],
    [4, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 4],
    [0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0],
    [0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0],
    [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0],
    [1, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 1],
    [0, 0, 3, 0, 0, 0, 1, 0, 1, 0, 0, 0, 3, 0, 0],
    [0, 3, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 3, 0],
    [4, 0, 0, 1, 0, 0, 0, 4, 0, 0, 0, 1, 0, 0, 4]];

  const [enteredWord, setEnteredWord] = useState('');
  const [currentDisplayedWord, setCurrentDisplayedWord] = useState<number[][]>([]);
  const validLettersUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ-';

  const [currentTile, setCurrentTile] = useState([-1, -1]);
  const [horiztonal, setHorizontal] = useState(true);

  const [playerInfo, setPlayerInfo] = useState<singlePlayerInfo[]>([]);
  const [remainingLetters, setRemainingLetters] = useState<{word: string, letters: string[]}[]>([]);
  const [playerTurn, setPlayerTurn] = useState(0);

  const [currentUI, setCurrentUI] = useState(0);

  const [showGame, setShowGame] = useState(false);
  
  const [isGameSaved, setIsGameSaved] = useState(false);
  const [isSavingGame, setIsSavingGame] = useState(false);
  const [saveGameText, setSaveGameText] = useState("save game");

  const [turnQueue, setTurnQueue] = useState<{player: number, indices: number[][], numWordsMade: number }[]>([]);

  const leaveGame = () => {
    setShowGame(false);
    setBoardLetters(defaultBoardLetters);
    setFinalizedLetters(defaultFinalizedLetters);
    setEnteredWord('');
    setCurrentDisplayedWord([]);
    setTurnQueue([]);
    setCurrentTile([-1,-1]);
    setHorizontal(true);
    setPlayerInfo([]);
    setRemainingLetters([]);
    setPlayerTurn(0);
    setCurrentUI(0);
    setIsGameSaved(false);
    setIsSavingGame(false);
    setSaveGameText("save game");

    props.handleNewGame();
  }

  const gameSetup = () => {
    let temp = [];
    let temp2 = [];
    let boardLettersToUse = defaultBoardLetters;
    let finalizedLettersToUse = defaultFinalizedLetters;
    let playerTurnToUse = 0;
    let turnQueueToUse = [];

    if (props.continueGame) {
      let currentGameInfoString = localStorage.getItem('currentGame');
      let currentTurnQueueString = localStorage.getItem('turnQueue');

      if (currentGameInfoString && currentTurnQueueString) {
        let currentGameInfo = JSON.parse(currentGameInfoString);
        let currentTurnQueue = JSON.parse(currentTurnQueueString);

        temp = currentGameInfo.info;
        for (let i = 0; i < temp.length; i++) temp2.push({ word: '', letters: [] });

        boardLettersToUse = currentGameInfo.boardLetters;
        finalizedLettersToUse = currentGameInfo.finalizedLetters;
        playerTurnToUse = currentGameInfo.currentTurn;
        turnQueueToUse = currentTurnQueue;
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

    localStorage.setItem('version', '0');

    setPlayerTurn(playerTurnToUse);
    setBoardLetters(boardLettersToUse);
    setFinalizedLetters(finalizedLettersToUse);
    setPlayerInfo(temp);
    setRemainingLetters(temp2);
    setTurnQueue(turnQueueToUse);
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

  const clearDisplayedWord = () => {
    let temp = [...boardLetters];
    for (let l of currentDisplayedWord) temp[l[0]][l[1]] = "";

    setCurrentDisplayedWord([]);
    setBoardLetters(temp);
  }

  const displayWord = (x: string, orientation: boolean, curTileX: number, curTileY: number) => {
    if (curTileX === -1) {
      setEnteredWord('');
      return;
    }

    let w = filterAndLowercaseLetters(x.slice(0,7));

    clearDisplayedWord();

    let temp = [...boardLetters];
    let curWord = [];
    let offset = 0;
    for (let i = 0; i < w.length; i++) {
      if (orientation) {
        while (curTileY+i+offset < 15 && finalizedLetters[curTileX][curTileY+i+offset] === 1) offset++;

        if (curTileY+i+offset < 15) {
          curWord.push([curTileX, curTileY+i+offset]);
          temp[curTileX][curTileY+i+offset] = w.charAt(i);
        } else {
          w = w.slice(0, i);
          break;
        } 

      } else {
        while (curTileX+i+offset < 15 && finalizedLetters[curTileX+i+offset][curTileY] === 1) offset++;

        if (curTileX+i+offset < 15) {
          curWord.push([curTileX+i+offset, curTileY]);
          temp[curTileX+i+offset][curTileY] = w.charAt(i);
        } else {
          w = w.slice(0, i);
          break;
        } 
      }
    }

    setCurrentDisplayedWord(curWord);
    setBoardLetters(temp);
    setEnteredWord(w);
  }

  const setSelectedTile = (i: number, k: number) => {
    setCurrentTile([i, k]);
    displayWord(enteredWord, horiztonal, i, k);
  }

  const setWordOrientation = (isHor: boolean) => {
    setHorizontal(isHor);
    displayWord(enteredWord, isHor, currentTile[0], currentTile[1]);
  }

  const getLettersRight = (x: number, y: number) => {
    let word = '';
    let indices = [];

    let curOffset = 1;
    while (y+curOffset < 15 && boardLetters[x][y + curOffset] !== '') {
      word+=boardLetters[x][y + curOffset];
      indices.push([x, y + curOffset]);
      curOffset++;
    }

    return {word: word, indices: indices};
  }

  const getLettersLeft = (x: number, y: number) => {
    let word = '';
    let indices = [];

    let curOffset = 1;
    while (y-curOffset >= 0 && boardLetters[x][y - curOffset] !== '') {
      word = boardLetters[x][y - curOffset] + word;
      indices.unshift([x, y - curOffset]);
      curOffset++;
    }

    return {word: word, indices: indices};
  }

  const getLettersBelow = (x: number, y: number) => {
    let word = '';
    let indices = [];

    let curOffset = 1;
    while (x + curOffset < 15 && boardLetters[x + curOffset][y] !== '') {
      word += boardLetters[x + curOffset][y];
      indices.push([x + curOffset, y]);
      curOffset++;
    }

    return {word: word, indices: indices};
  }

  const getLettersAbove = (x: number, y: number) => {
    let word = '';
    let indices = [];

    let curOffset = 1;
    while (x- curOffset >= 0 && boardLetters[x - curOffset][y] !== '') {
      word = boardLetters[x - curOffset][y] + word;
      indices.unshift([x - curOffset, y]);
      curOffset++;
    }

    return {word: word, indices: indices};
  }

  const getHorizontalWord = (x: number, y: number) => {
    let horizontalWord = '' + boardLetters[x][y];
    let horizontalIndices = [[x, y]];

    let lettersToRight = getLettersRight(x, y);
    horizontalWord += lettersToRight.word;
    horizontalIndices = horizontalIndices.concat(lettersToRight.indices);

    // left of letter
    let lettersToLeft = getLettersLeft(x, y);
    horizontalWord = lettersToLeft.word + horizontalWord;
    horizontalIndices = lettersToLeft.indices.concat(horizontalIndices);

    return {word: horizontalWord, indices: horizontalIndices}
  }

  const getVerticalWord = (x: number, y: number) => {
    let verticalWord = '' + boardLetters[x][y];
    let verticalIndices = [[x, y]];

    let lettersBelow = getLettersBelow(x, y);
    verticalWord += lettersBelow.word;
    verticalIndices = verticalIndices.concat(lettersBelow.indices);

    // left of letter
    let lettersAbove = getLettersAbove(x, y);
    verticalWord = lettersAbove.word + verticalWord;
    verticalIndices = lettersAbove.indices.concat(verticalIndices);

    return {word: verticalWord, indices: verticalIndices}
  }

  const singlePlacedLetter = () => {
    let horizontalWordInfo = getHorizontalWord(currentTile[0], currentTile[1]);
    let verticalWordInfo = getVerticalWord(currentTile[0], currentTile[1]);

    let createdWords = [];

    if (horizontalWordInfo.word.length > 1) createdWords.push({word: horizontalWordInfo.word, indices: horizontalWordInfo.indices});
    if (verticalWordInfo.word.length > 1) createdWords.push({word: verticalWordInfo.word, indices: verticalWordInfo.indices});

    return createdWords;
  }

  const horizontalWord = () => {
    let createdWords = [];

    let horizontalWordInfo = getHorizontalWord(currentTile[0], currentTile[1]);
    createdWords.push({word: horizontalWordInfo.word, indices: horizontalWordInfo.indices});

    // find extra created words if any exist
    // find vertically created words from the base horizontal word
    for (let i of currentDisplayedWord) {
      let foundVerticalWord = getVerticalWord(i[0], i[1]);
      if (foundVerticalWord.word.length > 1) createdWords.push({word: foundVerticalWord.word, indices: foundVerticalWord.indices});
    }

    return createdWords;
  }

  const verticalWord = () => {
    let createdWords = [];

    let verticalWordInfo = getVerticalWord(currentTile[0], currentTile[1]);
    createdWords.push({word: verticalWordInfo.word, indices: verticalWordInfo.indices});

    // find extra created words if any exist
    // find horizontally created words from the base vertical word
    for (let i of currentDisplayedWord) {
      let foundHorizontalWord = getHorizontalWord(i[0], i[1]);
      if (foundHorizontalWord.word.length > 1) createdWords.push({word: foundHorizontalWord.word, indices: foundHorizontalWord.indices});
    }

    return createdWords;
  }

  const multiplePlacedLetters = () => {
    if (horiztonal) return horizontalWord();
    return verticalWord();
  }

  const findCreatedWords = () => {
    if (currentDisplayedWord.length === 0) return [];
    if (currentDisplayedWord.length === 1) return singlePlacedLetter();
    return multiplePlacedLetters();
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

  const getScore = (word: string, indices: number[][], isThisABingo: boolean) => {
    let beforeWordMult = 0;
    let wordMult = 1;

    for (let i = 0; i < word.length; i++) {
      let value = getTileValue(word.charAt(i).toLowerCase());

      let tileMult = finalizedLetters[indices[i][0]][indices[i][1]] === 0 ? multipliers[indices[i][0]][indices[i][1]] : 0;

      if (tileMult === 1 || tileMult === 2) {
        value*=(tileMult + 1);
      } else if (tileMult === 3 || tileMult === 4) {
        wordMult *=(tileMult - 1);
      }

      beforeWordMult += value;
    }

    beforeWordMult *= wordMult;

    return isThisABingo ? beforeWordMult + 50 : beforeWordMult;
  }

  const calculatePoints = () => {
    let createdWords = findCreatedWords();

    if (createdWords.length > 0) {
      let tempTurnQueue = [...turnQueue];

      tempTurnQueue.push(
        {
          player: playerTurn,
          indices: currentDisplayedWord,
          numWordsMade: createdWords.length
        }
      );

      setTurnQueue(tempTurnQueue);
      localStorage.setItem('turnQueue', JSON.stringify(tempTurnQueue));
    }

    let temp = [...playerInfo];
    for (let k = 0; k < createdWords.length; k++) {
      let isThisABingo = k === 0 ? enteredWord.length === 7 : false;

      let currentWord = createdWords[k].word;
      let currentIndices = createdWords[k].indices;
      let currentScore = getScore(currentWord, currentIndices, isThisABingo);

      let mult = [];
      let word = [];
      for (let i = 0; i < currentWord.length; i++) {
        mult.push(finalizedLetters[currentIndices[i][0]][currentIndices[i][1]] === 0 ? multipliers[currentIndices[i][0]][currentIndices[i][1]] : 0);
        word.push(currentWord.charAt(i));
      }
      
      temp[playerTurn].words.push({word: word, mult: mult, points: currentScore, bingo: isThisABingo});
      temp[playerTurn].score += currentScore;
    }

    setPlayerInfo(temp);
  }

  const submit = () => {
    let nextTurn = playerTurn === playerInfo.length - 1 ? 0 : playerTurn+1;
    
    if (enteredWord.length > 0) {
      calculatePoints();

      let tempFinalizedLetters = [...finalizedLetters];
      for (let l of currentDisplayedWord) tempFinalizedLetters[l[0]][l[1]] = 1;

      setCurrentDisplayedWord([]);
      setEnteredWord('');
      setFinalizedLetters(tempFinalizedLetters);

      localStorage.setItem('currentGame', JSON.stringify({ info: playerInfo, currentTurn: nextTurn, boardLetters: boardLetters, finalizedLetters: finalizedLetters }));
    }

    setCurrentTile([-1, -1]);
    setPlayerTurn(nextTurn);
  }

  const undoLastTurn = () => {
    let turnQueueTemp = [...turnQueue];
    let lastTurn = turnQueueTemp.pop();

    if (lastTurn) {
      let playerInfoTemp = [...playerInfo];
      let pointsToRemove = playerInfoTemp[lastTurn.player].words.slice(-lastTurn.numWordsMade);
      
      let totalPointsToRemove = 0;
      for (let ptr of pointsToRemove) totalPointsToRemove+=ptr.points;

      playerInfoTemp[lastTurn.player].words = playerInfoTemp[lastTurn.player].words.slice(0, -lastTurn.numWordsMade);
      playerInfoTemp[lastTurn.player].score = playerInfoTemp[lastTurn.player].score - totalPointsToRemove;

      let boardLettersTemp = [...boardLetters];
      let finalizedLettersTemp = [...finalizedLetters];
      for (let indice of lastTurn.indices) {
        boardLettersTemp[indice[0]][indice[1]] = '';
        finalizedLettersTemp[indice[0]][indice[1]] = 0;
      }

      let newTurn = lastTurn.player;

      localStorage.setItem('turnQueue', JSON.stringify(turnQueueTemp));
      localStorage.setItem('currentGame', JSON.stringify({info: playerInfo, currentTurn: newTurn, boardLetters: boardLettersTemp, finalizedLetters: finalizedLettersTemp}));
      setTurnQueue(turnQueueTemp);
      setPlayerInfo(playerInfoTemp);
      setBoardLetters(boardLettersTemp);
      setFinalizedLetters(finalizedLettersTemp);
      setPlayerTurn(newTurn);
    }
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
    handleUIChange(2);

    localStorage.removeItem('currentGame');
    localStorage.removeItem('turnQueue');
    localStorage.removeItem('version');
  }

  const saveGame = () => {
    if (isGameSaved) return;

    let players: string[] = [];
    for (let p of playerInfo) players.push(p.name);
    players.sort();

    let gameInfo = playerInfo;
    let boardState = boardLetters;

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

  const handleUIChange = (num: number) => {
    setCurrentUI(num);
  }

  return (
    <div className="SimpleScrabbleV2">

      {showGame &&
        <div>
          <div className="WordEnterSection">
            <div className="InGameContainer">
              <div className="InGameBoardContainer">
                <div className="InGameScrabbleBoardWrapper">
                  <div className="InGameScrabbleBoard">
                    {multipliers.map((row, i) => (
                      <div className="Row" key={i}>
                        {row.map((val, k) => (
                          <span className="IndividualInGameBoardTiles" key={k}>
                            {boardLetters[i][k] === '' && !(currentTile[0] === i && currentTile[1] === k) ?
                              <span>
                                <button id={"EmptyTile" + val} onClick={() => setSelectedTile(i, k)}>{i === 7 && k === 7 ? "★" : ""}</button>
                              </span>
                              :
                              <span>
                                <button id={"FilledTile" + val}>{boardLetters[i][k]}</button>
                              </span>

                            }
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="PlayerInteractContainer">
                <div className="PlayerInteractSection">
                  {currentUI === 0 &&
                    <div className="InGamePlayerInteract">
                      <div className="UndoTurnSection">
                        <button onClick={() => undoLastTurn()}>undo last turn</button>
                      </div>

                      <div className="WordInputAndButtons">
                        <h2>{playerInfo[playerTurn].name}'s turn!</h2>

                        <div className="V1">
                          <input
                            placeholder={"scrabble"}
                            name="wordInput"
                            id="wordInput"
                            autoComplete='off'
                            value={enteredWord}
                            onChange={(e) => displayWord(e.target.value, horiztonal, currentTile[0], currentTile[1])}
                          />

                          <button className="submitWord" onClick={() => submit()}>{enteredWord === '' ? 'next turn' : 'end turn'}</button>

                          <p id='HowToTypeBlanks'>***note: for blanks, type '-'</p>

                          <div className="WordDirection">
                            <button className="HorizontalWD" id={"IsSelected" + horiztonal} onClick={() => setWordOrientation(true)}>horizontal</button>
                            <button className="VerticalWD" id={"IsSelected" + !horiztonal} onClick={() => setWordOrientation(false)}>vertical</button>
                          </div>
                        </div>

                        {/* <div className="V2">
                          {validLettersUpper.split("").map((letter, i) => (
                            <button className="SmallTile" id="color0">{letter}</button>
                          ))}
                        </div> */}
                      </div>

                      <div className="QuickScores">
                        <div className="IndividualQuickScoreContainer">
                          {playerInfo.map((info, i) => (
                            <div className='IndividualQuickScore'>
                              <h2>{info.name}<br></br>{info.score}</h2>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button className="EnterRemainingTiles" onClick={() => handleUIChange(1)}>enter remaining tiles</button>
                      <br></br>
                      <button className="LeaveMidGame" onClick={() => leaveGame()}>leave game</button>
                    </div>
                  }

                  {currentUI === 1 &&
                    <div className="RemainingTilesInput">
                      <h2>what tiles remain?</h2>
                      <div className="PlayerLastTilesSectionV2">
                        {playerInfo.map((info, i) => (
                          <div className="LastTilesInputV2" key={i}>
                            <h2>{info.name}</h2>

                            <div className="LastTilesTile">
                              {remainingLetters[i].letters.length > 0 ?
                                <div>
                                  {remainingLetters[i].letters.map((letter, j) => (
                                    <span className="IndividualTile" key={j}>
                                      <button className="SmallTile" id="color0">{letter}</button>
                                    </span>
                                  ))}
                                </div>
                                :
                                <div className="InvisiblePlaceholderTile">no tiles left</div>
                              }
                              
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
                        <button className="ContinueGame" onClick={() => handleUIChange(0)}>continue game</button>
                        <button className="FinalizeGame" onClick={() => finalizeGame()}>end game</button>
                      </div>
                    </div>
                  }

                  {currentUI === 2 &&
                    <div className="FinalScoresSection">
                      <h1>final scores</h1>

                      <div className="FinalScoreSectionsV2">
                        {playerInfo.map((info, i) => (
                          <div className="PlayerIndividualScoreV2" key={i}>
                            <h2>{info.name}</h2>

                            {info.score.toString().split('').map((num, k) => (
                              <span className="ScoreTiles" key={k}>
                                <button className="RegularTile">{num}</button>
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>

                      <div className="EndGameOptions">
                        <button className="ExitGame" onClick={() => leaveGame()}>exit game</button>
                        <button className="SaveGame" id={"gameSaved" + isGameSaved} onClick={() => saveGame()}>
                          {isSavingGame ?
                            <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
                            :
                            <span>{saveGameText}</span>
                          }
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="InGameWordCheck">
            < ScrabbleWordChecker />
          </div>
          
          <div className="ScoreInfo">
            <div className="ScoreTable">
              {playerInfo.map((info, i) => (
                <div className="PlayerScore" key={i}>
                  <h2>{info.name} • {info.score}</h2>

                  {info.words.map((wordInfo, k) => (
                    <div className="PlayerWordHistory" key={k}>
                      {wordInfo.word.map((letter, j) => (
                        <span className="IndividualTile" key={j}>
                          <button className="SmallTile" id={'color' + wordInfo.mult[j]}>{letter}</button>
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
        </div>
      }
    </div>
  );
}

export default SimpleScrabble;
