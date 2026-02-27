/**
 * VALIDATION AGENT
 * Responsibility: Ensures every move is legal before it is applied.
 *
 * Rules enforced:
 *  1. Game must still be ongoing
 *  2. Position must be a valid integer 0-8
 *  3. Target cell must be empty (not already X or O)
 */

const validationAgent = {
  /**
   * Validates a player's move
   * @param {Array}  board         - Current 9-element board
   * @param {number} position      - Requested cell index (0-8)
   * @param {string} currentPlayer - 'X' or 'O'
   * @param {string} status        - Current game status
   * @returns {{ valid: boolean, reason: string|null, position: number }}
   */
  validate(board, position, currentPlayer, status) {
    console.log(`\n[ValidationAgent] → Validating: position=${position}, player=${currentPlayer}`);

    // Rule 1: Game must be ongoing
    if (status !== 'ongoing') {
      console.log('[ValidationAgent] ✗ Game is already over');
      return { valid: false, reason: 'Game is already over. Please reset to play again.' };
    }

    // Rule 2: Position must exist and be a number
    if (position === undefined || position === null || isNaN(position)) {
      console.log('[ValidationAgent] ✗ Position is not a valid number');
      return { valid: false, reason: 'Invalid position: must be a number.' };
    }

    const pos = parseInt(position);

    // Rule 3: Position must be within 0-8
    if (pos < 0 || pos > 8) {
      console.log(`[ValidationAgent] ✗ Position out of range: ${pos}`);
      return { valid: false, reason: `Position ${pos} is out of range. Must be 0–8.` };
    }

    // Rule 4: Cell must be empty
    if (board[pos] !== null) {
      console.log(`[ValidationAgent] ✗ Cell ${pos} already occupied by '${board[pos]}'`);
      return { valid: false, reason: `Cell ${pos} is already occupied by '${board[pos]}'.` };
    }

    console.log(`[ValidationAgent] ✓ Move is valid`);
    return { valid: true, reason: null, position: pos };
  },
};

module.exports = validationAgent;
