import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

/**
 * Service role key — SOLO para uso en servidor (API routes / server components).
 * NUNCA importar este cliente en componentes de cliente ("use client").
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

/**
 * Cliente anónimo (anon key) — safe para usar en el navegador.
 * También válido para Server Components de solo lectura pública.
 */
export const supabase = createClient(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// Alias de compatibilidad con el resto del proyecto.
export const supabasePublic = supabase;
