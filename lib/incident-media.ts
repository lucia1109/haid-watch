import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import type { IncidentMedia } from '@/components/admin/types';

const SIGNED_URL_TTL_SECONDS = 60 * 60;

// The incident-media bucket has no SELECT policy for any role (only the
// anon-upload INSERT policy from schema.sql), so neither the moderator's
// session nor a public URL can read it — signed URLs from the service-role
// client are the only way to display uploaded photos here.
export async function resolveMediaUrls(
  media: IncidentMedia[]
): Promise<(IncidentMedia & { url: string | null })[]> {
  if (media.length === 0) return [];

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.storage
    .from('incident-media')
    .createSignedUrls(
      media.map((m) => m.storage_path),
      SIGNED_URL_TTL_SECONDS
    );

  if (error || !data) {
    return media.map((m) => ({ ...m, url: null }));
  }

  return media.map((m, i) => ({ ...m, url: data[i]?.signedUrl ?? null }));
}
