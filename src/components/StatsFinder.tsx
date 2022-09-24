import React, { useEffect, useState } from 'react';
import './styles/StatsFinder.css';
import { gql, useApolloClient } from '@apollo/client';
import GameHistoryGraph from './GameHistoryGraph';
import GameHistory from './GameHistory';

function StatsFinder() {
    const apolloClient = useApolloClient();

    const statOptions = ['game history', 'player stats', 'all time stats'];
    const [selectedOption, setSelectedOption] = useState(2);

    const numGameHSToDisplay = 5;
    const numWordHSToDisplay = 10;

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
        gameHighscores: {
            twoPlayer: { scrabbleGameId: string, score: number, date: string }[],
            threePlayer: { scrabbleGameId: string, score: number, date: string }[],
            fourPlayer: { scrabbleGameId: string, score: number, date: string }[]
        },
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
        gameHighscores: {
            twoPlayer: [],
            threePlayer: [],
            fourPlayer: []
        },
        wordHighscores: []
    };

    type AlltimeHSType = {
        gameHS: {
            twoPlayer: {
                player: string,
                score: number,
                date: string,
                scrabbleGameId: string
            }[],
            threePlayer: {
                player: string,
                score: number,
                date: string,
                scrabbleGameId: string
            }[],
            fourPlayer: {
                player: string,
                score: number,
                date: string,
                scrabbleGameId: string
            }[],
        },
        wordHS: {
            player: string,
            word: {
                word: string[],
                mult: number[],
                points: number,
                bingo: boolean
            }
        }[]
    }

    const [gameHistoryPlayers, setGameHistoryPlayers] = useState(['', '', '', '']);
    const [showGameHistory, setshowGameHistory] = useState(false);
    const [gameHistoryPlayersToSearch, setGameHistoryPlayersToSearch] = useState<string[]>([]);

    const [playerStatsName, setPlayerStatsName] = useState('');
    const [playerStats, setPlayerStats] = useState<playerStatsType>(emptyPlayerStats);
    const [showPlayerStats, setShowPlayerStats] = useState(false);
    const [loadingPlayerStats, setLoadingPlayerStats] = useState(false);
    const [playerNamesForGraph, setPlayerNamesForGraph] = useState<string[]>([]);

    const [loadingAlltimeStats, setLoadingAlltimeStats] = useState(false);
    const [alltimeStats, setAlltimeStats] = useState<AlltimeHSType>({gameHS: {twoPlayer: [], threePlayer: [], fourPlayer: []}, wordHS: []});
    const numAlltimeGames = 10;
    const numAlltimeWords = 10;

    const queryAlltimeStats = (numGameHS : number, numWordHS: number) => {
        const GET_ALLTIME_STATS = gql`
            query getAlltimeStats($numGameHS: Int, $numWordHS: Int) {
                getAlltimeStats(numGameHS: $numGameHS, numWordHS: $numWordHS) {
                    gameHS{
                        twoPlayer {
                            player
                            score
                            date
                            scrabbleGameId
                        }
                        threePlayer {
                            player
                            score
                            date
                            scrabbleGameId
                        }
                        fourPlayer {
                            player
                            score
                            date
                            scrabbleGameId
                        }
                    }
                    wordHS {
                        player
                        word {
                            word
                            mult
                            points
                            bingo
                        }
                        scrabbleGameId
                    }
                }
            }
        `;

        setLoadingAlltimeStats(true);

        apolloClient
            .query({
                query: GET_ALLTIME_STATS,
                variables: { numGameHS, numWordHS },
                fetchPolicy: 'network-only'
            })
            .then((res) => {
                setAlltimeStats(res.data.getAlltimeStats);
                setLoadingAlltimeStats(false);
            })
            .catch((err) => {
                console.log(err);
                setLoadingAlltimeStats(false);
            });
    }

    const getAlltimeStats = () => {
        if (alltimeStats.wordHS.length > 0) return;
        setLoadingAlltimeStats(true);
        queryAlltimeStats(numAlltimeGames, numAlltimeWords);
    }

    const selectStatOption = (i: number) => {
        if (i === 2) getAlltimeStats();

        setSelectedOption(i);
    }

    const isSelected = (i: number) => {
        return i === selectedOption;
    }

    const setPlayerHistoryName = (i: number, n: string) => {
        let temp = [...gameHistoryPlayers];
        temp[i] = n;
        setGameHistoryPlayers(temp);
    }

    const getGameHistory = () => {
        let players = [];
        for (let p of gameHistoryPlayers) if (p.length > 0) players.push(p);

        if (players.length === 0) return;

        setshowGameHistory(true);
        setGameHistoryPlayersToSearch(players);
    }

    const queryPlayerStats = (player: string, numGameHS: Number, numWordHS: Number) => {
        const GET_PLAYER_STATS = gql`
            query getPlayerStats($player: String, $numGameHS: Int, $numWordHS: Int) {
                getPlayerStats(player: $player, numGameHS: $numGameHS, numWordHS: $numWordHS) {
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
                        twoPlayer {
                            scrabbleGameId
                            score
                            date
                        }
                        threePlayer {
                            scrabbleGameId
                            score
                            date
                        }
                        fourPlayer {
                            scrabbleGameId
                            score
                            date
                        }
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
                variables: { player, numGameHS, numWordHS },
                fetchPolicy: 'network-only'
            })
            .then((res) => {
                setPlayerNamesForGraph([res.data.getPlayerStats.name]);
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

        queryPlayerStats(playerStatsName, numGameHSToDisplay, numWordHSToDisplay);
    }

    useEffect(() => {
        getAlltimeStats();
    }, []);

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

                    <div>
                        {gameHistoryPlayers.map((n: string, i: number) => (
                            <div className="GameHistoryPlayersInput" key={i}>
                                <input
                                    placeholder={"player " + (i + 1)}
                                    name="playerNameInput"
                                    id="playerNameInput"
                                    autoComplete='off'
                                    value={n}
                                    onChange={(e) => setPlayerHistoryName(i, e.currentTarget.value)}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault()
                                            getGameHistory();
                                        }
                                    }}
                                />
                            </div>
                        ))}
                        <button className="GameHistorySearch" onClick={() => getGameHistory()}>find</button>
                    </div>

                    {showGameHistory &&
                        <div>
                            <div className="GroupGameHistoryGraph">
                                <GameHistoryGraph names={gameHistoryPlayersToSearch} graphHeight={400} titleMsgBeginning={"your last"} titleMsgEnding={"games together"} />
                            </div>

                            <div className="GroupGameHistory">
                                <GameHistory names={gameHistoryPlayersToSearch} />
                            </div>
                        </div>
                    }
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
                            {playerStats.wordHighscores.length > 0 ?
                                <div>
                                    <div className="PlayerStatsTitle">
                                        <h1>viewing {playerStats.name}'s stats</h1>
                                    </div>

                                    <div className="PlayerRecentGames">
                                        <GameHistoryGraph names={playerNamesForGraph} graphHeight={375} titleMsgBeginning = {"your last"} titleMsgEnding = {"games"}/>
                                    </div>

                                    <div className="PlayerGameInfo">
                                        <table>
                                            <tr>
                                                <td>game mode</td>
                                                <td>games played</td>
                                                <td>wins</td>
                                                <td>average score</td>
                                            </tr>
                                            <tr>
                                                <td>2 players</td>
                                                <th>{playerStats.gamesInfo.twoPlayer.gamesPlayed}</th>
                                                <th>{playerStats.gamesInfo.twoPlayer.gamesWon}</th>
                                                <th>{playerStats.gamesInfo.twoPlayer.averageScore}</th>
                                            </tr>
                                            <tr>
                                                <td>3 players</td>
                                                <th>{playerStats.gamesInfo.threePlayer.gamesPlayed}</th>
                                                <th>{playerStats.gamesInfo.threePlayer.gamesWon}</th>
                                                <th>{playerStats.gamesInfo.threePlayer.averageScore}</th>
                                            </tr>
                                            <tr>
                                                <td>4 players</td>
                                                <th>{playerStats.gamesInfo.fourPlayer.gamesPlayed}</th>
                                                <th>{playerStats.gamesInfo.fourPlayer.gamesWon}</th>
                                                <th>{playerStats.gamesInfo.fourPlayer.averageScore}</th>
                                            </tr>
                                            <tr>
                                                <td>total</td>
                                                <th>{playerStats.gamesInfo.total.gamesPlayed}</th>
                                                <th>{playerStats.gamesInfo.total.gamesWon}</th>
                                                <th>-</th>
                                            </tr>
                                        </table>
                                    </div>

                                    <div className="PlayerHighscores">
                                        <div className="HighscoreTitle">
                                            <p>your top {numGameHSToDisplay} games</p>
                                        </div>

                                        <div className="HighscoreTableTitles">
                                            {/* <div><h2>scrabble game id</h2></div> */}
                                            <div><h2>2 player</h2></div>
                                            <div><h2>3 player</h2></div>
                                            <div><h2>4 player</h2></div>
                                        </div>

                                        <div className="HighscoreTable">
                                            <div className="TwoPlayerHighscores">
                                                {playerStats.gameHighscores.twoPlayer.length > 0 ?
                                                    <div>
                                                        {playerStats.gameHighscores.twoPlayer.map((gameScore, i) => (
                                                            <div className="IndividualPlayerHighscoreTiles" key={i}>
                                                                <div className="IndividualPlayerHighscoreBorder" />
                                                                <p>{new Date(gameScore.date).toLocaleString().slice(0, -6) + new Date(gameScore.date).toLocaleString().slice(-3)}</p>
                                                                {gameScore.score.toString().split('').map((num, k) => (
                                                                    <span key={k}>
                                                                        <button className="HighscoreTiles" id='color0'>{num}</button>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    :
                                                    <div className="NoGameHighscoresFound">
                                                        <div className="IndividualPlayerHighscoreBorder" />
                                                        <p>no stats found</p>
                                                    </div>
                                                }

                                            </div>

                                            <div className="ThreePlayerHighscores">
                                                {playerStats.gameHighscores.threePlayer.length > 0 ?
                                                    <div>
                                                        {playerStats.gameHighscores.threePlayer.map((gameScore, i) => (
                                                            <div className="IndividualPlayerHighscoreTiles" key={i}>
                                                                <div className="IndividualPlayerHighscoreBorder" />
                                                                <p>{new Date(gameScore.date).toLocaleString().slice(0, -6) + new Date(gameScore.date).toLocaleString().slice(-3)}</p>
                                                                {gameScore.score.toString().split('').map((num, k) => (
                                                                    <span key={k}>
                                                                        <button className="HighscoreTiles" id='color0'>{num}</button>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    :
                                                    <div className="NoGameHighscoresFound">
                                                        <div className="IndividualPlayerHighscoreBorder" />
                                                        <p>no stats found</p>
                                                    </div>
                                                }
                                            </div>

                                            <div className="FourPlayerHighscores">
                                                {playerStats.gameHighscores.fourPlayer.length > 0 ?
                                                    <div>
                                                        {playerStats.gameHighscores.fourPlayer.map((gameScore, i) => (
                                                            <div className="IndividualPlayerHighscoreTiles" key={i}>
                                                                <div className="IndividualPlayerHighscoreBorder" />
                                                                <p>{new Date(gameScore.date).toLocaleString().slice(0, -6) + new Date(gameScore.date).toLocaleString().slice(-3)}</p>
                                                                {gameScore.score.toString().split('').map((num, k) => (
                                                                    <span key={k}>
                                                                        <button className="HighscoreTiles" id='color0'>{num}</button>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    :
                                                    <div className="NoGameHighscoresFound">
                                                        <div className="IndividualPlayerHighscoreBorder" />
                                                        <p>no stats found</p>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div className="PlayerWordHighscores">
                                        <div className="WordHighscoreTitle">
                                            <p>your top {numWordHSToDisplay} words</p>
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

            {isSelected(2) &&
                <div className="ViewAlltimeStats">
                    { loadingAlltimeStats ?
                        <div className="lds-ellipsis-stats"><div></div><div></div><div></div><div></div></div>

                        :

                        <div className="AlltimeHighscores">
                            <div className="PlayerStatsTitle">
                                <h1>all time stats</h1>
                            </div>

                            <div className="AlltimeGameHS">
                                <div className="HighscoreTitle">
                                    <p>top {numAlltimeGames} game scores</p>
                                </div>

                                <div className="HighscoreTableTitles">
                                    <div><h2>2 player</h2></div>
                                    <div><h2>3 player</h2></div>
                                    <div><h2>4 player</h2></div>
                                </div>

                                <div className="HighscoreTable">
                                    <div className="TwoPlayerHighscores">
                                        {alltimeStats.gameHS.twoPlayer.length > 0 ?
                                            <div>
                                                {alltimeStats.gameHS.twoPlayer.map((gameScore, i) => (
                                                    <div className="IndividualPlayerHighscoreTiles" key={i}>
                                                        <div className="IndividualPlayerHighscoreBorder" />
                                                        <p><span className="AlltimeGameHSName">{gameScore.player}</span>&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{new Date(gameScore.date).toLocaleDateString()}</p>
                                                        {gameScore.score.toString().split('').map((num, k) => (
                                                            <span key={k}>
                                                                <button className="HighscoreTiles" id='color0'>{num}</button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                            :
                                            <div className="NoGameHighscoresFound">
                                                <div className="IndividualPlayerHighscoreBorder" />
                                                <p>no stats found</p>
                                            </div>
                                        }

                                    </div>

                                    <div className="ThreePlayerHighscores">
                                        {alltimeStats.gameHS.threePlayer.length > 0 ?
                                            <div>
                                                {alltimeStats.gameHS.threePlayer.map((gameScore, i) => (
                                                    <div className="IndividualPlayerHighscoreTiles" key={i}>
                                                        <div className="IndividualPlayerHighscoreBorder" />
                                                        <p><span className="AlltimeGameHSName">{gameScore.player}</span>&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{new Date(gameScore.date).toLocaleDateString()}</p>
                                                        {gameScore.score.toString().split('').map((num, k) => (
                                                            <span key={k}>
                                                                <button className="HighscoreTiles" id='color0'>{num}</button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                            :
                                            <div className="NoGameHighscoresFound">
                                                <div className="IndividualPlayerHighscoreBorder" />
                                                <p>no stats found</p>
                                            </div>
                                        }
                                    </div>

                                    <div className="FourPlayerHighscores">
                                        {alltimeStats.gameHS.fourPlayer.length > 0 ?
                                            <div>
                                                {alltimeStats.gameHS.fourPlayer.map((gameScore, i) => (
                                                    <div className="IndividualPlayerHighscoreTiles" key={i}>
                                                        <div className="IndividualPlayerHighscoreBorder" />
                                                        <p><span className="AlltimeGameHSName">{gameScore.player}</span>&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{new Date(gameScore.date).toLocaleDateString()}</p>
                                                        {gameScore.score.toString().split('').map((num, k) => (
                                                            <span key={k}>
                                                                <button className="HighscoreTiles" id='color0'>{num}</button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                            :
                                            <div className="NoGameHighscoresFound">
                                                <div className="IndividualPlayerHighscoreBorder" />
                                                <p>no stats found</p>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="AlltimeWordHS">
                                <div className="WordHighscoreTitle">
                                    <p>top {numAlltimeWords} word scores</p>
                                </div>

                                <div>
                                    {alltimeStats.wordHS.map((wordHSInfo, i) => (
                                        <div key={i}>
                                            <div className="IndividualPlayerWordHighscore">
                                                <span className="AlltimeWordHSName">{wordHSInfo.player}</span>

                                                {wordHSInfo.word.word.map((letter, y) => (
                                                    <span key={y}>
                                                        {letter === '_' ?
                                                            <button className="WordHSTile" id={'color' + wordHSInfo.word.mult[y]} />
                                                            :
                                                            <button className="WordHSTile" id={'color' + wordHSInfo.word.mult[y]}>{letter}</button>
                                                        }
                                                    </span>
                                                ))}

                                                <span className="PlayerWordHS">{wordHSInfo.word.points}</span>

                                                {wordHSInfo.word.bingo &&
                                                    <span className="BingoWord"> ★</span>
                                                }
                                            </div>
                                        </div>

                                    ))}
                                </div>
                            </div>
                        </div>
                    }
                </div>
            }
        </div>
    );
}

export default StatsFinder;
