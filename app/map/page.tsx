'use client';

import dynamic from 'next/dynamic';
import IncidentSearch from '@/components/IncidentSearch';

// Leaflet needs `window`, so it must be loaded client-side only.
const IncidentMap = dynamic(() => import('@/components/IncidentMap'), { ssr: false });

export default function MapPage() {
  return (
    <section className="map-page">
      <h1>Public Transparency Dashboard</h1>
      <p className="muted">
        Browse published incident reports. The map only shows reports submitted with a
        location pin — search covers every published report.
      </p>
      <IncidentMap />
      <h2>Search Reports</h2>
      <IncidentSearch />
    </section>
  );
}
