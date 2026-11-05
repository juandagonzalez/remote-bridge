import React from 'react';
import SiteHeader from './components/SiteHeader/SiteHeader.jsx';
import Leaderboard from './components/Leaderboard/Leaderboard.jsx';
import './App.css';

// In production, derive organization access from the authenticated session.
const ORG_ID = 1;

export default function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to leaderboard
      </a>

      <SiteHeader orgId={ORG_ID} />

      <main
        id="main-content"
        className="page-container"
        tabIndex={-1}
      >
        <Leaderboard orgId={ORG_ID} />
      </main>
    </div>
  );
}