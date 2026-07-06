"use client";

import { useState, useEffect } from "react";
import { Settings, Save, AlertTriangle, Loader2, CheckCircle2, Plus, Trash2, GripVertical, Image as ImageIcon } from "lucide-react";
import { ShopSettings, CategoryCard } from "@/lib/settings";
import { ImageUploader } from "@/components/ui/ImageUploader";

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
      setTimeout(() => setMessage(null), 4000);
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Error al intentar guardar" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-2 text-sm text-muted-foreground">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-muted-foreground" />
          Configuración General
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Administra el bloqueo general de la tienda y la pantalla "Falta poco para abrir"
        </p>
      </div>

      {/* Alert if blocked */}
      {settings.isBlocked && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Tienda Bloqueada al Público</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Los clientes que intenten ingresar a la tienda serán redirigidos a la pantalla de "Falta poco". El panel de administración sigue siendo plenamente accesible.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 space-y-6">
          {/* Toggle Switch */}
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">
                Bloqueo General de Tienda
              </label>
              <p className="text-xs text-muted-foreground">
                Activa la pantalla "Falta poco para abrir" y oculta temporalmente el catálogo a los clientes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, isBlocked: !settings.isBlocked })}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.isBlocked ? "bg-amber-500" : "bg-neutral-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.isBlocked ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Section details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Personalización de Pantalla "Falta Poco"
            </h3>
            
            {/* Title Input */}
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-xs font-medium text-muted-foreground">
                Título de la pantalla
              </label>
              <input
                id="title"
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                placeholder="Falta poco para abrir"
                className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors"
                required
              />
            </div>

            {/* Description textarea */}
            <div className="space-y-1.5">
              <label htmlFor="message" className="text-xs font-medium text-muted-foreground">
                Mensaje descriptivo
              </label>
              <textarea
                id="message"
                value={settings.comingSoonMessage}
                onChange={(e) => setSettings({ ...settings, comingSoonMessage: e.target.value })}
                placeholder="Estamos preparando la mejor experiencia para ti..."
                rows={4}
                className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors resize-none"
                required
              />
            </div>
          </div>

          {/* Announcement Bar */}
          <div className="pt-4 border-t border-border space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Barra de Anuncio Superior
            </h3>
            <p className="text-xs text-muted-foreground">
              Un banner animado con texto deslizante que aparece en la parte superior de la tienda.
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Activar banner
              </label>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, announcementEnabled: !settings.announcementEnabled })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  settings.announcementEnabled ? "bg-emerald-500" : "bg-neutral-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                    settings.announcementEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Announcement text */}
            <div className="space-y-1.5">
              <label htmlFor="announcement" className="text-xs font-medium text-muted-foreground">
                Texto del banner
              </label>
              <input
                id="announcement"
                type="text"
                value={settings.announcement || ""}
                onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                placeholder='Ej: "Envío gratis en compras +$50.000" o "Nueva colección ya disponible"'
                className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors"
              />
            </div>

            {/* Announcement link */}
            <div className="space-y-1.5">
              <label htmlFor="announcementLink" className="text-xs font-medium text-muted-foreground">
                Link del banner (opcional)
              </label>
              <input
                id="announcementLink"
                type="text"
                value={settings.announcementLink || ""}
                onChange={(e) => setSettings({ ...settings, announcementLink: e.target.value || null })}
                placeholder='Ej: "/categorias" o "/producto/oferta-especial"'
                className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors"
              />
            </div>
          </div>

          {/* Datos de Transferencia */}
          <div className="pt-4 border-t border-border space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Datos para Transferencia Bancaria
            </h3>
            <p className="text-xs text-muted-foreground">
              Estos datos se muestran en el checkout cuando el cliente elige pagar por transferencia.
            </p>

            <div className="space-y-1.5">
              <label htmlFor="transferenciaAlias" className="text-xs font-medium text-muted-foreground">
                Alias
              </label>
              <input
                id="transferenciaAlias"
                type="text"
                value={settings.transferenciaAlias || ""}
                onChange={(e) => setSettings({ ...settings, transferenciaAlias: e.target.value })}
                placeholder='Ej: "plug.rosario"'
                className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="transferenciaCBU" className="text-xs font-medium text-muted-foreground">
                CBU / CVU
              </label>
              <input
                id="transferenciaCBU"
                type="text"
                value={settings.transferenciaCBU || ""}
                onChange={(e) => setSettings({ ...settings, transferenciaCBU: e.target.value })}
                placeholder='Ej: "0000003100000000000000"'
                className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="transferenciaTitular" className="text-xs font-medium text-muted-foreground">
                Titular de la cuenta
              </label>
              <input
                id="transferenciaTitular"
                type="text"
                value={settings.transferenciaTitular || ""}
                onChange={(e) => setSettings({ ...settings, transferenciaTitular: e.target.value })}
                placeholder='Ej: "Facundo Picia"'
                className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors"
              />
            </div>
          </div>

          {/* Cards de Categorías Destacadas */}
          <div className="pt-4 border-t border-border space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Cards de Categorías Destacadas
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Sección que se muestra en la home arriba de "Elige tu look". Agregá, quitá o reordená cards según necesites.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newCard: CategoryCard = {
                    id: genId(),
                    nombre: "",
                    imagen: "",
                    href: "",
                  };
                  setSettings({ ...settings, categoryCards: [...settings.categoryCards, newCard] });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition-colors flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar card
              </button>
            </div>

            {!settings.categoryCards || settings.categoryCards.length === 0 ? (
              <div className="border border-dashed border-border rounded-lg p-6 text-center text-xs text-muted-foreground">
                Todavía no agregaste ninguna card. Hacé clic en "Agregar card" para empezar.
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
          <div className="pt-4 border-t border-border space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Banners de la Home
            </h3>
            <p className="text-xs text-muted-foreground">
              Imágenes que aparecen en la página principal. Usá imágenes de Cloudinary (formato: carpeta/nombre).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-3 h-3" />
                  Hero (principal)
                </label>
                <input
                  type="text"
                  value={settings.heroBannerImage || ""}
                  onChange={(e) => setSettings({ ...settings, heroBannerImage: e.target.value })}
                  placeholder='ecommerce/banners/hero-1'
                  className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-3 h-3" />
                  Banner editorial
                </label>
                <input
                  type="text"
                  value={settings.editorialBannerImage || ""}
                  onChange={(e) => setSettings({ ...settings, editorialBannerImage: e.target.value })}
                  placeholder='ecommerce/banners/editorial-1'
                  className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-3 h-3" />
                  Banner final
                </label>
                <input
                  type="text"
                  value={settings.finalBannerImage || ""}
                  onChange={(e) => setSettings({ ...settings, finalBannerImage: e.target.value })}
                  placeholder='ecommerce/banners/final-1'
                  className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-secondary/30 border-t border-border flex items-center justify-between">
          <div>
            {message && (
              <div
                className={`flex items-center gap-2 text-xs font-medium ${
                  message.type === "success" ? "text-emerald-400" : "text-destructive"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                {message.text}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium text-xs rounded-lg hover:bg-primary/95 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Guardar cambios
          </button>
        </div>
      </form>
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
    <div className="border border-border rounded-lg p-4 bg-secondary/20 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <GripVertical className="w-3.5 h-3.5" />
          <span className="font-medium text-foreground">Card #{index + 1}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="px-2 py-1 text-[10px] font-medium bg-secondary border border-border rounded hover:bg-secondary/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Mover arriba"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="px-2 py-1 text-[10px] font-medium bg-secondary border border-border rounded hover:bg-secondary/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Mover abajo"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
            aria-label="Eliminar card"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">
            Nombre (mayúsculas en la card)
          </label>
          <input
            type="text"
            value={card.nombre}
            onChange={(e) => {
              const nombre = e.target.value;
              const autoHref = card.href && card.href.startsWith("/categorias?cat=")
                ? `/categorias?cat=${slugify(nombre)}`
                : card.href;
              onChange({ ...card, nombre, href: autoHref });
            }}
            placeholder='Ej: "Tejidos"'
            className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">
            Link de destino
          </label>
          <input
            type="text"
            value={card.href}
            onChange={(e) => onChange({ ...card, href: e.target.value })}
            placeholder='Ej: "/categorias?cat=tejidos"'
            className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
          <ImageIcon className="w-3 h-3" />
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
