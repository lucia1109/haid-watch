import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-only client — uses the service role key and bypasses RLS entirely.
// NEVER import this from a 'use client' file or a component that could end
// up in a browser bundle. SUPABASE_SERVICE_ROLE_KEY has no NEXT_PUBLIC_
// prefix specifically so Next.js won't inline it into client code.
//
// Use only where the authenticated moderator's own session genuinely can't
// do the job under the existing RLS policies in supabase/schema.sql: reading
// non-published incidents/media, generating signed media URLs, and updating
// incidents.status (no policy grants any of that to the authenticated role).
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
