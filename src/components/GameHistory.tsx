import React, { useEffect, useState } from 'react';
import './styles/GameHistory.css';
import { gql, useApolloClient } from '@apollo/client';

function GameHistory(props: { names: string[] }) {
    const apolloClient = useApolloClient();

    const [isLoadingGameHistory, setIsLoadingGameHistory] = useState(false);
    const [showGameHistory, setShowGameHistory] = useState(false);

    type singlePlayerInfo = { name: string, score: number, words: { word: string[], mult: number[], points: number, bingo: boolean }[], lostPoints: number, lastLetters: string[], otherPlayerTiles: { tiles: string[], score: number } }
    const [gameHistory, setGameHistory] = useState<{ players: string[], gameInfo: singlePlayerInfo[], boardState: [[String]], date: string }[]>([]);
    const [showIndividualGame, setShowIndividualGame] = useState<boolean[]>([]);

    const [fetchedAll, setFetchedAll] = useState(false);

    const boardMultipliers =
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

    const pageSize = 10;

    const getGames = (players: string[], pageNum: number, pageSize: number) => {
        if (isLoadingGameHistory) return;

        const GET_SCRABBLE_HISTORY_OF_PLAYERS = gql`
          query getScrabbleHistoryOfPlayers($players: [String], $pageNum: Int, $pageSize: Int ) {
            getScrabbleHistoryOfPlayers(players: $players, pageNum: $pageNum, pageSize: $pageSize) {
              players
              gameInfo {
                name
                score
                words {
                  word
                  mult
                  points
                  bingo
                }
                lostPoints
                lastLetters
                otherPlayerTiles {
                  tiles
                  score
                }
              }
              boardState
              date
            }
          }
        `;

        setIsLoadingGameHistory(true);

        apolloClient
            .query({
                query: GET_SCRABBLE_HISTORY_OF_PLAYERS,
                variables: { players, pageNum, pageSize },
                fetchPolicy: 'network-only'
            })
            .then((res) => {
                setShowGameHistory(true);

                if (res.data.getScrabbleHistoryOfPlayers.length < pageSize) setFetchedAll(true);

                let currentGameHistory = pageNum === 1 ? [] : gameHistory;
                currentGameHistory = currentGameHistory.concat(res.data.getScrabbleHistoryOfPlayers);

                setShowIndividualGame(Array(currentGameHistory.length).fill(false));

                setGameHistory(currentGameHistory);
                setIsLoadingGameHistory(false);
            })
            .catch((err) => {
                console.log(err);
                setIsLoadingGameHistory(false);
            });
    }

    const getGameHistory = (pageNum: number) => {
        getGames(props.names, pageNum, pageSize);
    }

    useEffect(() => {
        setFetchedAll(false);
        getGameHistory(1);
    }, [props.names]);

    const loadMoreGames = () => {
        if (gameHistory.length % pageSize > 0) return;

        let nextPage = gameHistory.length / pageSize + 1;
        getGameHistory(nextPage);
    }

    const toggleIndividualGame = (i: number) => {
        let temp = [...showIndividualGame];
        temp[i] = !temp[i];
        setShowIndividualGame(temp);
    }

    return (
        <div className="GameHistoryOfPlayers">
            {isLoadingGameHistory &&
                <div className="lds-ellipsis-stats"><div></div><div></div><div></div><div></div></div>
            }

            {showGameHistory &&
                <div className="GameHistoryOfPlayersContainer">
                    {gameHistory.length > 0 ?
                        <div>
                            <div className="GameHistoryTitle">
                                <p>total game history</p>
                            </div>

                            {gameHistory.map((game, i) => (
                                <div className="IndividualGame" id={"IsIndividualGameToggled" + showIndividualGame[i]} key={i} onClick={() => toggleIndividualGame(i)}>

                                    <div className="IndividualGameDateAndToggle">
                                        {new Date(game.date).toLocaleString().slice(0, -6) + new Date(game.date).toLocaleString().slice(-3)}
                                        {/* <button className="ViewIndividualGame" onClick={() => toggleIndividualGame(i)}>{showIndividualGame[i] ? "close game" : "view game"}</button> */}
                                    </div> 

                                    <div className="IndividualGameInfoSection">
                                        <div className="IndividualGameInfoContainer">
                                            {game.gameInfo.map((info, k) => (
                                                <div className="IndividualGameInfo" key={k}>
                                                    <h2>{info.name}&nbsp;&nbsp;•&nbsp;&nbsp;<span className="IndividualGameScore">{info.score}</span></h2>

                                                    {showIndividualGame[i] &&
                                                        <div>
                                                            {info.words.map((wordInfo, j) => (
                                                                <div className="IndividualGameInfoWordHistory" key={j}>
                                                                    {wordInfo.word.map((letter, y) => (
                                                                        <span className="IndividualTile" key={y}>
                                                                            {wordInfo.word[y] === '_' ?
                                                                                <button className="SmallTile" id={'color' + wordInfo.mult[y]} />
                                                                                :
                                                                                <button className="SmallTile" id={'color' + wordInfo.mult[y]}>{letter}</button>
                                                                            }
                                                                        </span>
                                                                    ))}

                                                                    <span className="PlayerWordScore">{wordInfo.points}</span>

                                                                    {wordInfo.bingo &&
                                                                        <span className="BingoWord"> ★</span>
                                                                    }
                                                                </div>
                                                            ))}

                                                            {info.lostPoints > 0 &&
                                                                <div className="IndividualGameInfoSubtractedTiles">
                                                                    {info.lastLetters.map((lastLetter, p) => (
                                                                        <span className="LastTiles" key={p}>
                                                                            <button className="SmallTile" id="color0">{lastLetter}</button>
                                                                        </span>
                                                                    ))}

                                                                    <span className="PlayerWordScore">-{info.lostPoints}</span>
                                                                </div>
                                                            }

                                                            {info.otherPlayerTiles.score > 0 &&
                                                                <div className="IndividualGameInfoOtherPlayerTiles" key={'opt' + i}>
                                                                    {info.otherPlayerTiles.tiles.map((tile, y) => (
                                                                        <span className="OtherPlayerTile" key={y}>
                                                                            <button className="SmallTile" id='color0'>{tile}</button>
                                                                        </span>
                                                                    ))}

                                                                    <span className="PlayerWordScore">+{info.otherPlayerTiles.score}</span>
                                                                </div>
                                                            }
                                                        </div>
                                                    }
                                                </div>
                                            ))}
                                        </div>

                                        {showIndividualGame[i] &&
                                            <div className="IndividualBoardState">
                                                {game.boardState.length > 0 ?
                                                    <div className="FoundBoardStateWrapper">
                                                        <div className="FoundBoardState">
                                                            {boardMultipliers.map((row, g) => (
                                                                <div className="Row" key={g}>
                                                                    {row.map((val, f) => (
                                                                        <span className="IndividualInGameBoardTiles" key={f}>
                                                                            {game.boardState[g][f] === '' ?
                                                                                <button id={"GameHistoryEmptyTile" + val}>{g === 7 && f == 7 ? "★" : ""}</button>
                                                                                :
                                                                                <button id={"GameHistoryFilledTile" + val}>{game.boardState[g][f]}</button>
                                                                            }
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    :
                                                    <p>board layout not saved... :(</p>
                                                }
                                            </div>
                                        }
                                    </div>
                                </div>
                            ))}

                            {isLoadingGameHistory &&
                                <div className="AlignLoadingSymbol">
                                    <div className="lds-ellipsis-stats"><div></div><div></div><div></div><div></div></div>
                                </div>
                            }

                            { !fetchedAll &&
                                <button className="LoadMoreGames" onClick={() => loadMoreGames()}>load more</button>
                            }
                            
                        </div>

                        :
 
                        <div className="NoRecordsFound">
                            <p>no games found :(</p>
                        </div>
                    }
                </div>
            }
        </div>
    );
}

export default GameHistory;