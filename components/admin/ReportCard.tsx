import Link from 'next/link';
import { resolveMediaUrls } from '@/lib/incident-media';
import { categoryLabel } from '@/lib/categories';
import { formatLocation, type IncidentWithRelations } from './types';

export default async function ReportCard({ incident }: { incident: IncidentWithRelations }) {
  const media = await resolveMediaUrls(incident.incident_media);
  const thumbnails = media.slice(0, 3);

  return (
    <Link href={`/admin/${incident.id}`} className="report-card">
      <h3>{incident.title}</h3>
      <p className="report-card-description">{incident.description}</p>

      <dl className="report-card-meta">
        <dt>Category</dt>
        <dd>{categoryLabel(incident.category)}</dd>
        <dt>Location</dt>
        <dd>{formatLocation(incident)}</dd>
        <dt>Submitted</dt>
        <dd>{new Date(incident.created_at).toLocaleDateString()}</dd>
      </dl>

      {thumbnails.length > 0 && (
        <div className="report-card-media">
          {thumbnails.map((item) =>
            item.url && item.media_type === 'photo' ? (
              <img key={item.id} src={item.url} alt="" />
            ) : (
              <span key={item.id} className="report-card-media-placeholder muted">
                {item.media_type}
              </span>
            )
          )}
          {media.length > thumbnails.length && (
            <span className="muted">+{media.length - thumbnails.length} more</span>
          )}
        </div>
      )}
    </Link>
  );
}
