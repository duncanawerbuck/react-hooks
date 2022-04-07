// useState: tic tac toe
// http://localhost:3000/isolated/exercise/04.js

import * as React from 'react';

function Game() {
  const [squares, setSquares] = useLocalStorageState(
    'currentStep',
    Array(9).fill(null)
  );

  const [history, setHistory] = useLocalStorageState('history', []);

  const appendStepToHistory = newStep => {
    setHistory([...history, newStep]);
  }

  function restart() {
    setHistory([]);
    setSquares(Array(9).fill(null));
  }

  function getStatus() {
    const nextValue = calculateNextValue(squares);
    const winner = calculateWinner(squares);
    const gameStatus = calculateStatus(winner, squares, nextValue);
    return {gameStatus, nextValue};
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board
          squares={squares}
          setSquares={setSquares}
          getStatus={getStatus}
          appendStepToHistory={appendStepToHistory}
        />
        <button className="restart" onClick={restart}>
          restart
        </button>
        <div className="game-info">
          <div>{getStatus().gameStatus}</div>
          {/* <ol>{moves}</ol> */}
        </div>
      </div>
    </div>
  );
}

function Board({squares, setSquares, getStatus, appendStepToHistory}) {
  function selectSquare(square) {
    // bail if game already over
    const {gameStatus, nextValue} = getStatus();
    if (!gameStatus.startsWith('Next player:')) return;

    // bail if square already taken
    if (squares[square] !== null) return;

    const updatedSquares = [...squares];

    updatedSquares[square] = nextValue;
    setSquares(updatedSquares);
    appendStepToHistory(updatedSquares);
  }

  function renderSquare(i) {
    return (
      <button className="square" onClick={() => selectSquare(i)}>
        {squares[i]}
      </button>
    );
  }

  return (
    <div>
      <div className="board-row">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="board-row">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="board-row">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
function calculateStatus(winner, squares, nextValue) {
  return winner
    ? `Winner: ${winner}`
    : squares.every(Boolean)
    ? `Scratch: Cat's game`
    : `Next player: ${nextValue}`;
}

// eslint-disable-next-line no-unused-vars
function calculateNextValue(squares) {
  return squares.filter(Boolean).length % 2 === 0 ? 'X' : 'O';
}

// eslint-disable-next-line no-unused-vars
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function App() {
  return <Game />;
}

export default App;

function useLocalStorageState(
  key,
  defaultValue = '',
  // the = {} fixes the error we would get from destructuring when no argument was passed
  // Check https://jacobparis.com/blog/destructure-arguments for a detailed explanation
  {serialize = JSON.stringify, deserialize = JSON.parse} = {}
) {
  const [state, setState] = React.useState(() => {
    const valueInLocalStorage = window.localStorage.getItem(key);
    if (valueInLocalStorage) {
      // the try/catch is here in case the localStorage value was set before
      // we had the serialization in place (like we do in previous extra credits)
      try {
        return deserialize(valueInLocalStorage);
      } catch (error) {
        window.localStorage.removeItem(key);
      }
    }
    return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
  });

  const prevKeyRef = React.useRef(key);

  // Check the example at src/examples/local-state-key-change.js to visualize a key change
  React.useEffect(() => {
    const prevKey = prevKeyRef.current;
    if (prevKey !== key) {
      window.localStorage.removeItem(prevKey);
    }
    prevKeyRef.current = key;
    window.localStorage.setItem(key, serialize(state));
  }, [key, state, serialize]);

  return [state, setState];
}
