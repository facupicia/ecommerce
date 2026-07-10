"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    nombre: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  const refresh = useCallback(async () => {
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    setUser(u ?? null);
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    await refresh();
    return {};
  }

  async function signUp(email: string, password: string, nombre: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre },
      },
    });
    if (error) return { error: error.message };

    // Perfil de cliente se crea automáticamente via trigger en auth.users
    return {};
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
