"use client";

import Link from "next/link";
import { MercadoPagoBadge } from "@/components/shop/MercadoPagoBadge";

const footerLinks = {
  navegacion: [
    { href: "/", label: "Inicio" },
    { href: "/categorias", label: "Catálogo" },
    { href: "/favoritos", label: "Favoritos" },
    { href: "/carrito", label: "Carrito" },
  ],
  ayuda: [
    { href: "/faq", label: "Preguntas Frecuentes" },
    { href: "/envios", label: "Envíos y Devoluciones" },
  ],
};

export function Footer() {
  return (
    <footer className="plug-bg-footer border-t border-[#d9d9d9]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="inline-block text-[15px] font-black uppercase tracking-[0.15em] text-[#1a1a1a] hover:text-[var(--plug-gray)] transition-colors"
              aria-label="plug — Inicio"
            >
              plug
            </Link>
            <p className="mt-4 text-[13px] leading-relaxed text-[var(--plug-gray)] max-w-xs">
              Ropa importada. Style desde Rosario al país.
            </p>
            {/* Social icons */}
            <div className="mt-5 flex items-center gap-2">
              <a
                href="https://www.instagram.com/theplug.ros/?hl=es-la"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de plug"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#d9d9d9] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-colors"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3h-9A4.5 4.5 0 003 7.5v9A4.5 4.5 0 007.5 21h9a4.5 4.5 0 004.5-4.5v-9A4.5 4.5 0 0016.5 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75h.008v.008h-.008V6.75z" />
                </svg>
              </a>
              <a
                href="https://wa.me/543464698460"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp de plug"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#d9d9d9] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-colors"
              >
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a] mb-4">
              Navegación
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.navegacion.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-[var(--plug-gray)] hover:text-[#1a1a1a] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a] mb-4">
              Ayuda
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.ayuda.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-[var(--plug-gray)] hover:text-[#1a1a1a] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a] mb-4">
              Contacto
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://wa.me/543464698460"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-[var(--plug-gray)] hover:text-[#1a1a1a] transition-colors"
                >
                  WhatsApp: +54 9 3464 69-8460
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/theplug.ros/?hl=es-la"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-[var(--plug-gray)] hover:text-[#1a1a1a] transition-colors"
                >
                  Instagram: @theplug.ros
                </a>
              </li>
              <li className="text-[13px] text-[var(--plug-gray)]">Rosario, Santa Fe, Argentina</li>
            </ul>
          </div>
        </div>

        {/* Medios de pago y envíos */}
        <div className="mt-12 pt-8 border-t border-[#d9d9d9]">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a] mb-3">
                Medios de pago
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <MercadoPagoBadge />
                <span className="plug-mp-badge">
                  <svg className="plug-mp-badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                  <span className="plug-mp-badge-text">Tarjetas de crédito y débito</span>
                </span>
                <span className="plug-mp-badge">
                  <svg className="plug-mp-badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332M17.25 21h3.375c.621 0 1.125-.504 1.125-1.125V11.25M4.5 21V10.332M3 21v-8.25M21 21H3" />
                  </svg>
                  <span className="plug-mp-badge-text">
                    Transferencia bancaria <strong className="plug-mp-badge-name">sin recargo</strong>
                  </span>
                </span>
              </div>
            </div>
            <div className="lg:ml-auto">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a] mb-3">
                Envíos
              </h3>
              <p className="text-[13px] text-[var(--plug-gray)] flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                Envíos a todo el país desde Rosario
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-8 border-t border-[#d9d9d9]">
          <p className="text-[11px] text-[var(--plug-gray)] text-center tracking-wide">
            © {new Date().getFullYear()} plug. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
