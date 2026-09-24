import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabase";
import { categoryLabel } from "@/lib/categories";

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
    supabase
      .from("incidents")
      .select("id, title, description, category, latitude, longitude")
      .eq("status", "published")
      .not("latitude", "is", null)
      .then(({ data, error }) => {
        if (!error && data) setIncidents(data as Incident[]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative overflow-hidden rounded-lg border border-border shadow-(--shadow-card)">
      <MapContainer center={NIGERIA_CENTER} zoom={6} style={{ height: "65vh", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {incidents.map((incident) =>
          incident.latitude && incident.longitude ? (
            <Marker key={incident.id} position={[incident.latitude, incident.longitude]}>
              <Popup>
                <strong>{incident.title}</strong>
                <p>{incident.description}</p>
                <em>{categoryLabel(incident.category)}</em>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
      {!loading && incidents.length === 0 && (
        <p className="absolute right-3 top-3 z-[1000] max-w-56 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground shadow-(--shadow-card)">
          No published reports with location data yet.
        </p>
      )}
    </div>
  );
}
