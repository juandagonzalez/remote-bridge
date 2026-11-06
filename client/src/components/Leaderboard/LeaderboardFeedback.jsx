import React from 'react';
import './LeaderboardFeedback.css';

export default function LeaderboardFeedback({ status, onRetry }) {
  if (status === 'loading') {
    return (
      <div className="leaderboard-feedback">
        <p role="status">Loading leaderboard…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="leaderboard-feedback">
        <p role="alert">We couldn’t load the leaderboard.</p>

        <button
          type="button"
          className="leaderboard-feedback__retry"
          onClick={onRetry}
        >
          Try again
        </button>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="leaderboard-feedback">
        <p>
          No one has qualified yet. Complete 3 practice sessions to
          join the board.
        </p>
      </div>
    );
  }

  return null;
}