/**
 * StatusBar — Shows game status, current player, winner, or draw message
 */

export default function StatusBar({ status, winner, currentPlayer, loading, error }) {
  const getMessage = () => {
    if (loading)             return 'Thinking...';
    if (error)               return error;
    if (status === 'win')    return winner === 'X' ? 'You win!' : 'AI wins!';
    if (status === 'draw')   return "It's a draw!";
    return currentPlayer === 'X' ? 'Your turn (X)' : 'AI is thinking... (O)';
  };

  const getClass = () => {
    if (error)             return 'status-bar status-error';
    if (status === 'win')  return winner === 'X' ? 'status-bar status-win-x' : 'status-bar status-win-o';
    if (status === 'draw') return 'status-bar status-draw';
    if (loading)           return 'status-bar status-loading';
    return 'status-bar status-ongoing';
  };

  return (
    <div className={getClass()}>
      {loading && <span className="spinner" />}
      <span>{getMessage()}</span>
    </div>
  );
}
