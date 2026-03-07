import { useState } from 'react';

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ rows, cols, xIsNext, squares, onPlay }) {
  const winLen = Math.min(rows, cols);
  function handleClick(i) {
    if (calculateWinner(squares, rows, cols, winLen) || squares[i]) {
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
  const winner = calculateWinner(squares, rows, cols, winLen);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }
  return (
    <>
      <div className="status">{status}</div>
      {Array.from({ length: rows }, (_, r) => (
        <div className="board-row" key={r}>
          {Array.from({ length: cols }, (_, c) => {
            const i = r * cols + c;
            return (
              <Square key={i} value={squares[i]} onSquareClick={() => handleClick(i)} />
            );
          })}
        </div>
      ))}
    </>
  );
}

function BoardSizeInput({ rows, cols, onApply }) {
  const [inputRows, setInputRows] = useState(rows);
  const [inputCols, setInputCols] = useState(cols);
  return (
    <div className="board-size-input">
      <label>
        Rows:&nbsp;
        <input
          type="number"
          min="2"
          max="8"
          value={inputRows}
          onChange={e => setInputRows(Number(e.target.value))}
        />
      </label>
      &nbsp;
      <label>
        Cols:&nbsp;
        <input
          type="number"
          min="2"
          max="8"
          value={inputCols}
          onChange={e => setInputCols(Number(e.target.value))}
        />
      </label>
      &nbsp;
      <button onClick={() => onApply(inputRows, inputCols)}>New Game</button>
    </div>
  );
}

export default function Game() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [humanPlayer, setHumanPlayer] = useState('X');
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const currentPlayer = xIsNext ? 'X' : 'O';
  const winLen = Math.min(rows, cols);

  function handleApplySize(newRows, newCols) {
    setRows(newRows);
    setCols(newCols);
    setHistory([Array(newRows * newCols).fill(null)]);
    setCurrentMove(0);
    setHumanPlayer('X');
  }

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function handleSwitch() {
    if (calculateWinner(currentSquares, rows, cols, winLen) || !currentSquares.some(s => s === null)) return;
    const i = findBestMove(currentSquares, currentPlayer, rows, cols, winLen);
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

  const gameOver = !!calculateWinner(currentSquares, rows, cols, winLen) || !currentSquares.some(s => s === null);

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
        <BoardSizeInput rows={rows} cols={cols} onApply={handleApplySize} />
        <Board
          rows={rows}
          cols={cols}
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
        />
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

function minimax(board, depth, isMaximizing, rows, cols, winLen, maxDepth) {
  // checks terminal conditions
  const winner = calculateWinner(board, rows, cols, winLen);
  if (winner === 'X') return 10 - depth;
  if (winner === 'O') return depth - 10;
  if (board.every(s => s !== null)) return 0;
  if (depth >= maxDepth) return 0;

  let bestScore = isMaximizing ? -Infinity : Infinity;

  // loops through all cells
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      board[i] = isMaximizing ? 'X' : 'O';
      const score = minimax(board, depth + 1, !isMaximizing, rows, cols, winLen, maxDepth);
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

function findBestMove(squares, player, rows, cols, winLen) {
  const isMaximizing = player === 'X';
  let bestScore = isMaximizing ? -Infinity : Infinity;
  let bestIndex = -1;
  // Full search for 3x3, limited depth for larger boards to stay responsive
  const maxDepth = rows * cols <= 9 ? Infinity : rows * cols <= 16 ? 4 : 3;
  const board = squares.slice();
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      board[i] = player;
      const score = minimax(board, 0, !isMaximizing, rows, cols, winLen, maxDepth);
      board[i] = null;
      if (isMaximizing ? score > bestScore : score < bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }
  }
  return bestIndex;
}

function calculateWinner(squares, rows, cols, winLen) {
  // checks rows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= cols - winLen; c++) {
      const first = squares[r * cols + c];
      if (!first) continue;
      if (Array.from({ length: winLen }, (_, k) => squares[r * cols + c + k]).every(v => v === first))
        return first;
    }
  }
  // checks columns
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r <= rows - winLen; r++) {
      const first = squares[r * cols + c];
      if (!first) continue;
      if (Array.from({ length: winLen }, (_, k) => squares[(r + k) * cols + c]).every(v => v === first))
        return first;
    }
  }
  // checks diagonal top-left to bottom-right
  for (let r = 0; r <= rows - winLen; r++) {
    for (let c = 0; c <= cols - winLen; c++) {
      const first = squares[r * cols + c];
      if (!first) continue;
      if (Array.from({ length: winLen }, (_, k) => squares[(r + k) * cols + (c + k)]).every(v => v === first))
        return first;
    }
  }
  // checks diagonal top-right to bottom-left
  for (let r = 0; r <= rows - winLen; r++) {
    for (let c = winLen - 1; c < cols; c++) {
      const first = squares[r * cols + c];
      if (!first) continue;
      if (Array.from({ length: winLen }, (_, k) => squares[(r + k) * cols + (c - k)]).every(v => v === first))
        return first;
    }
  }
  return null;
}
// comment 1(task 3): installed dev tools