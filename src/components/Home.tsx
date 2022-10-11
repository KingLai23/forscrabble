import React, { useEffect, useState } from 'react';
import './styles/Home.css';
import ScrabbleLogic from './SimpleScrabble';
import SimpleScrabble from './SimpleScrabbleV2';
import Stats from './StatsFinder';
import ScrabbleWordChecker from './ScrabbleWordChecker';

function Home() {
    const [pregame, setPregame] = useState(true);
    const [enteredNames, setEnteredNames] = useState(['', '', '', '']);

    const [foundExistingGame, setFoundExistingGame] = useState(false);
    const [useExistingGame, setUseExistingGame] = useState(true);

    const [version, setVersion] = useState(0);

    const checkForExistingGame = () => {
        let currentGame = localStorage.getItem('currentGame');
        if (currentGame) setFoundExistingGame(true);
    }

    useEffect(() => {
        checkForExistingGame();
    }, []);

    const continueExistingGame = () => {
        setVersion(parseInt(localStorage.getItem('version') || '1'));
        setPregame(false);
    }

    const setName = (i: number, n: string) => {
        let temp = [...enteredNames];
        temp[i] = n;
        setEnteredNames(temp);
    }

    const startGame = () => {
        let numNames = 0;
        for (let name of enteredNames) if (name.length > 0) numNames++;

        if (numNames > 1) {
            setUseExistingGame(false);
            localStorage.removeItem('currentGame');
            setPregame(false);
        }
    }

    const handleNewGame = () => {
        setEnteredNames(['', '', '', '']);
        setFoundExistingGame(false);
        setUseExistingGame(true);
        checkForExistingGame();
        setPregame(true);
    }

    const handleVersionSelect = (n: number) => {
        setVersion(n);
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

                        <div className="VersionSelect">
                            <p>*pick a version to use*</p>

                            <button id={"isThisVersion" + (version === 0)} onClick={() => handleVersionSelect(0)}>new</button>
                            <button id={"isThisVersion" + (version === 1)} onClick={() => handleVersionSelect(1)}>classic</button>
                        </div>
                    </div>
                    
                    <div className="HomePageScrabbleWordChecker">
                        <ScrabbleWordChecker />
                    </div>
                    
                    <Stats />
                </div>

                :

                <div className="ScrabbleGame">
                    {/* <SimpleScrabble names = {enteredNames} continueGame = {useExistingGame} handleNewGame = {handleNewGame}/> */}
                    {version === 0 ?
                        <SimpleScrabble names = {enteredNames} continueGame = {useExistingGame} handleNewGame = {handleNewGame}/>
                        :
                        <ScrabbleLogic names = {enteredNames} continueGame = {useExistingGame} handleNewGame = {handleNewGame} />
                    }
                </div>
            }
        </div>
    );
}

export default Home;