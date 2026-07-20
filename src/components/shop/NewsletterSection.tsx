"use client";

import { useState } from "react";
import { useToast } from "@/lib/toast";

/**
 * Sección de newsletter a todo el ancho (sobre el footer) —
 * patrón estándar de tiendas competitivas para captar clientes.
 */
export function NewsletterSection() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail("");
    toast("¡Gracias por suscribirte! Te avisaremos de los nuevos drops.", "success");
  };

  return (
    <section className="plug-newsletter-section">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-14 lg:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/50 mb-4">
            Newsletter
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white">
            No te pierdas ningún drop
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-white/60">
            Suscribite y enterate primero de los nuevos ingresos, restocks y ofertas exclusivas.
          </p>

          {submitted ? (
            <div className="mt-8 inline-flex items-center gap-2 text-[14px] font-medium text-white border border-white/25 rounded-full px-6 py-3">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              ¡Listo! Ya estás suscripto.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <label htmlFor="newsletter-section-email" className="sr-only">
                Tu email
              </label>
              <input
                id="newsletter-section-email"
                type="email"
                required
                autoComplete="email"
                placeholder="Tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="plug-newsletter-input flex-1 rounded-full"
              />
              <button type="submit" className="plug-newsletter-btn rounded-full flex-shrink-0">
                Suscribirme
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
