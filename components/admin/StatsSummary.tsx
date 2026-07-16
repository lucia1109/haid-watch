import { STATUS_LABELS, type IncidentStatus } from './types';

const ORDER: IncidentStatus[] = ['pending_review', 'published', 'flagged', 'rejected'];

export default function StatsSummary({
  counts,
  todayCount,
}: {
  counts: Record<IncidentStatus, number>;
  todayCount: number;
}) {
  return (
    <dl className="admin-stats">
      {ORDER.map((status) => (
        <div key={status} className="admin-stat">
          <dt>{STATUS_LABELS[status]}</dt>
          <dd>{counts[status]}</dd>
        </div>
      ))}
      <div className="admin-stat">
        <dt>Today&rsquo;s Reports</dt>
        <dd>{todayCount}</dd>
      </div>
    </dl>
  );
}
