import { useEffect, useId, useState } from 'react';
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

function RefreshIcon() {
  return (
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
  );
}

export default function Leaderboard({ orgId }) {
  const headingId = useId();
  const [requestVersion, setRequestVersion] = useState(0);

  const [state, setState] = useState({
    orgId,
    status: 'loading',
    data: null,
  });

  useEffect(() => {
    let active = true;

    setState({
      orgId,
      status: 'loading',
      data: null,
    });

    async function loadLeaderboard() {
      try {
        const data = await getJson(
          `/api/orgs/${encodeURIComponent(orgId)}/leaderboard`
        );

        if (active) {
          setState({
            orgId,
            status: 'success',
            data,
          });
        }
      } catch {
        if (active) {
          setState({
            orgId,
            status: 'error',
            data: null,
          });
        }
      }
    }

    loadLeaderboard();

    return () => {
      active = false;
    };
  }, [orgId, requestVersion]);

  // Hide the previous organization's data immediately on prop changes.
  const current =
    state.orgId === orgId
      ? state
      : { status: 'loading', data: null };

  const loading = current.status === 'loading';
  const error = current.status === 'error';
  const data = current.data;
  const entries = data?.entries ?? [];

  function reload() {
    setState({
      orgId,
      status: 'loading',
      data: null,
    });

    setRequestVersion((version) => version + 1);
  }

  return (
    <section
      className="leaderboard"
      aria-labelledby={headingId}
      aria-busy={loading}
    >
      <header className="leaderboard__header">
        <div>
          <h1 id={headingId}>Team Leaderboard</h1>

          <p className="leaderboard__window">
            {data
              ? `${formatDate(data.window.start)} to ${formatDate(
                  data.window.end
                )} · UTC`
              : 'Rolling 30-day window'}
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={reload}
          disabled={loading}
          aria-label="Refresh leaderboard"
        >
          <RefreshIcon />
          <span>Refresh</span>
        </button>
      </header>

      {data && entries.length > 0 && (
        <dl className="leaderboard__metrics">
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
              {entries[0].score_pct.toFixed(1)}
              <span>%</span>
            </dd>
          </div>
        </dl>
      )}

      {loading && (
        <div className="leaderboard__state">
          <p role="status">Loading leaderboard…</p>
        </div>
      )}

      {error && (
        <div className="leaderboard__state">
          <p role="alert">We couldn’t load the leaderboard.</p>

          <button
            type="button"
            className="primary-button"
            onClick={reload}
          >
            Try again
          </button>
        </div>
      )}

      {data && entries.length === 0 && (
        <div className="leaderboard__state">
          <p>
            No one has qualified yet. Complete 3 practice sessions to
            join the board.
          </p>
        </div>
      )}

      {data && entries.length > 0 && (
        <>
          <p className="table-scroll-hint">
            Scroll sideways to see all columns.
          </p>

          <div
            className="leaderboard__table-wrapper"
            role="region"
            aria-label="Leaderboard results"
            tabIndex={0}
          >
            <table className="leaderboard__table">
              <caption className="sr-only">
                Team leaderboard ranked by average practice score
              </caption>

              <thead>
                <tr>
                  <th scope="col" className="leaderboard__rank">
                    Rank
                  </th>
                  <th scope="col">Name</th>
                  <th scope="col" className="leaderboard__numeric">
                    Score
                  </th>
                  <th scope="col" className="leaderboard__numeric">
                    Sessions
                  </th>
                </tr>
              </thead>

              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.learner_id}
                    className={
                      entry.rank === 1 ? 'is-leading' : undefined
                    }
                  >
                    <td className="leaderboard__rank">
                      <span
                        className={
                          entry.rank === 1
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

                    <td className="leaderboard__numeric">
                      <span className="score-value">
                        {entry.score_pct.toFixed(1)}%
                      </span>

                      <span
                        className="score-track"
                        aria-hidden="true"
                      >
                        <span
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(100, entry.score_pct)
                            )}%`,
                          }}
                        />
                      </span>
                    </td>

                    <td className="leaderboard__numeric">
                      <span className="session-count">
                        {entry.session_count}
                      </span>
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