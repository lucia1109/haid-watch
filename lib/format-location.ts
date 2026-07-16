type LocationNames = {
  states: { name: string } | null;
  lgas: { name: string } | null;
  wards: { name: string } | null;
  polling_units: { name: string } | null;
};

export function formatLocation(incident: LocationNames): string {
  const parts = [
    incident.states?.name,
    incident.lgas?.name,
    incident.wards?.name,
    incident.polling_units?.name,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' › ') : 'No location provided';
}
