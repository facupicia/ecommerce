import Link from "next/link";

const footerLinks = {
  navegacion: [
    { href: "/", label: "Inicio" },
    { href: "/categorias", label: "Categorías" },
    { href: "/carrito", label: "Carrito" },
  ],
  atencion: [
    { label: "WhatsApp: +54 9 261 123-4567", href: "https://wa.me/5492611234567" },
    { label: "Email: hola@tienda.com", href: "mailto:hola@tienda.com" },
  ],
  redes: [
    { label: "Instagram", href: "#" },
    { label: "Facebook", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="kith-bg-footer border-t border-[#d9d9d9]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-block px-2 py-1 bg-[#333333] text-white text-lg font-bold uppercase tracking-[0.15em]"
            >
              TIENDA
            </Link>
            <p className="mt-4 text-[13px] leading-relaxed text-[#828282] max-w-xs">
              Productos importados seleccionados. Calidad garantizada y envío a
              todo el país.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#333333] mb-4">
              Navegación
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.navegacion.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-[#828282] hover:text-[#333333] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#333333] mb-4">
              Contacto
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.atencion.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[13px] text-[#828282] hover:text-[#333333] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="text-[13px] text-[#828282]">Mendoza, Argentina</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#333333] mb-4">
              Seguinos
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.redes.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[13px] text-[#828282] hover:text-[#333333] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[#d9d9d9]">
          <p className="text-[11px] text-[#828282] text-center tracking-wide">
            © {new Date().getFullYear()} TIENDA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
