/**
 * AgentMonitor — Live Agent Activity Panel
 *
 * Connects to the backend SSE stream (/agent-stream) and displays
 * every agent event in real time as it happens during a game turn.
 *
 * Each event shows:
 *   - Agent name badge
 *   - Status icon (running / success / error)
 *   - Message
 *   - Timestamp
 */

import { useEffect, useRef, useState } from 'react';

const AGENT_COLORS = {
  Orchestrator:    '#a78bfa',
  ValidationAgent: '#60a5fa',
  StateManager:    '#34d399',
  GameLogicAgent:  '#fbbf24',
  AIAgent:         '#f87171',
};

const STATUS_ICONS = {
  running: '⚙️',
  success: '✅',
  error:   '❌',
};

function AgentBadge({ name }) {
  const color = AGENT_COLORS[name] || '#94a3b8';
  return (
    <span className="agent-badge" style={{ borderColor: color, color }}>
      {name}
    </span>
  );
}

function EventRow({ event }) {
  const time = new Date(event.timestamp).toLocaleTimeString('en-US', {
    hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <div className={`event-row event-${event.status}`}>
      <span className="event-time">{time}</span>
      <span className="event-icon">{STATUS_ICONS[event.status] || '•'}</span>
      <AgentBadge name={event.agent} />
      <span className="event-message">{event.message}</span>
    </div>
  );
}

export default function AgentMonitor() {
  const [events, setEvents]       = useState([]);
  const [connected, setConnected] = useState(false);
  const bottomRef                 = useRef(null);
  const esSrc                      = useRef(null);

  // Connect to SSE on mount
  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || '';
    const es = new EventSource(`${base}/agent-stream`);
    esSrc.current = es;

    es.onopen = () => {
      setConnected(true);
    };

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        setEvents((prev) => [...prev.slice(-199), event]); // keep last 200
      } catch (_) {}
    };

    es.onerror = () => {
      setConnected(false);
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, []);

  // Auto-scroll to bottom whenever new events arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const clearEvents = () => setEvents([]);

  return (
    <div className="monitor">
      {/* Header */}
      <div className="monitor-header">
        <div className="monitor-title">
          <span className="monitor-icon">🔍</span>
          <span>Agent Monitor</span>
          <span className={`monitor-dot ${connected ? 'dot-live' : 'dot-off'}`} />
          <span className="monitor-status">{connected ? 'LIVE' : 'OFFLINE'}</span>
        </div>
        <button className="clear-btn" onClick={clearEvents} title="Clear log">
          Clear
        </button>
      </div>

      {/* Agent Legend */}
      <div className="agent-legend">
        {Object.entries(AGENT_COLORS).map(([name, color]) => (
          <span key={name} className="legend-item" style={{ color }}>
            ● {name}
          </span>
        ))}
      </div>

      {/* Events Feed */}
      <div className="monitor-feed">
        {events.length === 0 ? (
          <div className="monitor-empty">
            Make a move to see agents in action...
          </div>
        ) : (
          events.map((event, i) => <EventRow key={i} event={event} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
