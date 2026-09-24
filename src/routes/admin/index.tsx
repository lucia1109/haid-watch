import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/lib/supabase";
import { categoryLabel } from "@/lib/categories";
import {
  STATUS_LABELS,
  formatLocation,
  type IncidentStatus,
  type IncidentWithRelations,
} from "@/lib/incidents";
import { StatusBadge } from "@/components/StatusBadge";
import { getAdminIncidents } from "@/lib/admin.functions";
import { getModeratorToken } from "@/lib/moderator";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Moderation Dashboard — HAID Watch" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

const ORDERED_STATUSES: IncidentStatus[] = ["pending_review", "published", "flagged", "rejected"];

function AdminDashboard() {
  const navigate = useNavigate();
  const fetchIncidents = useServerFn(getAdminIncidents);
  const [incidents, setIncidents] = useState<IncidentWithRelations[]>([]);
  const [activeFilter, setActiveFilter] = useState<"" | IncidentStatus>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/admin/login" });
        return;
      }
      const token = await getModeratorToken();
      try {
        const result = await fetchIncidents({ data: { accessToken: token } });
        if (!cancelled) setIncidents(result as unknown as IncidentWithRelations[]);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Could not load reports.";
        if (message.includes("expired")) {
          navigate({ to: "/admin/login" });
          return;
        }
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchIncidents, navigate]);

  const grouped = useMemo(() => {
    const groups: Record<string, IncidentWithRelations[]> = {};
    for (const status of ORDERED_STATUSES) groups[status] = [];
    for (const incident of incidents) {
      (groups[incident.status] ??= []).push(incident);
    }
    return groups;
  }, [incidents]);

  const filteredIncidents = activeFilter
    ? incidents.filter((i) => i.status === activeFilter)
    : incidents;

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <p className="font-display text-lg font-semibold tracking-tight">
            HAID Watch <span className="text-muted-foreground">· Moderation</span>
          </p>
          <button
            onClick={handleSignOut}
            className="rounded-md border border-border bg-card px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-secondary"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading reports…</p>
        ) : error ? (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Reports" value={incidents.length} />
              {ORDERED_STATUSES.map((status) => (
                <StatCard
                  key={status}
                  label={STATUS_LABELS[status]}
                  value={grouped[status]?.length ?? 0}
                  active={activeFilter === status}
                  onClick={() => setActiveFilter((f) => (f === status ? "" : status))}
                />
              ))}
            </div>

            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold tracking-tight">
                {activeFilter ? STATUS_LABELS[activeFilter] : "All Reports"}
              </h2>

              {filteredIncidents.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">No reports here yet.</p>
              ) : (
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredIncidents.map((incident) => (
                    <li key={incident.id}>
                      <Link
                        to="/admin/$id"
                        params={{ id: incident.id }}
                        className="block rounded-lg border border-border bg-card p-5 shadow-(--shadow-card) transition-shadow hover:shadow-(--shadow-lifted)"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                            {categoryLabel(incident.category)}
                          </p>
                          <StatusBadge status={incident.status} />
                        </div>
                        <h3 className="mt-2.5 font-semibold leading-snug">
                          {incident.title}
                        </h3>
                        <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                          {formatLocation(incident)} ·{" "}
                          {new Date(incident.created_at).toLocaleDateString()}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active?: boolean;
  onClick?: () => void;
}) {
  const className = `rounded-lg border p-5 text-left shadow-(--shadow-card) transition-colors ${
    active ? "border-primary bg-primary/5" : "border-border bg-card"
  } ${onClick ? "cursor-pointer hover:border-primary/50" : ""}`;
  const inner = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  ) : (
    <div className={className}>{inner}</div>
  );
}
