import React from 'react';
import './App.css';
import ScrabbleLogic from './components/SimpleScrabble';

function App() {
  return (
    <div className="App">
      <div className="ScrabbleGame">
        <ScrabbleLogic />
      </div>
    </div>
  );
}

export default App;
