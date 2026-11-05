import React from 'react';
import './SiteHeader.css';

export default function SiteHeader({ orgId }) {
  return (
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
          Organization {orgId}
        </div>
      </div>
    </header>
  );
}