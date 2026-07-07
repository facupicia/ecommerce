"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Calculator,
  ShoppingCart,
  Eye,
  Settings,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";

type NavItem = {
  href?: string;
  label: string;
  icon: LucideIcon;
  children?: NavItem[];
  section?: string;
};

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, section: "general" },
  { href: "/admin/productos", label: "Productos", icon: Package, section: "catálogo" },
  {
    label: "Calculadora",
    icon: Calculator,
    section: "módulos",
    children: [
      { href: "/admin/modulos/calculadora", label: "Calculadora", icon: Calculator },
      { href: "/admin/modulos/calculadora/cotizaciones", label: "Cotizaciones", icon: Calculator },
    ],
  },
  { href: "/admin/ordenes", label: "Órdenes", icon: ShoppingCart, section: "ventas" },
  { href: "/admin/visitas", label: "Visitas", icon: Eye, section: "tráfico" },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings, section: "ajustes" },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onNavigate?: () => void;
}

function isPathActive(pathname: string, href?: string) {
  if (!href) return false;
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

function isGroupActive(pathname: string, item: NavItem) {
  if (item.href && isPathActive(pathname, item.href)) return true;
  if (item.children) return item.children.some((c) => isPathActive(pathname, c.href));
  return false;
}

export function Sidebar({ collapsed, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [modulosOpen, setModulosOpen] = useState(true);

  useEffect(() => {
    // Auto-open Módulos si alguna subruta está activa
    if (pathname.startsWith("/admin/modulos")) setModulosOpen(true);
  }, [pathname]);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-[var(--color-border)]">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-2.5 min-w-0"
          aria-label="Dashboard"
        >
          <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-fg)] flex items-center justify-center flex-shrink-0">
            <span className="text-[var(--color-fg-inverse)] text-[11px] font-bold tracking-tight">
              pl
            </span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold text-sm tracking-tight truncate">plug</p>
              <p className="text-[10px] uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                Admin
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto" aria-label="Principal">
        {navItems.map((item) => {
          if (item.children) {
            const active = isGroupActive(pathname, item);
            return (
              <div key={item.label}>
                <button
                  onClick={() => setModulosOpen((v) => !v)}
                  aria-expanded={modulosOpen}
                  className={cn(
                    "w-full group flex items-center gap-2.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-sm transition-colors",
                    active
                      ? "bg-[var(--color-bg-subtle)] text-[var(--color-fg)]"
                      : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-subtle)]"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.6} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-[13px]">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform",
                          modulosOpen ? "rotate-0" : "-rotate-90"
                        )}
                      />
                    </>
                  )}
                </button>
                {!collapsed && modulosOpen && (
                  <div className="ml-3.5 mt-0.5 space-y-0.5 border-l border-[var(--color-border)] pl-2">
                    {item.children.map((child) => {
                      const childActive = isPathActive(pathname, child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href!}
                          onClick={onNavigate}
                          className={cn(
                            "block px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[12px] transition-colors",
                            childActive
                              ? "bg-[var(--color-bg-subtle)] text-[var(--color-fg)] font-medium"
                              : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-subtle)]"
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          const active = isPathActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href!}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-2.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-sm transition-colors",
                "relative",
                active
                  ? "bg-[var(--color-bg-subtle)] text-[var(--color-fg)] font-medium before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-[var(--color-accent)] before:rounded-full"
                  : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-subtle)]"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.6} />
              {!collapsed && <span className="text-[13px]">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export type { NavItem };
