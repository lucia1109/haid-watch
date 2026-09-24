import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bcowkmvdwyxhsxhhjwcx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_fo6aOEnge4hx_TVnEUI2kA_x29rx-t2";

const VALID_STATUSES = ["pending_review", "published", "flagged", "rejected"] as const;

const INCIDENT_SELECT = `id, created_at, title, description, category, status,
  is_anonymous, reporter_contact, latitude, longitude,
  states (name), lgas (name), wards (name), polling_units (name),
  incident_media (id, storage_path, media_type)`;

// Verifies the moderator's session token, then returns a service-role client.
// The service role key is required because the project's RLS only grants the
// public role SELECT on published incidents — moderation needs full access.
async function requireModeratorAdmin(accessToken: string) {
  const serviceRoleKey = process.env["HAID_SERVICE_ROLE_KEY"];
  if (!serviceRoleKey) {
    throw new Error(
      "Moderation is not configured yet — the project owner must add the Supabase service role key."
    );
  }

  const anon = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false },
  });
  const {
    data: { user },
    error,
  } = await anon.auth.getUser(accessToken);
  if (error || !user) {
    throw new Error("Your moderator session has expired. Please sign in again.");
  }

  return createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

const authedInput = z.object({ accessToken: z.string().min(1) });

export const getAdminIncidents = createServerFn({ method: "POST" })
  .inputValidator((data) => authedInput.parse(data))
  .handler(async ({ data }) => {
    const admin = await requireModeratorAdmin(data.accessToken);
    const { data: rows, error } = await admin
      .from("incidents")
      .select(INCIDENT_SELECT)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getAdminIncident = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    authedInput.extend({ incidentId: z.string().uuid() }).parse(data)
  )
  .handler(async ({ data }) => {
    const admin = await requireModeratorAdmin(data.accessToken);
    const { data: row, error } = await admin
      .from("incidents")
      .select(INCIDENT_SELECT)
      .eq("id", data.incidentId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateIncidentStatus = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    authedInput
      .extend({
        incidentId: z.string().uuid(),
        status: z.enum(VALID_STATUSES),
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    const admin = await requireModeratorAdmin(data.accessToken);
    const { error } = await admin
      .from("incidents")
      .update({ status: data.status })
      .eq("id", data.incidentId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// The incident-media bucket is private — signed URLs from the service-role
// client are the only way for moderators to view uploaded photos/videos.
export const getMediaUrls = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    authedInput.extend({ paths: z.array(z.string()).max(50) }).parse(data)
  )
  .handler(async ({ data }) => {
    const admin = await requireModeratorAdmin(data.accessToken);
    if (data.paths.length === 0) return [] as (string | null)[];
    const { data: signed, error } = await admin.storage
      .from("incident-media")
      .createSignedUrls(data.paths, 60 * 60);
    if (error || !signed) return data.paths.map(() => null);
    return data.paths.map((_, i) => signed[i]?.signedUrl ?? null);
  });
