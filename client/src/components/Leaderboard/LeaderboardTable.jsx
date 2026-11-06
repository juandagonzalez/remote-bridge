import React from 'react';
import './LeaderboardTable.css';

export default function LeaderboardTable({ entries }) {
  return (
    <>
      <p className="leaderboard-table-hint">
        Scroll sideways to see all columns.
      </p>

      <div
        className="leaderboard-table-region"
        role="region"
        aria-label="Leaderboard results"
        tabIndex={0}
      >
        <table className="leaderboard-table">
          <caption className="sr-only">
            Team leaderboard ranked by average practice score
          </caption>

          <thead>
            <tr>
              <th scope="col" className="leaderboard-table__rank">
                Rank
              </th>
              <th scope="col">Name</th>
              <th scope="col" className="leaderboard-table__numeric">
                Score
              </th>
              <th scope="col" className="leaderboard-table__numeric">
                Sessions
              </th>
            </tr>
          </thead>

          <tbody>
            {entries.map((entry) => {
              const isLeading = entry.rank === 1;
              const scoreWidth = Math.max(
                0,
                Math.min(100, entry.score_pct)
              );

              return (
                <tr
                  key={entry.learner_id}
                  className={isLeading ? 'is-leading' : undefined}
                >
                  <td className="leaderboard-table__rank">
                    <span
                      className={
                        isLeading
                          ? 'rank-badge rank-badge--first'
                          : 'rank-badge'
                      }
                    >
                      {entry.rank}
                    </span>
                  </td>

                  <th scope="row">
                    <span className="learner-name">
                      <span
                        className="learner-avatar"
                        aria-hidden="true"
                      >
                        {Array.from(entry.display_name)[0]}
                      </span>

                      <span>{entry.display_name}</span>
                    </span>
                  </th>

                  <td className="leaderboard-table__numeric">
                    <span className="score-value">
                      {entry.score_pct.toFixed(1)}%
                    </span>

                    <span className="score-track" aria-hidden="true">
                      <span style={{ width: `${scoreWidth}%` }} />
                    </span>
                  </td>

                  <td className="leaderboard-table__numeric">
                    <span className="session-count">
                      {entry.session_count}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}