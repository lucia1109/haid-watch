import { supabase } from "@/lib/supabase";

// Reads the current moderator session's access token for server-function
// calls. Returns null when signed out.
export async function getModeratorToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}
