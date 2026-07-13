'use client';

import dynamic from 'next/dynamic';

// Leaflet needs `window`, so it must be loaded client-side only.
const IncidentMap = dynamic(() => import('@/components/IncidentMap'), { ssr: false });

export default function MapPage() {
  return (
    <section className="map-page">
      <h1>Public Transparency Dashboard</h1>
      <p className="muted">Browse published incident reports by location.</p>
      <IncidentMap />
    </section>
  );
}
