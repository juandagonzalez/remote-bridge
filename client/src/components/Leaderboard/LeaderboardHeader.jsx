import React from 'react';
import './LeaderboardHeader.css';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export default function LeaderboardHeader({
  headingId,
  dateWindow,
  loading,
  onRefresh,
}) {
  const windowLabel = dateWindow
    ? `${dateFormatter.format(
        new Date(dateWindow.start)
      )} to ${dateFormatter.format(new Date(dateWindow.end))} · UTC`
    : 'Rolling 30-day window';

  return (
    <header className="leaderboard-header">
      <div>
        <h1 id={headingId}>Team Leaderboard</h1>
        <p className="leaderboard-header__window">
          {windowLabel}
        </p>
      </div>

      <button
        type="button"
        className="leaderboard-header__refresh"
        onClick={onRefresh}
        disabled={loading}
        aria-label="Refresh leaderboard"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M20 7v5h-5M4 17v-5h5M6.1 7a7 7 0 0 1 11.5-1.4L20 8M4 16l2.4 2.4A7 7 0 0 0 17.9 17"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span>Refresh</span>
      </button>
    </header>
  );
}