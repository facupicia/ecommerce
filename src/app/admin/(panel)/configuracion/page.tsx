"use client";

import { useState, useEffect } from "react";
import { Settings, Save, AlertTriangle, Loader2, CheckCircle2, Plus, Trash2, GripVertical, Image as ImageIcon, Power } from "lucide-react";
import { ShopSettings, CategoryCard } from "@/lib/settings";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { PageHeader } from "@/components/admin/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<ShopSettings>({
    isBlocked: false,
    title: "Falta poco para abrir",
    comingSoonMessage: "Estamos preparando la mejor experiencia para ti. Suscríbete para recibir novedades o vuelve pronto.",
    openingDate: null,
    announcement: "",
    announcementEnabled: false,
    announcementLink: null,
    transferenciaAlias: "",
    transferenciaCBU: "",
    transferenciaTitular: "",
    categoryCards: [],
    heroBannerImage: "ecommerce/banners/hero-1",
    editorialBannerImage: "ecommerce/banners/editorial-1",
    finalBannerImage: "ecommerce/banners/final-1",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
          const res = await fetch("/api/settings", { credentials: "same-origin" });
          const data = await res.json();
          if (res.ok && data.settings) {
            setSettings({
              ...{
                isBlocked: false,
                title: "Falta poco para abrir",
                comingSoonMessage: "Estamos preparando la mejor experiencia para ti. Suscríbete para recibir novedades o vuelve pronto.",
                openingDate: null,
                announcement: "",
                announcementEnabled: false,
                announcementLink: null,
                transferenciaAlias: "",
                transferenciaCBU: "",
                transferenciaTitular: "",
                categoryCards: [],
                heroBannerImage: "ecommerce/banners/hero-1",
                editorialBannerImage: "ecommerce/banners/editorial-1",
                finalBannerImage: "ecommerce/banners/final-1",
              },
              ...data.settings,
            });
          }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const [confirmBlock, setConfirmBlock] = useState(false);
  const [pendingBlockValue, setPendingBlockValue] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
        credentials: "same-origin",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");

      setMessage({ type: "success", text: "Configuración guardada exitosamente" });
      toast.success("Configuración guardada");
      setTimeout(() => setMessage(null), 4000);
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Error al intentar guardar" });
      toast.error("No se pudo guardar", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  function handleBlockToggle() {
    if (settings.isBlocked) {
      setPendingBlockValue(false);
      setConfirmBlock(true);
    } else {
      setPendingBlockValue(true);
      setConfirmBlock(true);
    }
  }

  function applyBlockChange() {
    setSettings({ ...settings, isBlocked: pendingBlockValue });
    setConfirmBlock(false);
    toast.success(pendingBlockValue ? "Tienda bloqueada" : "Tienda desbloqueada", {
      description: pendingBlockValue
        ? "Los clientes verán la pantalla de 'Falta poco'"
        : "Los clientes pueden navegar el catálogo",
    });
  }

  function isValidCBU(cbu: string): boolean {
    const cleaned = cbu.replace(/[\s-]/g, "");
    return /^\d{22}$/.test(cleaned);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
        <span className="ml-2 text-sm text-[var(--color-fg-muted)]">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Configuración general"
        description="Administrá el bloqueo de la tienda y la pantalla de 'Falta poco para abrir'."
      />

      {/* Alert if blocked */}
      {settings.isBlocked && (
        <div className="flex items-start gap-3 p-4 rounded-[var(--radius-lg)] bg-[var(--color-warning-soft)] border border-[var(--color-warning)]/20 text-[var(--color-warning)]">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" strokeWidth={1.6} />
          <div>
            <p className="text-sm font-semibold">Tienda bloqueada al público</p>
            <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">
              Los clientes que intenten ingresar serán redirigidos a la pantalla de "Falta poco". El panel de admin sigue accesible.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="p-6 space-y-6">
          {/* Toggle Switch */}
          <div className="flex items-center justify-between pb-6 border-b border-[var(--color-border)]">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[var(--color-fg)]">
                Bloqueo general de tienda
              </label>
              <p className="text-xs text-[var(--color-fg-muted)]">
                Activa la pantalla "Falta poco para abrir" y oculta temporalmente el catálogo a los clientes.
              </p>
            </div>
            <button
              type="button"
              onClick={handleBlockToggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 ${
                settings.isBlocked ? "bg-[var(--color-warning)]" : "bg-[var(--color-bg-muted)]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-out ${
                  settings.isBlocked ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Section details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[var(--color-fg)]">
              Personalización de pantalla "Falta poco"
            </h3>
            
            <Input
              id="title"
              label="Título de la pantalla"
              value={settings.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, title: e.target.value })}
              placeholder="Falta poco para abrir"
              required
            />
            <Textarea
              id="message"
              label="Mensaje descriptivo"
              value={settings.comingSoonMessage}
              onChange={(e) => setSettings({ ...settings, comingSoonMessage: e.target.value })}
              placeholder="Estamos preparando la mejor experiencia para ti..."
              rows={4}
              required
            />
          </div>

          {/* Announcement Bar */}
          <div className="pt-4 border-t border-[var(--color-border)] space-y-4">
            <h3 className="text-sm font-medium text-[var(--color-fg)]">
              Barra de anuncio superior
            </h3>
            <p className="text-xs text-[var(--color-fg-muted)]">
              Un banner animado con texto deslizante que aparece en la parte superior de la tienda.
            </p>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[var(--color-fg-muted)]">
                Activar banner
              </label>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, announcementEnabled: !settings.announcementEnabled })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 ${
                  settings.announcementEnabled ? "bg-[var(--color-accent)]" : "bg-[var(--color-bg-muted)]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                    settings.announcementEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <Input
              id="announcement"
              label="Texto del banner"
              value={settings.announcement || ""}
              onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
              placeholder='Ej: "Envío gratis en compras +$50.000"'
            />
            <Input
              id="announcementLink"
              label="Link del banner (opcional)"
              value={settings.announcementLink || ""}
              onChange={(e) => setSettings({ ...settings, announcementLink: e.target.value || null })}
              placeholder='/categorias o /producto/oferta-especial'
            />
          </div>

          {/* Datos de Transferencia */}
          <div className="pt-4 border-t border-[var(--color-border)] space-y-4">
            <h3 className="text-sm font-medium text-[var(--color-fg)]">
              Datos para transferencia bancaria
            </h3>
            <p className="text-xs text-[var(--color-fg-muted)]">
              Estos datos se muestran en el checkout cuando el cliente elige pagar por transferencia.
            </p>

            <Input
              id="transferenciaAlias"
              label="Alias"
              value={settings.transferenciaAlias || ""}
              onChange={(e) => setSettings({ ...settings, transferenciaAlias: e.target.value })}
              placeholder="plug.rosario"
            />
            <Input
              id="transferenciaCBU"
              label="CBU / CVU"
              value={settings.transferenciaCBU || ""}
              onChange={(e) => setSettings({ ...settings, transferenciaCBU: e.target.value })}
              placeholder="0000003100000000000000"
              error={
                settings.transferenciaCBU && !isValidCBU(settings.transferenciaCBU)
                  ? "El CBU debe tener 22 dígitos"
                  : undefined
              }
              className="font-mono"
            />
            <Input
              id="transferenciaTitular"
              label="Titular de la cuenta"
              value={settings.transferenciaTitular || ""}
              onChange={(e) => setSettings({ ...settings, transferenciaTitular: e.target.value })}
              placeholder="Facundo Picia"
            />
          </div>

          {/* Cards de Categorías Destacadas */}
          <div className="pt-4 border-t border-[var(--color-border)] space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium text-[var(--color-fg)]">
                  Cards de categorías destacadas
                </h3>
                <p className="text-xs text-[var(--color-fg-muted)] mt-1">
                  Sección que se muestra en la home arriba de "Elige tu look".
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => {
                  const newCard: CategoryCard = {
                    id: genId(),
                    nombre: "",
                    imagen: "",
                    href: "",
                  };
                  setSettings({ ...settings, categoryCards: [...settings.categoryCards, newCard] });
                }}
              >
                Agregar card
              </Button>
            </div>

            {!settings.categoryCards || settings.categoryCards.length === 0 ? (
              <div className="border border-dashed border-[var(--color-border)] rounded-[var(--radius)] p-6 text-center text-xs text-[var(--color-fg-muted)]">
                Todavía no agregaste ninguna card.
              </div>
            ) : (
              <div className="space-y-3">
                {(settings.categoryCards ?? []).map((card, index) => (
                  <CategoryCardEditor
                    key={card.id}
                    card={card}
                    index={index}
                    total={settings.categoryCards.length}
                    onChange={(updated) => {
                      const next = [...settings.categoryCards];
                      next[index] = updated;
                      setSettings({ ...settings, categoryCards: next });
                    }}
                    onRemove={() => {
                      setSettings({
                        ...settings,
                        categoryCards: settings.categoryCards.filter((_, i) => i !== index),
                      });
                    }}
                    onMove={(direction) => {
                      const next = [...settings.categoryCards];
                      const target = index + direction;
                      if (target < 0 || target >= next.length) return;
                      [next[index], next[target]] = [next[target], next[index]];
                      setSettings({ ...settings, categoryCards: next });
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Banners de la Home */}
          <div className="pt-4 border-t border-[var(--color-border)] space-y-4">
            <h3 className="text-sm font-medium text-[var(--color-fg)]">
              Banners de la home
            </h3>
            <p className="text-xs text-[var(--color-fg-muted)]">
              Imágenes que aparecen en la página principal.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { key: "heroBannerImage", label: "Hero (principal)", placeholder: "ecommerce/banners/hero-1" },
                { key: "editorialBannerImage", label: "Banner editorial", placeholder: "ecommerce/banners/editorial-1" },
                { key: "finalBannerImage", label: "Banner final", placeholder: "ecommerce/banners/final-1" },
              ].map((banner) => (
                <div key={banner.key} className="space-y-2">
                  <label className="text-[11px] font-medium text-[var(--color-fg-muted)] flex items-center gap-1.5">
                    <ImageIcon className="h-3 w-3" />
                    {banner.label}
                  </label>
                  <ImageUploader
                    images={settings[banner.key as keyof ShopSettings] ? [String(settings[banner.key as keyof ShopSettings])] : []}
                    onChange={(imgs) =>
                      setSettings({ ...settings, [banner.key]: imgs[0] ?? "" } as ShopSettings)
                    }
                    folder="ecommerce/banners"
                    maxFiles={1}
                  />
                  <Input
                    value={String(settings[banner.key as keyof ShopSettings] || "")}
                    onChange={(e) =>
                      setSettings({ ...settings, [banner.key]: e.target.value } as ShopSettings)
                    }
                    placeholder={banner.placeholder}
                    className="font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[var(--color-bg-subtle)] border-t border-[var(--color-border)] flex items-center justify-between">
          <div>
            {message && (
              <div
                className={`flex items-center gap-2 text-xs font-medium ${
                  message.type === "success" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                {message.text}
              </div>
            )}
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={saving}
            icon={!saving ? <Save className="h-3.5 w-3.5" /> : undefined}
          >
            Guardar cambios
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmBlock}
        onOpenChange={setConfirmBlock}
        title={pendingBlockValue ? "¿Bloquear la tienda?" : "¿Desbloquear la tienda?"}
        description={
          pendingBlockValue
            ? "Los clientes serán redirigidos a la pantalla de 'Falta poco'. El panel de admin seguirá accesible."
            : "Los clientes podrán navegar el catálogo y hacer compras normalmente."
        }
        confirmLabel={pendingBlockValue ? "Sí, bloquear" : "Sí, desbloquear"}
        onConfirm={applyBlockChange}
      />
    </div>
  );
}

interface CategoryCardEditorProps {
  card: CategoryCard;
  index: number;
  total: number;
  onChange: (card: CategoryCard) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}

function CategoryCardEditor({ card, index, total, onChange, onRemove, onMove }: CategoryCardEditorProps) {
  return (
    <div className="border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 bg-[var(--color-bg-subtle)] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[var(--color-fg-muted)]">
          <GripVertical className="h-3.5 w-3.5" />
          <span className="font-medium text-[var(--color-fg)]">Card #{index + 1}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label="Mover arriba"
            className="h-7 px-2"
          >
            ↑
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label="Mover abajo"
            className="h-7 px-2"
          >
            ↓
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label="Eliminar card"
            className="h-7 w-7 text-[var(--color-fg-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="Nombre"
          value={card.nombre}
          onChange={(e) => {
            const nombre = e.target.value;
            const autoHref = card.href && card.href.startsWith("/categorias?cat=")
              ? `/categorias?cat=${slugify(nombre)}`
              : card.href;
            onChange({ ...card, nombre, href: autoHref });
          }}
          placeholder="Tejidos"
        />
        <Input
          label="Link de destino"
          value={card.href}
          onChange={(e) => onChange({ ...card, href: e.target.value })}
          placeholder="/categorias?cat=tejidos"
        />
      </div>

      <div>
        <label className="text-[11px] font-medium text-[var(--color-fg-muted)] flex items-center gap-1.5 mb-1.5">
          <ImageIcon className="h-3 w-3" />
          Imagen de fondo (vertical, recomendado 3:4)
        </label>
        <ImageUploader
          images={card.imagen ? [card.imagen] : []}
          onChange={(imgs) => onChange({ ...card, imagen: imgs[0] ?? "" })}
          folder="ecommerce/category-cards"
          maxFiles={1}
        />
      </div>
    </div>
  );
}
