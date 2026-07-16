export { formatLocation } from '@/lib/format-location';

export type IncidentStatus = 'pending_review' | 'published' | 'flagged' | 'rejected';

export type IncidentMedia = {
  id: string;
  storage_path: string;
  media_type: 'photo' | 'video';
};

export type IncidentWithRelations = {
  id: string;
  created_at: string;
  title: string;
  description: string;
  category: string;
  status: IncidentStatus;
  states: { name: string } | null;
  lgas: { name: string } | null;
  wards: { name: string } | null;
  polling_units: { name: string } | null;
  incident_media: IncidentMedia[];
};

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  pending_review: 'Pending Review',
  published: 'Published',
  flagged: 'Flagged',
  rejected: 'Rejected',
};
