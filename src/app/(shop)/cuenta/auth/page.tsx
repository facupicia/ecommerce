"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/components/ui/Toast";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const result = await signIn(email, password);
        if (result.error) {
          toast.error("Error al iniciar sesión", { description: result.error });
        } else {
          toast.success("Sesión iniciada");
          router.push("/cuenta");
        }
      } else {
        const result = await signUp(email, password, nombre);
        if (result.error) {
          toast.error("Error al registrarse", { description: result.error });
        } else {
          toast.success("Cuenta creada");
          router.push("/cuenta");
        }
      }
    } catch {
      toast.error("Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)] mt-2">
            {mode === "login"
              ? "Accedé a tus encargos y pedidos"
              : "Creá tu cuenta para hacer encargos"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Nombre
              </label>
              <Input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Contraseña
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Cargando..."
              : mode === "login"
                ? "Iniciar sesión"
                : "Crear cuenta"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--color-fg-muted)]">
          {mode === "login" ? (
            <>
              ¿No tenés cuenta?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-[var(--color-accent)] hover:underline font-medium"
              >
                Registrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tenés cuenta?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-[var(--color-accent)] hover:underline font-medium"
              >
                Iniciá sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
