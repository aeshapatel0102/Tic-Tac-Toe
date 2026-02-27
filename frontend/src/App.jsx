/**
 * App — Root component
 * Layout: Game panel (left) + Agent Monitor panel (right)
 */

import Board      from './components/Board';
import StatusBar  from './components/StatusBar';
import AgentMonitor from './components/AgentMonitor';
import { useGame } from './hooks/useGame';

export default function App() {
  const {
    board, currentPlayer, status, winner,
    winLine, aiMove, loading, error,
    makeMove, resetGame,
  } = useGame();

  const gameOver = status !== 'ongoing';

  return (
    <div className="app">
      {/* ── Left Panel: Game ─────────────────────────── */}
      <div className="game-panel">
        <h1 className="app-title">
          Tic-Tac-Toe
          <span className="app-subtitle">Agent Swarm Edition</span>
        </h1>

        {/* Player labels */}
        <div className="player-labels">
          <span className={`player-label player-x ${currentPlayer === 'X' && !gameOver ? 'active' : ''}`}>
            You (X)
          </span>
          <span className="vs">vs</span>
          <span className={`player-label player-o ${currentPlayer === 'O' && !gameOver ? 'active' : ''}`}>
            AI (O)
          </span>
        </div>

        {/* Status */}
        <StatusBar
          status={status}
          winner={winner}
          currentPlayer={currentPlayer}
          loading={loading}
          error={error}
        />

        {/* Board */}
        <Board
          board={board}
          winLine={winLine}
          aiMove={aiMove}
          onCellClick={makeMove}
          disabled={loading || gameOver}
        />

        {/* Reset button */}
        <button
          className={`reset-btn ${gameOver ? 'reset-btn-highlight' : ''}`}
          onClick={resetGame}
          disabled={loading}
        >
          {gameOver ? 'Play Again' : 'Reset Game'}
        </button>

        {/* Instructions */}
        <p className="instructions">
          You play as <strong>X</strong>. Click any cell to make your move.
          The AI plays as <strong>O</strong> and uses the Minimax algorithm.
        </p>
      </div>

      {/* ── Right Panel: Agent Monitor ────────────────── */}
      <AgentMonitor />
    </div>
  );
}
