export type IncidentStatus = "pending_review" | "published" | "flagged" | "rejected";

export type IncidentMedia = {
  id: string;
  storage_path: string;
  media_type: "photo" | "video";
};

export type LocationNames = {
  states: { name: string } | null;
  lgas: { name: string } | null;
  wards: { name: string } | null;
  polling_units: { name: string } | null;
};

export type IncidentWithRelations = LocationNames & {
  id: string;
  created_at: string;
  title: string;
  description: string;
  category: string;
  status: IncidentStatus;
  is_anonymous: boolean;
  reporter_contact: string | null;
  latitude: number | null;
  longitude: number | null;
  incident_media: IncidentMedia[];
};

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  pending_review: "Pending Review",
  published: "Published",
  flagged: "Flagged",
  rejected: "Rejected",
};

export function formatLocation(incident: LocationNames): string {
  const parts = [
    incident.states?.name,
    incident.lgas?.name,
    incident.wards?.name,
    incident.polling_units?.name,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" › ") : "No location provided";
}
