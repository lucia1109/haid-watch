import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsSummary from '@/components/admin/StatsSummary';
import ReportCard from '@/components/admin/ReportCard';
import type { IncidentWithRelations } from '@/components/admin/types';

// Must reflect the live moderation queue on every visit, not a build-time
// snapshot — without this Next.js would statically prerender this page once
// (it has no cookies()/headers() call of its own to force dynamic rendering).
export const dynamic = 'force-dynamic';

const STATUS_GROUPS = [
  { status: 'pending_review', label: 'Pending Review' },
  { status: 'published', label: 'Published' },
  { status: 'flagged', label: 'Flagged' },
  { status: 'rejected', label: 'Rejected' },
] as const;

// Reading every incident regardless of status isn't achievable with the
// moderator's own session — schema.sql's only incidents SELECT policy
// requires status = 'published' for every role. supabaseAdmin (service role)
// bypasses that; the moderator's own session already gated this page via
// middleware.ts.
async function loadIncidents(): Promise<IncidentWithRelations[]> {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from('incidents')
    .select(
      `id, created_at, title, description, category, status,
       states (name), lgas (name), wards (name), polling_units (name),
       incident_media (id, storage_path, media_type)`
    )
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as IncidentWithRelations[];
}

export default async function AdminDashboardPage() {
  const incidents = await loadIncidents();

  const todayCount = incidents.filter((incident) => {
    const createdAt = new Date(incident.created_at);
    const now = new Date();
    return (
      createdAt.getFullYear() === now.getFullYear() &&
      createdAt.getMonth() === now.getMonth() &&
      createdAt.getDate() === now.getDate()
    );
  }).length;

  return (
    <section className="admin-page">
      <AdminHeader />
      <StatsSummary
        counts={{
          pending_review: incidents.filter((i) => i.status === 'pending_review').length,
          published: incidents.filter((i) => i.status === 'published').length,
          flagged: incidents.filter((i) => i.status === 'flagged').length,
          rejected: incidents.filter((i) => i.status === 'rejected').length,
        }}
        todayCount={todayCount}
      />

      {STATUS_GROUPS.map(({ status, label }) => {
        const group = incidents.filter((incident) => incident.status === status);
        return (
          <div key={status} className="admin-status-group">
            <h2>{label} <span className="muted">({group.length})</span></h2>
            {group.length === 0 ? (
              <p className="muted">No reports in this category.</p>
            ) : (
              <div className="admin-card-grid">
                {group.map((incident) => (
                  <ReportCard key={incident.id} incident={incident} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
