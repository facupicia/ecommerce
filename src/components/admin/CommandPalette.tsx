"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Calculator,
  ShoppingCart,
  Eye,
  Settings,
  Plus,
  FileText,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Item = {
  id: string;
  label: string;
  group: string;
  icon: LucideIcon;
  shortcut?: string;
  action: () => void;
};

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const items: Item[] = [
    { id: "dash", label: "Dashboard", group: "Navegación", icon: LayoutDashboard, action: () => router.push("/admin") },
    { id: "prod", label: "Productos", group: "Navegación", icon: Package, action: () => router.push("/admin/productos") },
    { id: "new-prod", label: "Nuevo producto", group: "Navegación", icon: Plus, action: () => router.push("/admin/productos/nuevo") },
    { id: "ord", label: "Órdenes", group: "Navegación", icon: ShoppingCart, action: () => router.push("/admin/ordenes") },
    { id: "vis", label: "Visitas", group: "Navegación", icon: Eye, action: () => router.push("/admin/visitas") },
    { id: "calc", label: "Calculadora", group: "Módulos", icon: Calculator, action: () => router.push("/admin/modulos/calculadora") },
    { id: "cots", label: "Cotizaciones guardadas", group: "Módulos", icon: FileText, action: () => router.push("/admin/modulos/calculadora/cotizaciones") },
    { id: "import", label: "Importar desde warehouse", group: "Módulos", icon: Upload, action: () => router.push("/admin/productos") },
    { id: "cfg", label: "Configuración", group: "Ajustes", icon: Settings, action: () => router.push("/admin/configuracion") },
  ];

  function runItem(item: Item) {
    item.action();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" hideClose className="overflow-hidden p-0">
        <Command
          label="Búsqueda global"
          className="w-full"
          shouldFilter
        >
          <div className="flex items-center border-b border-[var(--color-border)] px-3">
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Buscar páginas, acciones..."
              className="flex-1 bg-transparent py-3.5 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] focus:outline-none"
            />
            <kbd className="text-[10px] font-mono text-[var(--color-fg-subtle)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded px-1.5 py-0.5">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-12 text-center text-xs text-[var(--color-fg-muted)]">
              Sin resultados para "{search}"
            </Command.Empty>
            {Object.entries(
              items.reduce<Record<string, Item[]>>((acc, item) => {
                (acc[item.group] = acc[item.group] || []).push(item);
                return acc;
              }, {})
            ).map(([group, groupItems]) => (
              <Command.Group
                key={group}
                heading={group}
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[var(--tracking-widest)] [&_[cmdk-group-heading]]:text-[var(--color-fg-subtle)]"
              >
                {groupItems.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={item.label}
                    onSelect={() => runItem(item)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-sm cursor-pointer aria-selected:bg-[var(--color-bg-subtle)] aria-selected:text-[var(--color-fg)] text-[var(--color-fg-muted)]"
                  >
                    <item.icon className="h-3.5 w-3.5" strokeWidth={1.6} />
                    <span>{item.label}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>

          <div className="border-t border-[var(--color-border)] px-3 py-2 flex items-center gap-3 text-[10px] text-[var(--color-fg-subtle)]">
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded px-1 py-0.5">↑↓</kbd>
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded px-1 py-0.5">↵</kbd>
              seleccionar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded px-1 py-0.5">esc</kbd>
              cerrar
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
