"use client";

import { useState } from "react";
import Link from "next/link";
import { CartIcon } from "@/components/CartIcon";

const mainLinks = [
  { href: "/", label: "Inicio" },
  { href: "/categorias", label: "Catálogo" },
];

const indumentariaLinks = [
  { href: "/categorias?indumentaria=Remera", label: "Remeras" },
  { href: "/categorias?indumentaria=Buzo", label: "Buzos" },
  { href: "/categorias?indumentaria=Campera", label: "Camperas" },
  { href: "/categorias?indumentaria=Pantalón", label: "Pantalones" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileAccordionOpen, setMobileAccordionOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 plug-header-glass">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-[60px]">
          {/* Left — desktop nav / mobile menu */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 -ml-2 text-[#1a1a1a]  transition-colors "
              aria-label="Abrir menú"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <nav className="hidden lg:flex items-center gap-6">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="plug-nav-link text-[11px] font-bold uppercase tracking-[0.25em] text-[#1a1a1a] hover:text-[var(--plug-gray)] transition-colors pb-1"
                >
                  {link.label}
                </Link>
              ))}

              {/* Dropdown de Indumentaria */}
              <div className="relative group">
                <button
                  className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#1a1a1a] hover:text-[var(--plug-gray)] transition-colors pb-1 cursor-pointer"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span>Indumentaria</span>
                  <svg
                    className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180 text-[#1a1a1a]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <div
                  role="menu"
                  className="absolute left-0 mt-1 w-44 rounded-md overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 z-50 backdrop-blur-md bg-white/90 border border-black/5 shadow-lg"
                >
                  <div className="py-1">
                    {indumentariaLinks.map((subLink) => (
                      <Link
                        key={subLink.href}
                        href={subLink.href}
                        role="menuitem"
                        className="block px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1a1a1a] hover:bg-black/5 hover:text-black transition-colors"
                      >
                        {subLink.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* Center — logo */}
          <Link
            href="/"
            className="inline-block px-2.5 py-1 bg-black text-white text-[13px] sm:text-[14px] font-black uppercase tracking-[0.2em] shadow-sm"
            aria-label="THEPLUG — Inicio"
          >
            THEPLUG🔌
          </Link>

          {/* Right — icons */}
          <div className="flex items-center justify-end gap-1">
            <CartIcon />
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[300px] max-w-[80vw] bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between h-[60px] px-4 border-b border-[#d9d9d9]">
              <span className="inline-block px-2.5 py-1 bg-black text-white text-xs font-black uppercase tracking-[0.2em] shadow-sm">
                THEPLUG
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 -mr-2 text-[#1a1a1a]"
                aria-label="Cerrar menú"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <nav className="flex-1 p-6 space-y-4">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm font-semibold uppercase tracking-[0.2em] text-[#1a1a1a] hover:text-[var(--plug-gray)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {/* Accordion de Indumentaria */}
              <div className="space-y-2">
                <button
                  onClick={() => setMobileAccordionOpen(!mobileAccordionOpen)}
                  className="flex items-center justify-between w-full text-sm font-semibold uppercase tracking-[0.2em] text-[#1a1a1a] hover:text-[var(--plug-gray)] transition-colors cursor-pointer focus:outline-none"
                >
                  <span>Indumentaria</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${
                      mobileAccordionOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                
                <div
                  className={`grid transition-all duration-300 ease-in-out pl-4 border-l border-black/5 ${
                    mobileAccordionOpen
                      ? "grid-rows-[1fr] opacity-100 mt-2 py-1"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden space-y-3 min-h-0">
                  {indumentariaLinks.map((subLink) => (
                    <Link
                      key={subLink.href}
                      href={subLink.href}
                      onClick={() => setMenuOpen(false)}
                      className="block text-[12px] font-medium uppercase tracking-[0.15em] text-[#595959] hover:text-[#1a1a1a] transition-colors"
                    >
                      {subLink.label}
                    </Link>
                  ))}
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
