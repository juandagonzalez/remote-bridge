import React, { useEffect, useId, useState } from 'react';
import { getJson } from './api';
import './Leaderboard.css';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

function formatDate(value) {
  return dateFormatter.format(new Date(value));
}

export default function Leaderboard({ orgId }) {
  const headingId = useId();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadLeaderboard() {
      setLoading(true);
      setError(false);
      setData(null);

      try {
        const result = await getJson(
          `/api/orgs/${encodeURIComponent(orgId)}/leaderboard`
        );

        if (active) {
          setData(result);
        }
      } catch {
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadLeaderboard();

    return () => {
      active = false;
    };
  }, [orgId]);

  return (
    <section
      className="leaderboard"
      aria-labelledby={headingId}
      aria-busy={loading}
    >
      <header className="leaderboard__header">
        <h2 id={headingId}>Team Leaderboard</h2>

        {data && (
          <p className="leaderboard__window">
            {formatDate(data.window.start)}
            {' to '}
            {formatDate(data.window.end)}
            {' · UTC'}
          </p>
        )}
      </header>

      {loading && (
        <p className="leaderboard__message" role="status">
          Loading leaderboard…
        </p>
      )}

      {!loading && error && (
        <p
          className="leaderboard__message leaderboard__message--error"
          role="alert"
        >
          We couldn’t load the leaderboard. Please refresh the page to try again.
        </p>
      )}

      {!loading && data && data.entries.length === 0 && (
        <p className="leaderboard__message">
          No one has qualified yet. Complete 3 practice sessions to join the board.
        </p>
      )}

      {!loading && data && data.entries.length > 0 && (
        <>
          <p className="leaderboard__description">
            Ranked by average score · At least 3 completed, scored sessions
          </p>

          <div className="leaderboard__table-wrapper">
            <table className="leaderboard__table">
              <caption className="leaderboard__sr-only">
                Team leaderboard ranked by average practice score
              </caption>

              <thead>
                <tr>
                  <th scope="col" className="leaderboard__number">
                    Rank
                  </th>
                  <th scope="col">Name</th>
                  <th scope="col" className="leaderboard__number">
                    Score
                  </th>
                  <th scope="col" className="leaderboard__number">
                    Sessions
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.entries.map((entry) => (
                  <tr
                    key={entry.learner_id}
                    className={
                      entry.rank === 1 ? 'leaderboard__leader' : undefined
                    }
                  >
                    <td className="leaderboard__number">{entry.rank}</td>
                    <th scope="row">{entry.display_name}</th>
                    <td className="leaderboard__number">
                      {entry.score_pct.toFixed(1)}%
                    </td>
                    <td className="leaderboard__number">
                      {entry.session_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}