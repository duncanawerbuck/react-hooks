// useState: tic tac toe
// http://localhost:3000/isolated/exercise/04.js

import * as React from 'react';

const SQUARE_COUNT = 9;

function Game() {
  const [squares, setSquares] = useLocalStorageState(
    'currentStep',
    Array(SQUARE_COUNT).fill(null)
  );

  const [history, setHistory] = useLocalStorageState('history', []);

  const nextValue = calculateNextValue(squares);
  const winner = calculateWinner(squares);
  const gameStatus = calculateStatus(winner, squares, nextValue);

  const recordNewMove = updatedSquares => {
    // if this isn't the latest move played (i.e. user has selected a historic move and is playing
    // over it), we must purge the move they're playing over, as well as all subsequent moves as
    // they are now orphaned
    const newMoveIsAnOverwrite = isNewMoveAnOverwrite(updatedSquares);
    if (newMoveIsAnOverwrite)
      setHistory(calculateNewRewrittenHistory(updatedSquares));
    else setHistory([...history, updatedSquares]);

    setSquares(updatedSquares);
  };

  function calculateNewRewrittenHistory(updatedSquares) {
    // to delete orphaned moves, we need to know how many of the original historic moves to keep
    const numberOfMovesInNewRewrittenHistory = updatedSquares.filter(
      s => s !== null
    ).length;

    // we subtract 1 here because we will be adding the new move in a moment
    const newHistoricItemCount = numberOfMovesInNewRewrittenHistory - 1;

    let latestRewrittenHistory = [];

    // some historic items are to be kept as they haven't been overwritten by the latest move
    for (let ix = 0; ix < newHistoricItemCount; ix++) {
      latestRewrittenHistory.push(history[ix]);
    }

    // append the latest move
    latestRewrittenHistory.push(updatedSquares);

    return latestRewrittenHistory;
  }

  function isNewMoveAnOverwrite() {
    const noMovesPlayed = history.filter(s => s !== null).length === 0;
    if (noMovesPlayed) return false;

    return (
      history.filter(s => s !== null).length >
      squares.filter(s => s !== null).length
    );
  }

  function handleRestartClick() {
    setHistory([]);
    setSquares(Array(SQUARE_COUNT).fill(null));
  }

  function showMove(ix) {
    if (ix < 0) return;
    const selectedMove = history[ix];
    setSquares(selectedMove);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board
          squares={squares}
          recordNewMove={recordNewMove}
          nextValue={nextValue}
          gameStatus={gameStatus}
        />
        <button className="restart" onClick={handleRestartClick}>
          restart
        </button>
        <div className="game-info">
          <div>{gameStatus}</div>
          <GameStateButtons history={history} showMove={showMove} />
        </div>
      </div>
    </div>
  );
}

function GameStateButtons({history, showMove}) {
  return (
    <ul>
      <li>
        <button type="button" onClick={() => showMove(history.length - 1)}>
          Show current move
        </button>
      </li>
      {history.map((move, ix) => (
        <li key={ix}>
          <button type="button" onClick={() => showMove(ix)}>{`Show move ${
            ix + 1
          }`}</button>
        </li>
      ))}
    </ul>
  );
}

function Board({squares, recordNewMove, gameStatus, nextValue}) {
  function selectSquare(square) {
    // bail if game already over
    if (!gameStatus.startsWith('Next player:')) return;

    // bail if square already taken
    if (squares[square] !== null) return;

    const updatedSquares = [...squares];

    updatedSquares[square] = nextValue;
    recordNewMove(updatedSquares);
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
