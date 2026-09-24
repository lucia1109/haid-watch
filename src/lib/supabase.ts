import { createClient } from "@supabase/supabase-js";

// HAID Watch's existing external Supabase project (publishable key only —
// safe for the browser, every read/write is governed by Row Level Security).
const supabaseUrl =
  import.meta.env["VITE_SUPABASE_URL"] ?? "https://bcowkmvdwyxhsxhhjwcx.supabase.co";
const supabasePublishableKey =
  import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
  "sb_publishable_fo6aOEnge4hx_TVnEUI2kA_x29rx-t2";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
