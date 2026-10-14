import { createClient } from "@supabase/supabase-js";

export function admin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use server-only privileged credentials first. Never fall back to a public key.
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!url) throw new Error("SUPABASE_URL não configurado");
  if (!key) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SECRET_KEY nas variáveis de ambiente do Vercel."
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { "x-vantt-admin": "1" } },
  });
}
