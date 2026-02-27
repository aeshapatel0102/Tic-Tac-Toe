/**
 * useGame — Custom React hook
 * Manages all game state and API communication with the backend.
 */

import { useState, useCallback } from 'react';

const API = '';  // empty = uses Vite proxy (same origin)

export function useGame() {
  const [board, setBoard]             = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [status, setStatus]           = useState('ongoing');
  const [winner, setWinner]           = useState(null);
  const [winLine, setWinLine]         = useState(null);
  const [aiMove, setAiMove]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  /**
   * Sync local state from backend response
   */
  const applyState = useCallback((state, winLineFromRes, aiMoveFromRes) => {
    setBoard([...state.board]);
    setCurrentPlayer(state.currentPlayer);
    setStatus(state.status);
    setWinner(state.winner);
    setWinLine(winLineFromRes || state.winLine || null);
    setAiMove(aiMoveFromRes ?? null);
    setError(null);
  }, []);

  /**
   * Send a move to the backend orchestrator
   */
  const makeMove = useCallback(async (position) => {
    if (loading || status !== 'ongoing') return;

    setLoading(true);
    setError(null);
    setAiMove(null);

    try {
      const res = await fetch(`${API}/move`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ position }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Move failed');
        setLoading(false);
        return;
      }

      applyState(data.state, data.winLine, data.aiMove);
    } catch (err) {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [loading, status, applyState]);

  /**
   * Reset the game
   */
  const resetGame = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res  = await fetch(`${API}/reset`, { method: 'POST' });
      const data = await res.json();
      applyState(data.state, null, null);
    } catch (err) {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  }, [applyState]);

  return {
    board,
    currentPlayer,
    status,
    winner,
    winLine,
    aiMove,
    loading,
    error,
    makeMove,
    resetGame,
  };
}
