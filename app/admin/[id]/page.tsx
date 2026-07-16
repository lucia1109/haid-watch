import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resolveMediaUrls } from '@/lib/incident-media';
import { categoryLabel } from '@/lib/categories';
import AdminHeader from '@/components/admin/AdminHeader';
import ModerationActions from '@/components/admin/ModerationActions';
import { formatLocation, STATUS_LABELS, type IncidentWithRelations } from '@/components/admin/types';

async function loadIncident(id: string): Promise<IncidentWithRelations | null> {
  const { data, error } = await supabaseAdmin
    .from('incidents')
    .select(
      `id, created_at, title, description, category, status,
       states (name), lgas (name), wards (name), polling_units (name),
       incident_media (id, storage_path, media_type)`
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as IncidentWithRelations | null;
}

export default async function AdminReportDetailPage({ params }: { params: { id: string } }) {
  const incident = await loadIncident(params.id);
  if (!incident) notFound();

  const media = await resolveMediaUrls(incident.incident_media);

  return (
    <section className="admin-page">
      <AdminHeader />

      <div className="report-detail">
        <div className="report-detail-header">
          <h1>{incident.title}</h1>
          <span className={`status-badge status-${incident.status}`}>
            {STATUS_LABELS[incident.status]}
          </span>
        </div>

        <dl className="report-card-meta">
          <dt>Category</dt>
          <dd>{categoryLabel(incident.category)}</dd>
          <dt>Location</dt>
          <dd>{formatLocation(incident)}</dd>
          <dt>Date submitted</dt>
          <dd>{new Date(incident.created_at).toLocaleString()}</dd>
        </dl>

        <p>{incident.description}</p>

        {media.length > 0 && (
          <div className="report-detail-media">
            {media.map((item) =>
              item.url && item.media_type === 'photo' ? (
                <img key={item.id} src={item.url} alt="" />
              ) : item.url && item.media_type === 'video' ? (
                <video key={item.id} src={item.url} controls />
              ) : (
                <span key={item.id} className="muted">Unable to load media</span>
              )
            )}
          </div>
        )}

        <ModerationActions incidentId={incident.id} currentStatus={incident.status} />
      </div>
    </section>
  );
}
