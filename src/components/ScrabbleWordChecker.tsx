import React, { useEffect, useState } from 'react';
import './styles/ScrabbleWordChecker.css';


function ScrabbleWordChecker() {
    const [wordToCheck, setWordToCheck] = useState('');
    const [currentWordToCheck, setCurrentWordToCheck] = useState('');
    const validLettersLower = 'abcdefghijklmnopqrstuvwxyz';

    const [scrabbleWords, setScrabbleWords] = useState<string[]>([]);
    const [scrabbleDefinitions, setscrabbleDefinitions] = useState<string[]>([]);

    const [indexOfWord, setIndexOfWord] = useState(-2);

    useEffect(() => {
        const scrabbleWords = require("./scrabble_dictionary/scrabble_words_with_definitions.txt");

        let temp = [];
        let words : string[] = [];
        let definitions : string[] = []; 

        fetch(scrabbleWords).then((res) => res.text())
            .then((data) => {
                for (let line of data.split('\r\n')) {
                    temp = line.split('\t');
                    words.push(temp[0]);
                    definitions.push(temp[1]);
                }

                setScrabbleWords(words);
                setscrabbleDefinitions(definitions);
            })
    }, []);

    const configWordToCheck = (w: string) => {
        let filtered = '';
        for (let l of w.toLowerCase()) if (validLettersLower.includes(l)) filtered+=l;
        setWordToCheck(filtered);
    }

    const checkWordIsValid = () => {
        setCurrentWordToCheck(wordToCheck);
        setIndexOfWord(scrabbleWords.indexOf(wordToCheck.toUpperCase()));
    }

    return (
        <div className="ScrabbleWordChecker">
            <div className="Title"><h1>scrabble word checker</h1></div>

            <div className="WordInput">
                <input
                    placeholder={"scrabble"}
                    name="scrabbleWordInput"
                    id="scrabbleWordInput"
                    autoComplete='off'
                    value={wordToCheck}
                    onChange={(e) => configWordToCheck(e.currentTarget.value)}
                    onKeyPress={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault()
                            checkWordIsValid();
                        }
                    }}
                />

                <button className="WordCheckBtn" onClick={() => checkWordIsValid()}>check</button>
            </div>

            {indexOfWord !== -2 &&
                <div>
                    {indexOfWord === -1 ?
                        <div className="InvalidScrabbleWord">
                            <h2><span id="invalidScrabbleWord">{currentWordToCheck}</span> is not a valid word -_-</h2>
                        </div>

                        :

                        <div className="ValidScrabbleWord">
                            <h2><span id="validScrabbleWord">{currentWordToCheck}</span> is a valid word :D</h2>
                            <p>{scrabbleDefinitions[indexOfWord]}</p>
                        </div>
                    }
                </div>
            }

        </div>
    );
}

export default ScrabbleWordChecker;