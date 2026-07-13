import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="hero">
      <h1>See it. Report it. Keep your community informed.</h1>
      <p>
        HAID Watch lets citizens document and share incidents in their communities,
        particularly during election periods — transparently, and without political bias.
      </p>
      <div className="cta-row">
        <Link className="btn btn-primary" href="/report">Report an Incident</Link>
        <Link className="btn btn-secondary" href="/map">View Public Map</Link>
      </div>
    </section>
  );
}
