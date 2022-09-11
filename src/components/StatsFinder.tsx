
import React, { useState } from 'react';
import './styles/StatsFinder.css';
import { gql, useApolloClient } from '@apollo/client';

function StatsFinder() {
    const apolloClient = useApolloClient();

    const statOptions = ['game history', 'player stats'];
    const [selectedOption, setSelectedOption] = useState(1);

    const [playerHSName, setPlayerHSName] = useState('');
    const [playerHighscores, setPlayerHighscores] = useState<{ scrabbleGameId: string, score: number }[]>([]);
    const [showPlayerHighscores, setShowPlayerHighscores] = useState(false);
    const [loadingPlayerHS, setLoadingPlayerHS] = useState(false);

    const [playerWordHSName, setPlayerWordHSName] = useState('');
    const [playerWordHS, setPlayerWordHS] = useState<{ word: string[], mult: number[], bingo: boolean, points: number }[]>([]);
    const [showPlayerWordHS, setShowPlayerWordHS] = useState(false);
    const [loadingPlayerWordHS, setLoadingPlayerWordHS] = useState(false);

    type playerStatsType = {
        name: string,
        gamesInfo: {
            twoPlayer: {
                gamesPlayed: number,
                gamesWon: number,
                averageScore: number
            },
            threePlayer: {
                gamesPlayed: number,
                gamesWon: number,
                averageScore: number
            },
            fourPlayer: {
                gamesPlayed: number,
                gamesWon: number,
                averageScore: number
            },
            total: {
                gamesPlayed: number,
                gamesWon: number,
                averageScore: number
            }
        },
        gameHighscores: { scrabbleGameId: string, score: number, date: string }[],
        wordHighscores: { word: string[], mult: number[], bingo: boolean, points: number }[]
    };

    const emptyPlayerStats : playerStatsType = {
        name: "",
        gamesInfo: {
            twoPlayer: {
                gamesPlayed: 0,
                gamesWon: 0,
                averageScore: 0
            },
            threePlayer: {
                gamesPlayed: 0,
                gamesWon: 0,
                averageScore: 0
            },
            fourPlayer: {
                gamesPlayed: 0,
                gamesWon: 0,
                averageScore: 0
            },
            total: {
                gamesPlayed: 0,
                gamesWon: 0,
                averageScore: 0
            }
        },
        gameHighscores: [],
        wordHighscores: []
    };

    const [playerStatsName, setPlayerStatsName] = useState('');
    const [playerStats, setPlayerStats] = useState<playerStatsType>(emptyPlayerStats);
    const [showPlayerStats, setShowPlayerStats] = useState(false);
    const [loadingPlayerStats, setLoadingPlayerStats] = useState(false);

    const selectStatOption = (i: number) => {
        setSelectedOption(i);
    }

    const isSelected = (i: number) => {
        return i === selectedOption;
    }

    // const getGameHistoryBeforeGame = () => {
    //     let players = [];
    //     for (let n of enteredNames) {
    //         if (n.length > 0) {
    //             players.push(n);
    //         }
    //     }
    //     players.sort();

    //     if (players.length > 0) getGames(players);
    // }

    const queryGameHighscores = (player: string) => {
        const GET_GAME_HIGHSCORES = gql`
            query getHighscoresOfAPlayer($player: String) {
                getHighscoresOfAPlayer(player: $player) {
                    scrabbleGameId
                    score
                }
            }
        `;

        setLoadingPlayerHS(true);

        apolloClient
            .query({
                query: GET_GAME_HIGHSCORES,
                variables: { player },
                fetchPolicy: 'network-only'
            })
            .then((res) => {
                setPlayerHighscores(res.data.getHighscoresOfAPlayer);
                setShowPlayerHighscores(true);
                setLoadingPlayerHS(false);
            })
            .catch((err) => {
                console.log(err);
                setLoadingPlayerHS(false);
            });
    }

    const getGameHighScores = () => {
        if (loadingPlayerHS || playerHSName === '') return;

        setShowPlayerHighscores(false);
        setPlayerHighscores([]);

        queryGameHighscores(playerHSName);
    }

    const queryWordHighscores = (player: string) => {
        const GET_WORD_HIGHSCORES = gql`
            query getHighestSingleWordScoresOfAPlayer($player: String) {
                getHighestSingleWordScoresOfAPlayer(player: $player) {
                    word
                    mult
                    bingo
                    points
                }
            }
        `;

        setLoadingPlayerWordHS(true);

        apolloClient
            .query({
                query: GET_WORD_HIGHSCORES,
                variables: { player },
                fetchPolicy: 'network-only'
            })
            .then((res) => {
                setPlayerWordHS(res.data.getHighestSingleWordScoresOfAPlayer);
                setShowPlayerWordHS(true);
                setLoadingPlayerWordHS(false);
            })
            .catch((err) => {
                console.log(err);
                setLoadingPlayerWordHS(false);
            });
    }

    const getWordHighscores = () => {
        if (loadingPlayerWordHS || playerWordHSName === '') return;

        setShowPlayerWordHS(false);
        setPlayerWordHS([]);

        queryWordHighscores(playerWordHSName);
    }

    const queryPlayerStats = (player: string) => {
        const GET_PLAYER_STATS = gql`
            query getPlayerStats($player: String) {
                getPlayerStats(player: $player) {
                    name
                    gamesInfo {
                        twoPlayer {
                          gamesPlayed
                          gamesWon
                          averageScore
                        }
                        threePlayer {
                          gamesPlayed
                          gamesWon
                          averageScore
                        }
                        fourPlayer {
                          gamesPlayed
                          gamesWon
                          averageScore
                        }
                        total {
                          gamesPlayed
                          gamesWon
                          averageScore
                        }
                    }
                    gameHighscores {
                        scrabbleGameId
                        score
                        date
                    }
                    wordHighscores {
                        word
                        mult
                        points
                        bingo
                    }
                }
            }
        `;

        setLoadingPlayerStats(true);

        apolloClient
            .query({
                query: GET_PLAYER_STATS,
                variables: { player },
                fetchPolicy: 'network-only'
            })
            .then((res) => {
                setPlayerStats(res.data.getPlayerStats);
                setShowPlayerStats(true);
                setLoadingPlayerStats(false);
            })
            .catch((err) => {
                console.log(err);
                setLoadingPlayerStats(false);
            });
    }

    const getPlayerStats = () => {
        if (loadingPlayerStats || playerStatsName === '') return;

        setShowPlayerStats(false);
        setPlayerStats(emptyPlayerStats);

        queryPlayerStats(playerStatsName);
    }

    return (
        <div className="StatsFinder">
            <h1>find some stats here</h1>
        
            <div className="StatOptions">
                {statOptions.map((option, i) => (
                    <button className="StatOption" id={"isSelected" + isSelected(i)} key={i} onClick={() => selectStatOption(i)}>{option}</button>
                ))}
                
            </div>

            {isSelected(0) &&
                <div className="ViewGameHistory">
                    <div id="statInstruction"><p>enter some player names and view all the games they played together</p></div>
                </div>
            }

            {isSelected(1) &&
                <div className="ViewPlayerStats">
                    <div id="statInstruction"><p>enter a player name and view their stats</p></div>

                    <div className="StatsPlayerNameInput">
                        <input
                            placeholder={"player"}
                            name="playerNameInput"
                            id="playerNameInput"
                            autoComplete='off'
                            value={playerStatsName}
                            onChange={(e) => setPlayerStatsName(e.currentTarget.value)}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault()
                                    getPlayerStats();
                                }
                            }}
                        />

                        <button className="StatOptionSearch" onClick={() => getPlayerStats()}>find</button>
                    </div>

                    {loadingPlayerStats &&
                        <div className="lds-ellipsis-stats"><div></div><div></div><div></div><div></div></div>
                    }

                    {showPlayerStats &&
                        <div className="PlayerStats">
                            {playerStats.gameHighscores.length > 0 ?
                                <div>
                                    <div className="PlayerStatsTitle">
                                        <h1>viewing {playerStats.name}'s stats</h1>
                                    </div>

                                    <div className="PlayerGameInfo">
                                        <table>
                                            <tr>
                                                <th>game mode</th>
                                                <th>games played</th>
                                                <th>wins</th>
                                                <th>average score</th>
                                            </tr>
                                            <tr>
                                                <td>2 players</td>
                                                <td>{playerStats.gamesInfo.twoPlayer.gamesPlayed}</td>
                                                <td>{playerStats.gamesInfo.twoPlayer.gamesWon}</td>
                                                <td>{playerStats.gamesInfo.twoPlayer.averageScore}</td>
                                            </tr>
                                            <tr>
                                                <td>3 players</td>
                                                <td>{playerStats.gamesInfo.threePlayer.gamesPlayed}</td>
                                                <td>{playerStats.gamesInfo.threePlayer.gamesWon}</td>
                                                <td>{playerStats.gamesInfo.threePlayer.averageScore}</td>
                                            </tr>
                                            <tr>
                                                <td>4 players</td>
                                                <td>{playerStats.gamesInfo.fourPlayer.gamesPlayed}</td>
                                                <td>{playerStats.gamesInfo.fourPlayer.gamesWon}</td>
                                                <td>{playerStats.gamesInfo.fourPlayer.averageScore}</td>
                                            </tr>
                                            <tr>
                                                <td>total</td>
                                                <td>{playerStats.gamesInfo.total.gamesPlayed}</td>
                                                <td>{playerStats.gamesInfo.total.gamesWon}</td>
                                                <td>{playerStats.gamesInfo.total.averageScore}</td>
                                            </tr>
                                        </table>
                                    </div>

                                    <div className="PlayerHighscores">
                                        <div className="HighscoreTitle">
                                            <h1>your top 10 games</h1>
                                        </div>

                                        <div className="HighscoreTableTitles">
                                            {/* <div><h2>scrabble game id</h2></div> */}
                                            <div><h2>date</h2></div>
                                            <div><h2>game score</h2></div>
                                        </div>

                                        <div>
                                            {playerStats.gameHighscores.map((highscore, i) => (
                                                <div key={i}>
                                                    <div className="IndividualPlayerHighscoreBorder" />
                                                    <div className="IndividualPlayerHighscore">
                                                        {/* <div><p>{highscore.scrabbleGameId}</p></div> */}
                                                        <div><p>{new Date(highscore.date).toLocaleString()}</p></div>
                                                        <div className="IndividualPlayerHighscoreTiles">
                                                            {highscore.score.toString().split('').map((num, k) => (
                                                                <span className="HighscoreTiles" key={k}>
                                                                    <button>{num}</button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="PlayerWordHighscores">
                                        <div className="WordHighscoreTitle">
                                            <h2>your top 10 words</h2>
                                        </div>

                                        <div>
                                            {playerStats.wordHighscores.map((highscore, i) => (
                                                <div key={i}>
                                                    <div className="IndividualPlayerWordHighscore">
                                                        {highscore.word.map((letter, y) => (
                                                            <span key={y}>
                                                                {highscore.word[y] === '_' ?
                                                                    <button className="WordHSTile" id={'color' + highscore.mult[y]} />
                                                                    :
                                                                    <button className="WordHSTile" id={'color' + highscore.mult[y]}>{letter}</button>
                                                                }
                                                            </span>
                                                        ))}

                                                        <span className="PlayerWordHS">{highscore.points}</span>

                                                        {highscore.bingo &&
                                                            <span className="BingoWord"> ★</span>
                                                        }
                                                    </div>
                                                </div>

                                            ))}
                                        </div>
                                    </div>
                                </div>
                                :

                                <div className="NoRecordsFound">
                                    <p>no games found :(</p>
                                </div>
                            }

                        </div>
                    }
                </div>
            }

            {isSelected(-1) &&
                <div className="ViewGameHighscores">
                    <div id="statInstruction"><p>enter a player name and view their top 10 game scores</p></div>

                    <div className="StatsPlayerNameInput">
                        <input
                            placeholder={"player"}
                            name="playerNameInput"
                            id="playerNameInput"
                            autoComplete='off'
                            value={playerHSName}
                            onChange={(e) => setPlayerHSName(e.currentTarget.value)}
                        />

                        <button className="StatOptionSearch" onClick={() => getGameHighScores()}>find</button>
                    </div>

                    { loadingPlayerHS &&
                        <div className="lds-ellipsis-stats"><div></div><div></div><div></div><div></div></div>
                    }

                    { showPlayerHighscores &&
                        <div className="PlayerHighscores">
                            <div className="HighscoreTableTitles">
                                <div><h2>scrabble game id</h2></div>
                                <div><h2>game score</h2></div>
                            </div>

                            {playerHighscores.length > 0 ?
                                <div>
                                    {playerHighscores.map((highscore, i) => (
                                        <div key={i}>
                                            <div className="IndividualPlayerHighscoreBorder" />
                                            <div className="IndividualPlayerHighscore">
                                                <div><p>{highscore.scrabbleGameId}</p></div>

                                                <div>
                                                    {highscore.score.toString().split('').map((num, k) => (
                                                        <span className="HighscoreTiles" key={k}>
                                                            <button>{num}</button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                :

                                <div className="NoRecordsFound">
                                    <p>no games found :(</p>
                                </div>
                            }
                            
                        </div>
                    }
                </div>
            }

            {isSelected(-1) &&
                <div className="ViewWordHighscores">
                    <div id="statInstruction"><p>enter a player name and view their top 10 word scores</p></div>

                    <div className="StatsPlayerNameInput">
                        <input
                            placeholder={"player"}
                            name="playerNameInput"
                            id="playerNameInput"
                            autoComplete='off'
                            value={playerWordHSName}
                            onChange={(e) => setPlayerWordHSName(e.currentTarget.value)}
                        />

                        <button className="StatOptionSearch" onClick={() => getWordHighscores()}>find</button>
                    </div>

                    { loadingPlayerWordHS &&
                        <div className="lds-ellipsis-stats"><div></div><div></div><div></div><div></div></div>
                    }

                    { showPlayerWordHS &&
                        <div className="PlayerWordHighscores">
                            <div className="WordHighscoreTitle">
                                <h2>your best words</h2>
                            </div>

                            {playerWordHS.length > 0 ?
                                <div>
                                    {playerWordHS.map((highscore, i) => (
                                        <div key={i}>
                                            <div className="IndividualPlayerWordHighscore">
                                                {highscore.word.map((letter, y) => (
                                                    <span key={y}>
                                                        {highscore.word[y] === '_' ?
                                                            <button className="WordHSTile" id={'color' + highscore.mult[y]} />
                                                            :
                                                            <button className="WordHSTile" id={'color' + highscore.mult[y]}>{letter}</button>
                                                        }
                                                    </span>
                                                ))}

                                                <span className="PlayerWordHS">{highscore.points}</span>

                                                {highscore.bingo &&
                                                    <span className="BingoWord"> ★</span>
                                                }
                                            </div>
                                        </div>

                                    ))}
                                </div>

                                :

                                <div className="NoRecordsFound">
                                    <p>no words found :(</p>
                                </div>
                            }
                            
                        </div>
                    }
                </div>
            }
        </div>
    );
}

export default StatsFinder;

