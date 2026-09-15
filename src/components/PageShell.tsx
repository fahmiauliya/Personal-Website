import type { ReactNode } from 'react';
import SiteNavigation from './SiteNavigation';

type PageShellProps = {
  children: ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="page-shell">
      <header className="site-header entrance">
        <SiteNavigation />
      </header>
      <main id="main-content" className="home-main">
        {children}
      </main>
      <footer className="site-footer entrance">
        <small>© 2026 Fahmi Auliya. All rights reserved.</small>
      </footer>
    </div>
  );
}
