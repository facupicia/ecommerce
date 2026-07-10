import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://placeholder-please-configure-in-vercel.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export interface AuthUser {
  id: string;
  email: string | undefined;
}

/**
 * Extrae el access token de las cookies de la request.
 */
function getAccessToken(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").filter(Boolean).map((c) => {
      const [key, ...rest] = c.split("=");
      return [key, rest.join("=")];
    })
  );
  return cookies["sb-access-token"] || null;
}

/**
 * Obtiene el usuario autenticado desde las cookies.
 * Devuelve null si no hay sesión válida.
 */
export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  const accessToken = getAccessToken(request);
  if (!accessToken) return null;

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) return null;
    return { id: user.id, email: user.email };
  } catch {
    return null;
  }
}

/**
 * Devuelve el usuario autenticado o una Response 401.
 */
export async function requireAuth(
  request: Request
): Promise<{ user: AuthUser; error: null } | { user: null; error: Response }> {
  const user = await getAuthUser(request);
  if (!user) {
    return {
      user: null,
      error: Response.json({ error: "No autenticado" }, { status: 401 }),
    };
  }
  return { user, error: null };
}
