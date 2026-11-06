import React, { useEffect, useId, useState } from 'react';
import { getJson } from '../../api';
import LeaderboardHeader from './LeaderboardHeader.jsx';
import LeaderboardSummary from './LeaderboardSummary.jsx';
import LeaderboardTable from './LeaderboardTable.jsx';
import LeaderboardFeedback from './LeaderboardFeedback.jsx';
import './Leaderboard.css';

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

  // Do not show the previous organization's data during a prop change.
  const current =
    state.orgId === orgId
      ? state
      : { status: 'loading', data: null };

  const loading = current.status === 'loading';
  const data = current.data;
  const entries = data?.entries ?? [];
  const hasResults =
    current.status === 'success' && entries.length > 0;

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
    >
      <LeaderboardHeader
        headingId={headingId}
        dateWindow={data?.window}
        loading={loading}
        onRefresh={reload}
      />

      <div className="leaderboard__content">
        {hasResults ? (
          <>
            <LeaderboardSummary entries={entries} />
            <LeaderboardTable entries={entries} />
          </>
        ) : (
          <LeaderboardFeedback
            status={current.status}
            onRetry={reload}
          />
        )}
      </div>
    </section>
  );
}