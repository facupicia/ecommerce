"use client";

import { useState } from "react";
import { Send, CheckCircle2, MessageCircle } from "lucide-react";

interface ComingSoonProps {
  title?: string;
  message?: string;
}

export function ComingSoon({
  title = "Falta poco para abrir",
  message = "Estamos preparando la mejor experiencia para ti. Suscríbete para recibir novedades o vuelve pronto.",
}: ComingSoonProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate API call for newsletter subscription
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail("");
    }, 1200);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden font-sans">
      {/* Background animated/blurry blobs for visual depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-zinc-800/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-900/40 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none" />
      
      {/* Top subtle light overlay */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />

      {/* Main glass container */}
      <div className="relative z-10 max-w-xl w-full mx-4 px-6 py-12 sm:p-12 md:p-16 bg-neutral-950/50 backdrop-blur-xl border border-neutral-900 rounded-3xl shadow-[0_0_50px_-12px_rgba(255,255,255,0.03)] text-center transition-all duration-300 hover:border-neutral-800/80">
        
        {/* Pulsing opening soon badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/80 border border-neutral-800/80 text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-8 animate-fade-in shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Próximamente
        </div>

        {/* Brand Name with gradient text */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-[0.25em] text-white uppercase mb-4 selection:bg-neutral-800">
          plug
        </h1>
        <div className="w-12 h-[2px] bg-neutral-800 mx-auto mb-8" />

        {/* Dynamic Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-wide mb-4">
          {title}
        </h2>

        {/* Dynamic Description */}
        <p className="text-[14px] text-neutral-400 leading-relaxed max-w-md mx-auto mb-10">
          {message}
        </p>

        {/* Subscription / Waiting list form */}
        <div className="max-w-md mx-auto mb-12">
          {subscribed ? (
            <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/50 text-neutral-200 animate-scale-in">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-bounce" />
              <p className="text-[13px] font-medium tracking-wide">¡Te has registrado con éxito!</p>
              <p className="text-[11px] text-neutral-400">Te avisaremos tan pronto como abramos las puertas.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-white placeholder:text-neutral-500 text-[13px] focus:outline-none focus:border-neutral-600 focus:bg-neutral-900 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-[12px] uppercase tracking-wider hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Notificarme <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Separator line */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-neutral-900"></div>
          <span className="flex-shrink mx-4 text-[10px] text-neutral-600 uppercase tracking-widest">Contacto</span>
          <div className="flex-grow border-t border-neutral-900"></div>
        </div>

        {/* Contact links */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <a
            href="https://www.instagram.com/theplug.ros/?hl=es-la"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[12px] font-medium text-neutral-400 hover:text-white transition-colors group"
          >
            <span className="p-2 rounded-xl bg-neutral-900 border border-neutral-800/50 group-hover:border-neutral-700 transition-all group-hover:scale-110">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </span>
            Instagram
          </a>
          <a
            href="https://wa.me/543464698460"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[12px] font-medium text-neutral-400 hover:text-white transition-colors group"
          >
            <span className="p-2 rounded-xl bg-neutral-900 border border-neutral-800/50 group-hover:border-neutral-700 transition-all group-hover:scale-110">
              <MessageCircle className="w-4 h-4 text-emerald-500" />
            </span>
            WhatsApp
          </a>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="absolute bottom-6 inset-x-0 text-center">
        <p className="text-[10px] text-neutral-600 tracking-wider">
          © {new Date().getFullYear()} plug. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
