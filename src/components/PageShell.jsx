import React from 'react';

export default function PageShell({ children }) {
  return (
    <div className="page-shell">
      <header className="site-header entrance">
        <span className="wordmark">Fahmi Auliya</span>
      </header>
      <main id="main-content">{children}</main>
      <footer className="site-footer entrance">
        <small>© 2026 Fahmi Auliya. All rights reserved.</small>
      </footer>
    </div>
  );
}
