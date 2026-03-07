import { useState } from 'react';
function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}
function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }
  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }
  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}
export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [humanPlayer, setHumanPlayer] = useState('X');
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const currentPlayer = xIsNext ? 'X' : 'O';
  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }
  function handleSwitch() {
    if (calculateWinner(currentSquares) || !currentSquares.some(s => s === null)) return;
    const i = findBestMove(currentSquares, currentPlayer);
    if (i === -1) return;
    const nextSquares = currentSquares.slice();
    nextSquares[i] = currentPlayer;
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setHumanPlayer(currentPlayer === 'X' ? 'O' : 'X');
  }
  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }
  const gameOver = !!calculateWinner(currentSquares) || !currentSquares.some(s => s === null);
  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });
  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
        {!gameOver && (
          <button onClick={handleSwitch}>
            Switch to Player {humanPlayer === 'X' ? 'O' : 'X'}
          </button>
        )}
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}
function findBestMove(squares, player) {
  const opponent = player === 'X' ? 'O' : 'X';
  // win if possible
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const trial = squares.slice();
      trial[i] = player;
      if (calculateWinner(trial) === player) return i;
    }
  }
  // block opponent's win
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const trial = squares.slice();
      trial[i] = opponent;
      if (calculateWinner(trial) === opponent) return i;
    }
  }
  // prio middle, then corners, then edges
  const moveOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  return moveOrder.find(i => !squares[i]) ?? -1;
}
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
// comment 1(task 3): installed dev tools