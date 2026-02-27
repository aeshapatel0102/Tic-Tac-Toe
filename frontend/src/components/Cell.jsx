/**
 * Cell — A single square in the Tic-Tac-Toe board
 */

export default function Cell({ value, index, isWinCell, isAiMove, onClick, disabled }) {
  let cellClass = 'cell';
  if (value === 'X') cellClass += ' cell-x';
  if (value === 'O') cellClass += ' cell-o';
  if (isWinCell)    cellClass += ' cell-win';
  if (isAiMove)     cellClass += ' cell-ai';

  return (
    <button
      className={cellClass}
      onClick={() => onClick(index)}
      disabled={disabled || !!value}
      aria-label={`Cell ${index}: ${value || 'empty'}`}
    >
      {value && <span className="cell-mark">{value}</span>}
    </button>
  );
}
