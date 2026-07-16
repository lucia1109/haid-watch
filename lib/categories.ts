export const CATEGORIES: { value: string; label: string }[] = [
  { value: 'election_incident', label: 'Election Incident' },
  { value: 'security_concern', label: 'Security Concern' },
  { value: 'community_disturbance', label: 'Community Disturbance' },
  { value: 'voter_intimidation', label: 'Voter Intimidation' },
  { value: 'public_safety', label: 'Public Safety Observation' },
];

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
