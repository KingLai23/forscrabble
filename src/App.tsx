import './App.css';
import Home from './components/Home';

function App() {
  const logo = require('./components/images/coverlogo.png');

  return (
    <div className="App">
      <div className="Title">
        <img src={logo} alt='scrabble calc'></img>
        <span>beta</span>
      </div>

      <div className="Home">
        <Home />
      </div>
    </div>
  );
}

export default App;
