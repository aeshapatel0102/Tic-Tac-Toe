/**
 * SERVER — Entry point for Tic-Tac-Toe Backend
 *
 * Endpoints:
 *   GET  /state          → Current game state
 *   POST /move           → Process a player move
 *   POST /reset          → Reset the game
 *   GET  /agent-stream   → SSE stream for live agent monitoring
 */

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const { EventEmitter } = require('events');

const { processMove, resetGame, setEmitter } = require('./orchestrator');
const stateManager = require('./agents/stateManager');

const app        = express();
const PORT       = process.env.PORT || 3001;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

// ── SSE Event Emitter ────────────────────────────────────────
// All agents emit events through this. The /agent-stream endpoint
// forwards them to connected browser clients in real time.
const agentEmitter = new EventEmitter();
agentEmitter.setMaxListeners(20);
setEmitter(agentEmitter);

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── SSE: Live Agent Monitor Stream ──────────────────────────
app.get('/agent-stream', (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering if used
  res.flushHeaders();

  // Send a heartbeat comment to keep the connection alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  console.log('[Server] ✅ SSE client connected — streaming agent events');

  // Forward every agent event to this SSE client
  const onAgentEvent = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  agentEmitter.on('agent-event', onAgentEvent);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    agentEmitter.off('agent-event', onAgentEvent);
    console.log('[Server] SSE client disconnected');
  });
});

// ── REST: Get current game state ─────────────────────────────
app.get('/state', (req, res) => {
  res.json({ state: stateManager.getState() });
});

// ── REST: Process a player move ──────────────────────────────
app.post('/move', async (req, res) => {
  const { position } = req.body;

  if (position === undefined || position === null) {
    return res.status(400).json({ error: 'position is required in request body.' });
  }

  try {
    const result = await processMove(parseInt(position));

    if (result.error) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error('[Server] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── REST: Reset the game ──────────────────────────────────────
app.post('/reset', (req, res) => {
  try {
    const result = resetGame();
    res.json(result);
  } catch (err) {
    console.error('[Server] Reset error:', err);
    res.status(500).json({ error: 'Failed to reset game.' });
  }
});

// ── Start server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n' + '═'.repeat(50));
  console.log('  Tic-Tac-Toe | Agent Swarm Backend');
  console.log('═'.repeat(50));
  console.log(`  Server  : ${SERVER_URL}`);
  console.log(`  SSE     : ${SERVER_URL}/agent-stream`);
  console.log(`  State   : ${SERVER_URL}/state`);
  console.log('═'.repeat(50) + '\n');
});
