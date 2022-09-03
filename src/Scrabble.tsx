import React, { useState } from 'react';
import './Scrabble.css';

function ScrabbleLogic() {
    /* PLAYER CHOOSE */
    const [gameSetup, setGameSetup] = useState(true);
    const [enterPlayerNames, setEnterPlayerNames] = useState(false);
    const [numPlayers, setNumPlayers] = useState(0);
    const [playerNames, setPlayerNames] = useState(['', '', '', '']);
    const [playerScores, setPlayerScores] = useState([0, 0, 0, 0]);

    const chooseNumPlayers = (n: number) => {
        setNumPlayers(n);
        setEnterPlayerNames(true);
    }

    const setPlayerName = (n: string, i: number) => {
        let temp = [...playerNames];
        temp[i] = n;
        setPlayerNames(temp);
    }

    const startGame = () => {
        setGameSetup(false);
        setCurrentWord([]);
    }

    /* GAME */
    const [playerTurn, setPlayerTurn] = useState(0);
    const [currentWord, setCurrentWord] = useState([[-1, -1]]);

    const [showAlphabet, setShowAlphabet] = useState(false);
    const [currentClickedTile, setCurrentClickedTile] = useState([-1, -1]);

    const [boardLetters, setBoardLetters] = useState(
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
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '']]);

    const [finalizedLetters, setFinalizedLetters] = useState(
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
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]);

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

    const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '-'];

    const clickTile = (i: number, k: number) => {
        if (boardLetters[i][k] === '?') {
            let temp = [...boardLetters];
            temp[i][k] = '';
            setBoardLetters(temp);

            let temp2 = [...currentWord];
            temp2.splice(temp2.indexOf(currentClickedTile), 1);
            setCurrentWord(temp2);

            setShowAlphabet(false);
            setCurrentClickedTile([-1, -1]);
        } else if (finalizedLetters[i][k] === 0) {
            setShowAlphabet(true);
            let temp = [...boardLetters];
            temp[i][k] = '?';
            setBoardLetters(temp);
            setCurrentClickedTile([i, k]);
        }
    }

    const setTile = (letter: string) => {
        let temp = [...boardLetters];
        temp[currentClickedTile[0]][currentClickedTile[1]] = letter;
        setBoardLetters(temp);
        
        let temp2 = [...currentWord];
        temp2.push(currentClickedTile);
        setCurrentWord(temp2);
    }

    const calcScore = () => {
        
    }

    const handleEndTurn = () => {
        console.log(currentWord);
    }

    return (
        <div className="Container">
            {gameSetup ?
                <div className="GameSetup">
                    {enterPlayerNames ?
                        <div className="EnterNames">
                            <h1>Enter player names</h1>
                            <div className="NameInput">
                                <input
                                    placeholder="Player 1"
                                    name="playerNameInput"
                                    id="playerNameInput"
                                    value={playerNames[0]}
                                    onChange={(e) => setPlayerName(e.target.value, 0)}
                                />
                            </div>

                            <div className="NameInput">
                                <input
                                    placeholder="Player 2"
                                    name="playerNameInput"
                                    id="playerNameInput"
                                    value={playerNames[1]}
                                    onChange={(e) => setPlayerName(e.target.value, 1)}
                                />
                            </div>

                            {numPlayers > 2 &&
                                <div className="NameInput">
                                    <input
                                        placeholder="Player 3"
                                        name="playerNameInput"
                                        id="playerNameInput"
                                        value={playerNames[2]}
                                        onChange={(e) => setPlayerName(e.target.value, 2)}
                                    />
                                </div>
                            }

                            {numPlayers > 3 &&
                                <div className="NameInput">
                                    <input
                                        placeholder="Player 4"
                                        name="playerNameInput"
                                        id="playerNameInput"
                                        value={playerNames[3]}
                                        onChange={(e) => setPlayerName(e.target.value, 3)}
                                    />
                                </div>
                            }

                            <button className="confirmPlayerNames" onClick={() => startGame()}>Confirm</button>
                        </div>
                        :
                        <div className="ChoosePlayers">
                            <h1>How many players are there?</h1>
                            <div className="ChoosePlayerButtons">
                                <button className="choosePlayerButton" onClick={() => chooseNumPlayers(2)}>2</button>
                                <button className="choosePlayerButton" onClick={() => chooseNumPlayers(3)}>3</button>
                                <button className="choosePlayerButton" onClick={() => chooseNumPlayers(4)}>4</button>
                            </div>
                        </div>

                    }
                </div>
                :
                <div className="Scrabble">
                    <h1>It is {playerNames[playerTurn]}'s turn!</h1>
                    <button className="endTurn" onClick={() => handleEndTurn()}>End turn</button>
                    <div className="ScrabbleBoard">
                        {boardLetters.map((row, i) => (
                            <div className="ScrabbleBoardRow" key={i}>
                                {row.map((tile, k) => (
                                    <div className="Buttons" key={i * 15 + k}>
                                        {tile === '' ?
                                            <button className={"button" + multipliers[i][k]} key={i * 15 + k} onClick={() => clickTile(i, k)}></button>
                                            :
                                            <button className="button" key={i * 15 + k} onClick={() => clickTile(i, k)}>{tile}</button>
                                        }
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {showAlphabet &&
                        <div className="Alphabet">
                            {alphabet.map((letter, i) => (
                                <button className="alpha" key={i} onClick={() => setTile(letter)}>{letter}</button>
                            ))}
                        </div>
                    }
                </div >

            }
        </div>

    );
}

export default ScrabbleLogic;