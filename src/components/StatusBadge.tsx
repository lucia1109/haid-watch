import type { IncidentStatus } from "@/lib/incidents";
import { STATUS_LABELS } from "@/lib/incidents";

const STATUS_CLASSES: Record<IncidentStatus, string> = {
  pending_review: "bg-status-pending text-status-pending-foreground",
  published: "bg-status-published text-status-published-foreground",
  flagged: "bg-status-flagged text-status-flagged-foreground",
  rejected: "bg-status-rejected text-status-rejected-foreground",
};

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
