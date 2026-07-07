"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

export function SidebarFooter({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (!res.ok) throw new Error("Error al cerrar sesión");
      toast.success("Sesión cerrada");
      router.push("/admin/login");
    } catch (e: any) {
      toast.error(e.message || "No se pudo cerrar sesión");
      setLoading(false);
    }
  }

  return (
    <div className="border-t border-[var(--color-border)] p-2 space-y-0.5">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-subtle)] transition-colors"
        title={collapsed ? "Ir a la tienda" : undefined}
      >
        <ExternalLink className="h-4 w-4 flex-shrink-0" strokeWidth={1.6} />
        {!collapsed && <span className="text-[13px]">Ir a la tienda</span>}
      </a>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors disabled:opacity-50"
        title={collapsed ? "Cerrar sesión" : undefined}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4 flex-shrink-0" strokeWidth={1.6} />
        )}
        {!collapsed && <span className="text-[13px]">Cerrar sesión</span>}
      </button>
    </div>
  );
}
