/**
 * ORCHESTRATOR AGENT
 * Responsibility: Master coordinator. Receives moves from the API,
 * delegates to the right agents in the correct order, and returns
 * the final game state. Also emits SSE events for live monitoring.
 *
 * Flow:
 *  1. Validate move        → ValidationAgent
 *  2. Apply player move    → StateManager
 *  3. Check win/draw       → GameLogicAgent
 *  4. (if ongoing) AI move → AIAgent → StateManager → GameLogicAgent
 *  5. Return final state
 */

const stateManager   = require('./agents/stateManager');
const validationAgent = require('./agents/validationAgent');
const gameLogicAgent  = require('./agents/gameLogicAgent');
const aiAgent         = require('./agents/aiAgent');

// SSE emitter — injected from server.js
let sseEmitter = null;

function setEmitter(emitter) {
  sseEmitter = emitter;
}

/**
 * Emits an agent event to both terminal and SSE stream
 * @param {string} agent   - Agent name
 * @param {string} status  - 'running' | 'success' | 'error'
 * @param {string} message - Human-readable description
 * @param {object} data    - Optional extra data
 */
function emit(agent, status, message, data = {}) {
  const icons = { running: '⚙️ ', success: '✅', error: '❌' };
  console.log(`${icons[status] || '  '} [${agent}] ${message}`);

  if (sseEmitter) {
    sseEmitter.emit('agent-event', {
      agent,
      status,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Processes a player move through the full agent pipeline
 * @param {number} position - Cell index (0-8)
 * @returns {object} result with state, winLine, aiMove or error
 */
async function processMove(position) {
  const state = stateManager.getState();

  console.log('\n' + '═'.repeat(55));
  console.log(`[Orchestrator] → Turn started | Player: ${state.currentPlayer} | Position: ${position}`);
  emit('Orchestrator', 'running', `Turn started — Player ${state.currentPlayer} → position ${position}`);

  // ── STEP 1: Validate the move ─────────────────────────────
  emit('ValidationAgent', 'running', `Validating position ${position} for player ${state.currentPlayer}...`);

  const validation = validationAgent.validate(
    state.board,
    position,
    state.currentPlayer,
    state.status
  );

  if (!validation.valid) {
    emit('ValidationAgent', 'error', `Rejected: ${validation.reason}`);
    emit('Orchestrator', 'error', `Move rejected — ${validation.reason}`);
    return { error: validation.reason, state: stateManager.getState() };
  }

  emit('ValidationAgent', 'success', 'Move is valid — proceeding');

  // ── STEP 2: Apply player move ─────────────────────────────
  emit('StateManager', 'running', `Placing '${state.currentPlayer}' at position ${validation.position}...`);
  stateManager.updateBoard(validation.position, state.currentPlayer);
  emit('StateManager', 'success', `Board updated — '${state.currentPlayer}' placed at position ${validation.position}`);

  // ── STEP 3: Check result after player move ─────────────────
  emit('GameLogicAgent', 'running', 'Scanning all 8 win lines for a winner...');
  let currentState = stateManager.getState();
  let result = gameLogicAgent.checkResult(currentState.board);

  if (result.status !== 'ongoing') {
    stateManager.setGameResult(result.status, result.winner, result.winLine);
    const msg = result.status === 'win'
      ? `Player '${result.winner}' wins via [${result.winLine.join(', ')}]!`
      : 'Draw — all cells filled, no winner!';
    emit('GameLogicAgent', 'success', msg);
    emit('Orchestrator', 'success', `Game over: ${result.status.toUpperCase()}`);
    console.log('═'.repeat(55) + '\n');
    return { state: stateManager.getState(), winLine: result.winLine, aiMove: null };
  }

  emit('GameLogicAgent', 'success', 'No winner yet — game continues');

  // ── STEP 4: AI picks its move ──────────────────────────────
  emit('AIAgent', 'running', 'Running Minimax to find optimal move...');
  const boardCopy = [...currentState.board]; // AI works on a copy
  const aiMove = aiAgent.getBestMove(boardCopy);
  emit('AIAgent', 'success', `Optimal move selected: position ${aiMove}`);

  // ── STEP 5: Apply AI move ──────────────────────────────────
  emit('StateManager', 'running', `Placing 'O' (AI) at position ${aiMove}...`);
  stateManager.updateBoard(aiMove, 'O');
  emit('StateManager', 'success', `Board updated — 'O' (AI) placed at position ${aiMove}`);

  // ── STEP 6: Check result after AI move ────────────────────
  emit('GameLogicAgent', 'running', 'Scanning all 8 win lines after AI move...');
  currentState = stateManager.getState();
  result = gameLogicAgent.checkResult(currentState.board);

  if (result.status !== 'ongoing') {
    stateManager.setGameResult(result.status, result.winner, result.winLine);
    const msg = result.status === 'win'
      ? `AI ('O') wins via [${result.winLine.join(', ')}]!`
      : 'Draw after AI move!';
    emit('GameLogicAgent', 'success', msg);
  } else {
    emit('GameLogicAgent', 'success', 'Game ongoing after AI move — your turn!');
  }

  emit('Orchestrator', 'success', `Turn complete — returning updated state to frontend`);
  console.log('═'.repeat(55) + '\n');

  return { state: stateManager.getState(), winLine: result.winLine, aiMove };
}

/**
 * Resets the game to initial state
 */
function resetGame() {
  console.log('\n[Orchestrator] → Game reset requested');
  emit('Orchestrator', 'running', 'Resetting game state...');
  emit('StateManager', 'running', 'Clearing board and resetting all state...');
  const state = stateManager.reset();
  emit('StateManager', 'success', 'Board cleared — all state reset to initial');
  emit('Orchestrator', 'success', 'New game ready — Player X goes first');
  return { state };
}

module.exports = { processMove, resetGame, setEmitter };
