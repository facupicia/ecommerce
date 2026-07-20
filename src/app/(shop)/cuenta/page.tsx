"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { toast } from "@/components/ui/Toast";
import { ShoppingBag, User, LogOut, Package } from "lucide-react";
import Link from "next/link";

export default function CuentaPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<{
    nombre: string;
    telefono: string;
    direccion: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/cuenta/auth");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/client/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data.profile) setProfile(data.profile);
        })
        .catch(() => {});
    }
  }, [user]);

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/client/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        toast.success("Perfil actualizado");
      } else {
        toast.error("Error al guardar");
      }
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[var(--color-border)] border-t-[var(--color-fg)] rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mi cuenta</h1>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link href="/cuenta/encargos">
          <Card
            padding="md"
            className="hover:border-[var(--color-border-focus)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--color-bg-subtle)] rounded-lg">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Mis encargos</p>
                <p className="text-xs text-[var(--color-fg-muted)]">
                  Ver historial
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/encargos/nuevo">
          <Card
            padding="md"
            className="hover:border-[var(--color-border-focus)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--color-bg-subtle)] rounded-lg">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Nuevo encargo</p>
                <p className="text-xs text-[var(--color-fg-muted)]">
                  Catálogo o personalizado
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Datos personales */}
      <Card padding="md">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <User className="h-4 w-4" />
          Datos personales
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Email
            </label>
            <Input value={user.email || ""} disabled />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Nombre
            </label>
            <Input
              value={profile?.nombre || ""}
              onChange={(e) =>
                setProfile((p) => ({ ...p!, nombre: e.target.value }))
              }
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Teléfono
            </label>
            <Input
              value={profile?.telefono || ""}
              onChange={(e) =>
                setProfile((p) => ({ ...p!, telefono: e.target.value }))
              }
              placeholder="Tu teléfono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Dirección
            </label>
            <Input
              value={profile?.direccion || ""}
              onChange={(e) =>
                setProfile((p) => ({ ...p!, direccion: e.target.value }))
              }
              placeholder="Tu dirección"
            />
          </div>

          <Button onClick={saveProfile} disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </Card>

      {/* Cerrar sesión */}
      <div className="mt-6 text-center">
        <Button
          variant="ghost"
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
          className="text-[var(--color-fg-muted)]"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
