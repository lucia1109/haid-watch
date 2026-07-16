import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client — safe to use in the browser.
// Respects Row Level Security policies defined in supabase/schema.sql.
// Uses cookie-based session storage (not localStorage) so a logged-in
// moderator's session is also visible to middleware and Server Components.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
