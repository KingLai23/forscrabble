import React, { useEffect, useState } from 'react';
import './styles/GameHistoryGraph.css';
import { gql, useApolloClient } from '@apollo/client';
import Chart from "react-apexcharts";

function GameHistoryGraph(props: {names: string[], graphHeight: number, titleMsgBeginning: string, titleMsgEnding: string}) {
    const apolloClient = useApolloClient();

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

    const [gameHistory, setGameHistory] = useState<gameHistoryType>(emptyGameHistory);
    const [showGameHistory, setshowGameHistory] = useState(false);
    const [loadingGameHistory, setLoadingGameHistory] = useState(false);

    const numGameOptions = [10, 25, 50];
    const gameTypeOptions = [2, 3, 4];
    const [selectedGameOption, setSelectedGameOption] = useState(0);
    const [selectedGameTypeOption, setSelectedGameTypeOption] = useState(0);

    const selectGameOption = (i: number, k: number) => {
        setSelectedGameOption(i);
        setSelectedGameTypeOption(k);
        getGameHistory(i, k);
    }

    const isSelected = (i: number, k: number) => {
        if (k === 0) return i === selectedGameOption;
        return i === selectedGameTypeOption;
    }

    const getClickedGame = (index: number) => {
        console.log(index);
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

    const queryGameHistory = (players: string[], numGames: Number, gameType: Number) => {
        const GET_GAME_HISTORY = gql`
            query getScrabbleGamesWithPlayers($players: [String], $numGames: Int, $gameType: Int) {
                getScrabbleGamesWithPlayers(players: $players, numGames: $numGames, gameType: $gameType) {
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
                variables: { players, numGames, gameType },
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

    const getGameHistory = (i: number, k: number) => {
        if (loadingGameHistory) return;

        setshowGameHistory(false);
        setGameHistory(emptyGameHistory);

        queryGameHistory(props.names, numGameOptions[i], gameTypeOptions[k]);
    }

    useEffect(() => {
        setSelectedGameOption(0);
        getGameHistory(0, 0);
      }, [props.names]);
    

    return (
        <div className="GameHistoryGraph">
            {loadingGameHistory &&
                <div className="lds-ellipsis-stats"><div></div><div></div><div></div><div></div></div>
            }

            {showGameHistory &&
                <div className="GameHistoryGraphContainer">
                    {gameHistory.gamesTogether.length > 0 ?
                        <div>
                            <div className="GameHistoryTitle">
                                <p>{props.titleMsgBeginning} {numGameOptions[selectedGameOption]} {props.titleMsgEnding}</p>
                            </div>

                            <div className="GameHistoryOptions">
                                {gameTypeOptions.map((num, i) => (
                                    <span>
                                        {num > 0 ?
                                            <button className="GameHistoryOption" id={"isSelected" + isSelected(i, 1)} key={i} onClick={() => selectGameOption(selectedGameOption, i)}>{num} player</button>
                                            :
                                            <button className="GameHistoryOption" id={"isSelected" + isSelected(i, 1)} key={i} onClick={() => selectGameOption(selectedGameOption, i)}> view all</button>
                                        }
                                    </span>
                                ))}

                                <span> | </span>

                                {numGameOptions.map((num, i) => (
                                    <span>
                                    { num > 0 ?
                                        <button className="GameHistoryOption"  id={"isSelected" + isSelected(i, 0)} key={i} onClick={() => selectGameOption(i, selectedGameTypeOption)}>last {num}</button>
                                        :
                                        <button className="GameHistoryOption" id={"isSelected" + isSelected(i, 0)} key={i} onClick={() => selectGameOption(i, selectedGameTypeOption)}> view all</button>
                                    }
                                    </span>
                                ))}
                            </div>

                            <div className="GameHistoryGraphed" id="GraphContainer">
                                <Chart options={graphOptions.options} series={graphOptions.series} type="area" height={props.graphHeight} />
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
    );
}

export default GameHistoryGraph;