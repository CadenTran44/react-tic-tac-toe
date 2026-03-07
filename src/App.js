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
function minimax(board, depth, isMaximizing) {
  // checks terminal conditions
  const winner = calculateWinner(board);
  if (winner === 'X') return 10 - depth;
  if (winner === 'O') return depth - 10;
  if (board.every(s => s !== null)) return 0;

  let bestScore = isMaximizing ? -Infinity : Infinity;

  // loops through all cells
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = isMaximizing ? 'X' : 'O';
      const score = minimax(board, depth + 1, !isMaximizing);
      // updates bestScore
      bestScore = isMaximizing
        ? Math.max(bestScore, score)
        : Math.min(bestScore, score);
      // undo the move
      board[i] = null;
    }
  }

  return bestScore;
}
function findBestMove(squares, player) {
  const isMaximizing = player === 'X';
  let bestScore = isMaximizing ? -Infinity : Infinity;
  let bestIndex = -1;
  const board = squares.slice();
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = player;
      const score = minimax(board, 0, !isMaximizing);
      board[i] = null;
      if (isMaximizing ? score > bestScore : score < bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }
  }
  return bestIndex;
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