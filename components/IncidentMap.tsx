'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/supabase';

type Incident = {
  id: string;
  title: string;
  description: string;
  category: string;
  latitude: number | null;
  longitude: number | null;
};

// Nigeria's rough geographic center, used as the default map view.
const NIGERIA_CENTER: [number, number] = [9.082, 8.6753];

export default function IncidentMap() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadIncidents() {
      const { data, error } = await supabase
        .from('incidents')
        .select('id, title, description, category, latitude, longitude')
        .eq('status', 'published')
        .not('latitude', 'is', null);

      if (!error && data) setIncidents(data as Incident[]);
      setLoading(false);
    }
    loadIncidents();
  }, []);

  return (
    <MapContainer center={NIGERIA_CENTER} zoom={6} style={{ height: '70vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {incidents.map((incident) => (
        incident.latitude && incident.longitude ? (
          <Marker key={incident.id} position={[incident.latitude, incident.longitude]}>
            <Popup>
              <strong>{incident.title}</strong>
              <p>{incident.description}</p>
              <em>{incident.category.replace('_', ' ')}</em>
            </Popup>
          </Marker>
        ) : null
      ))}
      {!loading && incidents.length === 0 && (
        <p style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
          No published reports with location data yet.
        </p>
      )}
    </MapContainer>
  );
}
