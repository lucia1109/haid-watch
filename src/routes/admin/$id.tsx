import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
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
import {
  getAdminIncident,
  getMediaUrls,
  updateIncidentStatus,
} from "@/lib/admin.functions";
import { getModeratorToken } from "@/lib/moderator";

export const Route = createFileRoute("/admin/$id")({
  head: () => ({
    meta: [
      { title: "Report Detail — HAID Watch Moderation" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDetailPage,
});

function AdminDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const router = useRouter();
  const fetchIncident = useServerFn(getAdminIncident);
  const fetchMediaUrls = useServerFn(getMediaUrls);
  const changeStatus = useServerFn(updateIncidentStatus);

  const [incident, setIncident] = useState<IncidentWithRelations | null>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
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
        const result = (await fetchIncident({
          data: { accessToken: token, incidentId: id },
        })) as unknown as IncidentWithRelations | null;
        if (cancelled) return;
        if (!result) {
          setError("Report not found.");
          return;
        }
        setIncident(result);

        if (result.incident_media.length > 0) {
          try {
            const urls = await fetchMediaUrls({
              data: {
                accessToken: token,
                paths: result.incident_media.map((m) => m.storage_path),
              },
            });
            if (!cancelled)
              setMediaUrls(urls.filter((u): u is string => typeof u === "string"));
          } catch {
            if (!cancelled)
              setMediaError("Could not load attached photos. Try refreshing the page.");
          }
        }
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Could not load report.";
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
  }, [fetchIncident, fetchMediaUrls, id, navigate]);

  const handleStatus = useCallback(
    async (status: IncidentStatus) => {
      setUpdating(true);
      setError(null);
      try {
        const token = await getModeratorToken();
        await changeStatus({ data: { accessToken: token, incidentId: id, status } });
        router.invalidate();
        navigate({ to: "/admin" });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not update report.";
        if (message.includes("expired")) {
          navigate({ to: "/admin/login" });
          return;
        }
        setError(message);
      } finally {
        setUpdating(false);
      }
    },
    [changeStatus, id, navigate, router]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-sm text-muted-foreground">
        Loading report…
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-sm text-destructive">{error ?? "Report not found."}</p>
        <Link to="/admin" className="mt-4 inline-block text-sm font-semibold text-primary">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 animate-fade-up">
      <Link
        to="/admin"
        className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
      >
        ← Back to Dashboard
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
          {categoryLabel(incident.category)}
        </p>
        <StatusBadge status={incident.status} />
      </div>

      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
        {incident.title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {formatLocation(incident)} ·{" "}
        {new Date(incident.created_at).toLocaleDateString()} · Reporter:{" "}
        {incident.is_anonymous ? "Anonymous" : (incident.reporter_contact ?? "Not provided")}
      </p>
      {incident.latitude && incident.longitude && (
        <p className="mt-1 text-xs text-muted-foreground">
          Pinned at {incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)}
        </p>
      )}

      <div className="rule mt-8 pt-8">
        <h2 className="font-display text-lg font-semibold">Description</h2>
        <p className="mt-3 whitespace-pre-line leading-relaxed">
          {incident.description}
        </p>
      </div>

      <div className="rule mt-8 pt-8">
        <h2 className="font-display text-lg font-semibold">Attached Photos</h2>
        {incident.incident_media.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No photos attached.</p>
        ) : mediaError ? (
          <p className="mt-3 text-sm text-destructive">{mediaError}</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {mediaUrls.map((url) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                <img
                  src={url}
                  alt="Incident media"
                  className="aspect-square w-full rounded-md border border-border object-cover"
                />
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="rule mt-8 pt-8">
        <h2 className="font-display text-lg font-semibold">Moderation</h2>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {(Object.keys(STATUS_LABELS) as IncidentStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => handleStatus(status)}
              disabled={updating || incident.status === status}
              className={`rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-default disabled:opacity-40 ${
                incident.status === status
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-secondary"
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
