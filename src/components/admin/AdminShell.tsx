"use client";

import { ReactNode, useState, useEffect } from "react";
import { Menu, X, Search, Bell, Sun, Moon, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "./Sidebar";
import { SidebarFooter } from "./SidebarFooter";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { CommandPalette } from "./CommandPalette";

interface AdminShellProps {
  children: ReactNode;
}

const BREADCRUMB_LABELS: Record<string, string> = {
  admin: "Admin",
  productos: "Productos",
  nuevo: "Nuevo",
  ordenes: "Órdenes",
  visitas: "Visitas",
  configuracion: "Configuración",
  modulos: "Módulos",
  calculadora: "Calculadora",
  cotizaciones: "Cotizaciones",
};

function getBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((part, idx) => {
    const href = "/" + parts.slice(0, idx + 1).join("/");
    const label = BREADCRUMB_LABELS[part] || (part.length > 12 ? part.slice(0, 8) + "…" : part);
    return { href, label };
  });
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("admin:sidebar-collapsed") === "true";
    setCollapsed(saved);
  }, []);

  useEffect(() => {
    const stored = (localStorage.getItem("admin:theme") as "light" | "dark" | null) || "light";
    setTheme(stored);
    document.documentElement.dataset.theme = stored;
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("admin:sidebar-collapsed", String(next));
      return next;
    });
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("admin:theme", next);
    document.documentElement.dataset.theme = next;
  }

  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[999] focus:bg-[var(--color-fg)] focus:text-[var(--color-fg-inverse)] focus:px-3 focus:py-1.5 focus:rounded-md focus:text-xs focus:font-medium"
      >
        Saltar al contenido
      </a>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar — desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-elevated)]",
          "transition-[width] duration-[var(--duration)] ease-[var(--ease-out)] flex-shrink-0",
          collapsed ? "w-16" : "w-60"
        )}
        aria-label="Navegación principal"
      >
        <div className="flex-1 min-h-0 flex flex-col">
          <Sidebar
            collapsed={collapsed}
            onCollapsedChange={toggleCollapsed}
          />
        </div>
        <SidebarFooter collapsed={collapsed} />
        <button
          onClick={toggleCollapsed}
          className="h-8 border-t border-[var(--color-border)] flex items-center justify-center text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-subtle)] transition-colors"
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              collapsed ? "" : "rotate-180"
            )}
          />
        </button>
      </aside>

      {/* Sidebar — mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-bg-elevated)] border-r border-[var(--color-border)] transform transition-transform duration-[var(--duration)] ease-[var(--ease-out)] lg:hidden flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Navegación"
      >
        <Sidebar collapsed={false} onCollapsedChange={() => {}} onNavigate={() => setMobileOpen(false)} />
        <div className="mt-auto">
          <SidebarFooter collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 flex items-center gap-2 px-4 lg:px-6 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]/80 backdrop-blur-md">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -ml-2 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
            aria-label="Abrir menú"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1 text-xs text-[var(--color-fg-muted)] min-w-0">
            {breadcrumbs.map((crumb, idx) => {
              const last = idx === breadcrumbs.length - 1;
              return (
                <span key={crumb.href} className="flex items-center gap-1 min-w-0">
                  {idx > 0 && <ChevronRight className="h-3 w-3 flex-shrink-0 opacity-50" />}
                  {last ? (
                    <span className="text-[var(--color-fg)] font-medium truncate">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-[var(--color-fg)] transition-colors truncate">
                      {crumb.label}
                    </Link>
                  )}
                </span>
              );
            })}
          </nav>

          <div className="flex-1" />

          {/* Search trigger */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden md:flex items-center gap-2 h-8 px-2.5 text-xs text-[var(--color-fg-muted)] bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-[var(--radius-sm)] transition-colors"
            aria-label="Buscar"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Buscar</span>
            <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded">
              ⌘K
            </kbd>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-subtle)] transition-colors"
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications placeholder */}
          <button
            className="p-2 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-subtle)] transition-colors relative"
            aria-label="Notificaciones"
          >
            <Bell className="h-4 w-4" />
          </button>
        </header>

        {/* Main content */}
        <main id="main-content" className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Command palette */}
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
