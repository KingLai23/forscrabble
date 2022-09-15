import React, { useEffect, useState } from 'react';
import './styles/Home.css';
import ScrabbleLogic from './SimpleScrabble';
import Stats from './StatsFinder';
import ScrabbleWordChecker from './ScrabbleWordChecker';

function Home() {
    const [pregame, setPregame] = useState(true);
    const [enteredNames, setEnteredNames] = useState(['', '', '', '']);

    const [foundExistingGame, setFoundExistingGame] = useState(false);
    const [useExistingGame, setUseExistingGame] = useState(true);

    const checkForExistingGame = () => {
        let currentGame = localStorage.getItem('currentGame');
        if (currentGame) setFoundExistingGame(true);
    }

    useEffect(() => {
        checkForExistingGame();
    }, []);

    const continueExistingGame = () => {
        setPregame(false);
    }

    const setName = (i: number, n: string) => {
        let temp = [...enteredNames];
        temp[i] = n;
        setEnteredNames(temp);
    }

    const startGame = () => {
        for (let name of enteredNames) {
            if (name.length > 0) {
                setUseExistingGame(false);
                localStorage.removeItem('currentGame');
                setPregame(false);
            }
        }
    }

    const handleNewGame = () => {
        setEnteredNames(['', '', '', '']);
        setFoundExistingGame(false);
        setUseExistingGame(true);
        checkForExistingGame();
        setPregame(true);
    }

    return (
        <div className="HomePageContainer">
            {pregame ?
                <div className="HomePage">
                    <div className="NameScreen">
                        {foundExistingGame &&
                            <div className="FoundExistingGame">
                                <span>an existing game was found, would you like to continue playing it?</span>
                                <button className="continueExistingGame" onClick={() => continueExistingGame()}>yes</button>
                                <p>if you start a new game, it will overwrite the existing game</p>
                            </div>
                        }

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

                        <button className="confirmPlayerNames" onClick={() => startGame()}>start game</button>

                    </div>

                    <ScrabbleWordChecker />

                    <Stats />
                </div>

                :

                <div className="ScrabbleGame">
                    <ScrabbleLogic names = {enteredNames} continueGame = {useExistingGame} handleNewGame = {handleNewGame} />
                </div>
            }
        </div>
    );
}

export default Home;