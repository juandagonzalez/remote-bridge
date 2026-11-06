import React from 'react';
import './LeaderboardSummary.css';

export default function LeaderboardSummary({ entries }) {
  const leadingEntry = entries[0];

  if (!leadingEntry) {
    return null;
  }

  return (
    <dl className="leaderboard-summary">
      <div>
        <dt>Learners shown</dt>
        <dd>
          {entries.length}
          <span> / up to 10</span>
        </dd>
      </div>

      <div>
        <dt>Leading average</dt>
        <dd>
          {leadingEntry.score_pct.toFixed(1)}
          <span>%</span>
        </dd>
      </div>
    </dl>
  );
}