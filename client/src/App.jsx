import Leaderboard from './Leaderboard.jsx';
import './App.css';

// In production, derive the organization from the authenticated session.
const ORG_ID = 1;

export default function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to leaderboard
      </a>

      <header className="site-header">
        <div className="site-header__inner">
          <div className="brand" aria-label="RemoteBridge">
            <span className="brand__symbol" aria-hidden="true">
              rb
            </span>

            <span>
              Remote<span className="brand__light">Bridge</span>
            </span>
          </div>

          <div className="organization-chip">
            <span
              className="organization-chip__dot"
              aria-hidden="true"
            />
            Organization {ORG_ID}
          </div>
        </div>
      </header>

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