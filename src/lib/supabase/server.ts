import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isServerSupabaseConfigured = Boolean(
  supabaseUrl.trim() && serviceRoleKey.trim()
);

let cachedServerClient: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient | null {
  if (!isServerSupabaseConfigured) return null;
  if (!cachedServerClient) {
    cachedServerClient = createClient(supabaseUrl.trim(), serviceRoleKey.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return cachedServerClient;
}
