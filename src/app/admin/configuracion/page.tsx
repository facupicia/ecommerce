"use client";

import { useState, useEffect } from "react";
import { Settings, Save, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { ShopSettings } from "@/lib/settings";

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
          setSettings(data.settings);
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
