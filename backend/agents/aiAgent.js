/**
 * AI AGENT
 * Responsibility: Determines the optimal move for the AI player ('O')
 * using the Minimax algorithm — guarantees the AI never loses.
 *
 * Minimax scoring:
 *   O wins  → +10
 *   X wins  → -10
 *   Draw    →   0
 */

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

/**
 * Checks if a player has won on the given board
 */
function getWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

/**
 * Minimax recursive function
 * @param {Array}   board        - Current board state
 * @param {boolean} isMaximizing - true = AI's turn (O), false = human's turn (X)
 * @param {number}  depth        - Current recursion depth (used for score optimization)
 * @returns {number} score
 */
function minimax(board, isMaximizing, depth = 0) {
  const winner = getWinner(board);
  if (winner === 'O') return 10 - depth;  // AI wins (sooner = better)
  if (winner === 'X') return depth - 10;  // Human wins
  if (board.every((cell) => cell !== null)) return 0; // Draw

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, false, depth + 1));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        best = Math.min(best, minimax(board, true, depth + 1));
        board[i] = null;
      }
    }
    return best;
  }
}

const aiAgent = {
  /**
   * Returns the best move position for AI ('O')
   * @param {Array} board - Current 9-element board (AI receives a copy)
   * @returns {number} position (0-8)
   */
  getBestMove(board) {
    console.log('[AIAgent] → Running Minimax algorithm...');

    const availableMoves = board
      .map((cell, i) => (cell === null ? i : null))
      .filter((i) => i !== null);

    console.log(`[AIAgent]   Available positions: [${availableMoves.join(', ')}]`);

    let bestScore = -Infinity;
    let bestMove = availableMoves[0]; // fallback

    for (const i of availableMoves) {
      board[i] = 'O';
      const score = minimax(board, false);
      board[i] = null;

      console.log(`[AIAgent]   Position ${i} → score: ${score}`);

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }

    console.log(`[AIAgent] ✓ Best move selected: position ${bestMove} (score: ${bestScore})`);
    return bestMove;
  },
};

module.exports = aiAgent;
