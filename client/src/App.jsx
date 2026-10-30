import React from 'react';

// The org is hard-coded for this exercise. In the real app it comes from the session.
const ORG_ID = 1;

export default function App() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>RemoteBridge</h1>
      <p>Organization {ORG_ID}</p>
      {/* TODO: render the team leaderboard here */}
    </main>
  );
}
