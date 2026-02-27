/**
 * STATE MANAGER AGENT
 * Responsibility: Owns and manages all game state in memory.
 * Single source of truth for board, current player, status, winner.
 */

const initialBoard = () => Array(9).fill(null);

let gameState = {
  board: initialBoard(),
  currentPlayer: 'X',   // X always goes first
  status: 'ongoing',    // 'ongoing' | 'win' | 'draw'
  winner: null,
  winLine: null,
  moveCount: 0,
};

const stateManager = {
  /**
   * Returns a copy of the current game state
   */
  getState() {
    return { ...gameState, board: [...gameState.board] };
  },

  /**
   * Places a player's mark on the board and switches turn
   */
  updateBoard(position, player) {
    gameState.board[position] = player;
    gameState.moveCount++;
    gameState.currentPlayer = player === 'X' ? 'O' : 'X';
    return this.getState();
  },

  /**
   * Sets the final game result (win or draw)
   */
  setGameResult(status, winner = null, winLine = null) {
    gameState.status = status;
    gameState.winner = winner;
    gameState.winLine = winLine;
    return this.getState();
  },

  /**
   * Resets game to initial state
   */
  reset() {
    gameState = {
      board: initialBoard(),
      currentPlayer: 'X',
      status: 'ongoing',
      winner: null,
      winLine: null,
      moveCount: 0,
    };
    return this.getState();
  },
};

module.exports = stateManager;
