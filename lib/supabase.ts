import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client — safe to use in the browser.
// Respects Row Level Security policies defined in supabase/schema.sql.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
