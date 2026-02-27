/**
 * GAME LOGIC AGENT
 * Responsibility: Detects win and draw conditions after every move.
 *
 * Win lines (8 total):
 *   Rows:      [0,1,2]  [3,4,5]  [6,7,8]
 *   Columns:   [0,3,6]  [1,4,7]  [2,5,8]
 *   Diagonals: [0,4,8]  [2,4,6]
 *
 * Draw: All 9 cells filled with no winner.
 */

const WIN_LINES = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left column
  [1, 4, 7], // middle column
  [2, 5, 8], // right column
  [0, 4, 8], // diagonal top-left → bottom-right
  [2, 4, 6], // diagonal top-right → bottom-left
];

const gameLogicAgent = {
  /**
   * Checks the board for a winner or a draw
   * @param {Array} board - Current 9-element board
   * @returns {{ status: string, winner: string|null, winLine: number[]|null }}
   */
  checkResult(board) {
    console.log('[GameLogicAgent] → Checking win/draw conditions...');

    // Check all 8 winning lines
    for (const line of WIN_LINES) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        console.log(`[GameLogicAgent] ✓ Winner: '${board[a]}' via line [${line.join(', ')}]`);
        return { status: 'win', winner: board[a], winLine: line };
      }
    }

    // Check for draw (all cells filled, no winner)
    if (board.every((cell) => cell !== null)) {
      console.log('[GameLogicAgent] ✓ Draw — board full, no winner');
      return { status: 'draw', winner: null, winLine: null };
    }

    console.log('[GameLogicAgent] ✓ Game is still ongoing');
    return { status: 'ongoing', winner: null, winLine: null };
  },
};

module.exports = gameLogicAgent;
