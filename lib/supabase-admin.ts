import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-only client factory — uses the service role key and bypasses RLS
// entirely. NEVER import this from a 'use client' file or a component that
// could end up in a browser bundle. SUPABASE_SERVICE_ROLE_KEY has no
// NEXT_PUBLIC_ prefix specifically so Next.js won't inline it into client
// code.
//
// Use only where the authenticated moderator's own session genuinely can't
// do the job under the existing RLS policies in supabase/schema.sql: reading
// non-published incidents/media, generating signed media URLs, and updating
// incidents.status (no policy grants any of that to the authenticated role).
//
// A factory, not a module-level singleton: a client created once at server
// startup can capture a `fetch` reference that Next.js's per-request cache
// controls never touch, so its queries get served from the Data Cache
// indefinitely — moderation data would go stale and never refresh, even
// with force-dynamic on the page. Creating it fresh per call, plus the
// explicit `cache: 'no-store'` below, rules that out regardless of which
// Next.js caching layer would otherwise apply.
export function createSupabaseAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}
