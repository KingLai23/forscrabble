import React, { useState } from 'react';
import './styles/Home.css';
import ScrabbleLogic from './SimpleScrabble';
import Stats from './StatsFinder';

function Home() {
    const [pregame, setPregame] = useState(true);
    const [enteredNames, setEnteredNames] = useState(['', '', '', '']);

    const setName = (i: number, n: string) => {
        let temp = [...enteredNames];
        temp[i] = n;
        setEnteredNames(temp);
    }

    const startGame = () => {
        for (let name of enteredNames) {
            if (name.length > 0) setPregame(false);
        }
    }

    const handleNewGame = () => {
        setEnteredNames(['', '', '', '']);
        setPregame(true);
    }

    return (
        <div className="HomePageContainer">
            {pregame ?
                <div className="HomePage">
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

                        <button className="confirmPlayerNames" onClick={() => startGame()}>start game</button>
                        {/* <br></br>
                  <button className="GetGameHistoryBefore" onClick={() => getGameHistoryBeforeGame()}>
                      {isLoadingGameHistory ?
                          <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
                          :
                          <span>see game history</span>
                      }
                  </button> */}
                    </div>

                    <div className="Stats">
                        <Stats />
                    </div>
                </div>

                :

                <div className="ScrabbleGame">
                    <ScrabbleLogic names = {enteredNames} handleNewGame = {handleNewGame} />
                </div>
            }
        </div>
    );
}

export default Home;