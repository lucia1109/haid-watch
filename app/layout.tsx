import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'HAID Watch',
  description: 'Community Transparency & Election Incident Reporting Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="brand">HAID Watch</Link>
          <nav>
            <Link href="/report">Report an Incident</Link>
            <Link href="/map">Public Map</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>HAID Watch is non-partisan and does not endorse any political party, candidate, or ideology.</p>
        </footer>
      </body>
    </html>
  );
}
