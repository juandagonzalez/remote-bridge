import React from 'react';
import Leaderboard from './Leaderboard.jsx';

// In the real app, the organization comes from the authenticated session.
const ORG_ID = 1;

export default function App() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>RemoteBridge</h1>
      <p>Organization {ORG_ID}</p>
      <Leaderboard orgId={ORG_ID} />
    </main>
  );
}