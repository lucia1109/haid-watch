import { updateIncidentStatus } from '@/app/admin/actions';
import type { IncidentStatus } from './types';

const ACTIONS: { status: IncidentStatus; label: string; className: string }[] = [
  { status: 'published', label: 'Publish', className: 'btn-primary' },
  { status: 'flagged', label: 'Flag', className: 'btn-secondary' },
  { status: 'rejected', label: 'Reject', className: 'btn-secondary' },
];

export default function ModerationActions({
  incidentId,
  currentStatus,
}: {
  incidentId: string;
  currentStatus: IncidentStatus;
}) {
  return (
    <div className="moderation-actions">
      {ACTIONS.map(({ status, label, className }) => (
        <form key={status} action={updateIncidentStatus.bind(null, incidentId, status)}>
          <button type="submit" className={`btn ${className}`} disabled={currentStatus === status}>
            {label}
          </button>
        </form>
      ))}
    </div>
  );
}
