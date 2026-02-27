/**
 * Board — 3×3 Tic-Tac-Toe grid
 */

import Cell from './Cell';

export default function Board({ board, winLine, aiMove, onCellClick, disabled }) {
  return (
    <div className="board">
      {board.map((value, index) => (
        <Cell
          key={index}
          index={index}
          value={value}
          isWinCell={winLine?.includes(index)}
          isAiMove={aiMove === index}
          onClick={onCellClick}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
