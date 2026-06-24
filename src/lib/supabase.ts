import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-please-configure-in-vercel.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";

/**
 * Service role key — SOLO para uso en servidor (API routes / server components).
 * NUNCA importar este cliente en componentes de cliente ("use client").
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);

/**
 * Cliente anónimo (anon key) — safe para usar en el navegador.
 * También válido para Server Components de solo lectura pública.
 */
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Alias de compatibilidad con el resto del proyecto.
export const supabasePublic = supabase;

