import React, { useState } from 'react';
import './styles/StatsFinder.css';
import { gql, useApolloClient } from '@apollo/client';
import Chart from "react-apexcharts";

function StatsFinder() {
    const apolloClient = useApolloClient();

    const statOptions = ['game history', 'player stats'];
    const [selectedOption, setSelectedOption] = useState(1);

    const numGameHSToDisplay = 5;
    const numWordHSToDisplay = 10;
    const numGameHistoryToDisplay = 10;

    type gameHistoryType = {
        players: string[],
        gamesTogether: {
            scrabbleGameId: string,
            date: string,
            scores: [number]
        }[]
    }

    const emptyGameHistory : gameHistoryType = {
        players: [],
        gamesTogether: []
    }

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

    const [gameHistoryPlayers, setGameHistoryPlayers] = useState(['', '', '', '']);
    const [gameHistory, setGameHistory] = useState<gameHistoryType>(emptyGameHistory);
    const [showGameHistory, setshowGameHistory] = useState(false);
    const [loadingGameHistory, setLoadingGameHistory] = useState(false);

    const [playerStatsName, setPlayerStatsName] = useState('');
    const [playerStats, setPlayerStats] = useState<playerStatsType>(emptyPlayerStats);
    const [showPlayerStats, setShowPlayerStats] = useState(false);
    const [loadingPlayerStats, setLoadingPlayerStats] = useState(false);

    const getClickedGame = (index: number) => {
        console.log(gameHistory.gamesTogether[index]);
    }

    const [graphOptions, setGraphOptions] = useState({
        options: {
            chart: {
                id: "game-history",
                stroke: {
                    curve: 'smooth'
                },
                colors: ["#00d0ff", "#ff1900", "#00ff51", "#e5ff00"],
                toolbar: {
                    show: true,
                    tools: {
                        download: false,
                        selection: false,
                        zoom: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,
                        reset: false,
                        customIcons: []
                    }
                },
                events: {
                    markerClick: function(event: any, chartContext: any, { seriesIndex, dataPointIndex, config}: any) {
                        getClickedGame(dataPointIndex);
                    }
                },
                theme: {
                    mode: "dark",
                },
            },
            xaxis: {
                categories: [''],
                labels: {
                    show: true,
                    style: {
                        colors: "#ffffff",
                        fontSize: '14px',
                    }
                },
                tooltip: {
                    enabled: false
                }
            },
            yaxis: {
                labels: {
                    show: true,
                    style: {
                        colors: "#ffffff",
                        fontSize: '14px',
                    }
                }
            },
            legend: {
                fontSize: '18px',
                fontWeight: 500,
                labels: {
                    colors: "#ffffff",
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 5
                }
            },
            markers: {
                size: 7,
            },
            dataLabels: {
                enabled: false
            }
        },
        series: [{name: '', data: [0]}]
    });

    const selectStatOption = (i: number) => {
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

    const setGraphInformation = (gameHistoryInfo : gameHistoryType) => {
        let temp = graphOptions;

        let xaxis : string[] = [];
        let series : { name: string, data: number[] }[] = [];
        let numPlayers = gameHistoryInfo.players.length;

        for (let name of gameHistoryInfo.players) series.push({ name: name, data: [] });

        for (let game of gameHistoryInfo.gamesTogether) {
            xaxis.unshift(new Date(game.date).toLocaleDateString());
            for (let i = 0; i < numPlayers; i++) series[i].data.unshift(game.scores[i]);
        }

        temp.options.xaxis.categories = xaxis;
        temp.series = series;

        setGraphOptions(temp);
    }

    const queryGameHistory = (players: string[], numGames: Number) => {
        const GET_GAME_HISTORY = gql`
            query getScrabbleGamesWithPlayers($players: [String], $numGames: Int) {
                getScrabbleGamesWithPlayers(players: $players, numGames: $numGames) {
                    players
                    gamesTogether {
                        scrabbleGameId
                        date
                        scores
                    }
                }
            }
        `;

        setLoadingGameHistory(true);

        apolloClient
            .query({
                query: GET_GAME_HISTORY,
                variables: { players, numGames },
                fetchPolicy: 'network-only'
            })
            .then((res) => {
                setGameHistory(res.data.getScrabbleGamesWithPlayers);
                setGraphInformation(res.data.getScrabbleGamesWithPlayers);
                setshowGameHistory(true);
                setLoadingGameHistory(false);
            })
            .catch((err) => {
                console.log(err);
                setLoadingGameHistory(false);
            });
    }

    const getGameHistory = () => {
        let players = [];

        for (let p of gameHistoryPlayers) if (p.length > 0) players.push(p);

        if (players.length === 0 || loadingGameHistory) return;


        setshowGameHistory(false);
        setGameHistory(emptyGameHistory);

        queryGameHistory(players, numGameHistoryToDisplay);
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
                            <span className="GameHistoryPlayersInput" key={i}>
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
                            </span>
                        ))}
                        <button className="GameHistorySearch" onClick={() => getGameHistory()}>find</button>
                    </div>

                    {loadingGameHistory &&
                        <div className="lds-ellipsis-stats"><div></div><div></div><div></div><div></div></div>
                    }

                    {showGameHistory &&
                        <div className="GameHistory">
                            {gameHistory.gamesTogether.length > 0 ?
                                <div>
                                    <div className="GameHistoryTitle">
                                        <p>your last {numGameHistoryToDisplay} games together</p>
                                    </div>

                                    <div className="GameHistoryGraph" id="chartContainer">
                                        <Chart options={graphOptions.options} series={graphOptions.series} type="area" height={400}/>
                                    </div>
                                </div>
                                
                                :
                                
                                <div className="NoRecordsFound">
                                    <p>you guys haven't played a game together yet :(</p>
                                </div>
                            }
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
                                                <th>{playerStats.gamesInfo.total.averageScore}</th>
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
                                                                <p>{new Date(gameScore.date).toLocaleString()}</p>
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
                                                                <p>{new Date(gameScore.date).toLocaleString()}</p>
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
                                                                <p>{new Date(gameScore.date).toLocaleString()}</p>
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
        </div>
    );
}

export default StatsFinder;
