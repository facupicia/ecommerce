"use client";

import { useState } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/shop/SearchBar";
import { MiniCart } from "@/components/shop/MiniCart";
import { CartBadge } from "@/components/CartBadge";
import { useWishlist } from "@/lib/wishlist";

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
  const [cartOpen, setCartOpen] = useState(false);
  const { itemCount: wishlistCount } = useWishlist();

  return (
    <>
      <header className="sticky top-0 z-50 plug-header-glass">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-[60px]">
            {/* Left — desktop nav / mobile menu */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setMenuOpen(true)}
                className="p-2 -ml-2 text-[#1a1a1a] transition-colors"
                aria-label="Abrir menú"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
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
              aria-label="plug — Inicio"
            >
              plug🔌
            </Link>

            {/* Right — search + icons */}
            <div className="flex items-center justify-end gap-1">
              {/* Desktop search */}
              <div className="hidden md:block w-40 lg:w-52 mr-2">
                <SearchBar />
              </div>

              {/* Wishlist */}
              <Link href="/favoritos" className="relative p-2" aria-label="Favoritos">
                <svg
                  className="w-6 h-6 text-[#1a1a1a] hover:text-[#595959] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#1a1a1a] text-white text-[10px] font-semibold leading-none rounded-full ring-2 ring-white">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 -mr-2"
                aria-label="Abrir carrito"
              >
                <svg
                  className="w-6 h-6 text-[#1a1a1a] hover:text-[#595959] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <CartBadge />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search (below header) */}
        <div className="md:hidden px-4 pb-3">
          <SearchBar />
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 w-[300px] max-w-[80vw] bg-white shadow-xl flex flex-col">
              <div className="flex items-center justify-between h-[60px] px-4 border-b border-[#d9d9d9]">
                <span className="inline-block px-2.5 py-1 bg-black text-white text-xs font-black uppercase tracking-[0.2em] shadow-sm">plug</span>
                <button onClick={() => setMenuOpen(false)} className="p-2 -mr-2 text-[#1a1a1a]" aria-label="Cerrar menú">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex-1 p-6 space-y-4">
                {mainLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block text-sm font-semibold uppercase tracking-[0.2em] text-[#1a1a1a] hover:text-[var(--plug-gray)] transition-colors">
                    {link.label}
                  </Link>
                ))}
                <div className="space-y-2">
                  <button onClick={() => setMobileAccordionOpen(!mobileAccordionOpen)} className="flex items-center justify-between w-full text-sm font-semibold uppercase tracking-[0.2em] text-[#1a1a1a] cursor-pointer">
                    <span>Indumentaria</span>
                    <svg className={`w-4 h-4 transition-transform duration-300 ${mobileAccordionOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 pl-4 border-l border-black/5 ${mobileAccordionOpen ? "max-h-48 opacity-100 mt-2 py-1" : "max-h-0 opacity-0"}`}>
                    <div className="space-y-3">
                      {indumentariaLinks.map((subLink) => (
                        <Link key={subLink.href} href={subLink.href} onClick={() => setMenuOpen(false)} className="block text-[12px] font-medium uppercase tracking-[0.15em] text-[#595959] hover:text-[#1a1a1a] transition-colors">
                          {subLink.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#ebebeb]">
                  <Link href="/favoritos" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#1a1a1a] hover:text-[var(--plug-gray)] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    Favoritos
                  </Link>
                </div>
              </nav>
            </div>
          </>
        )}
      </header>

      {/* Mini Cart Slide-over */}
      <MiniCart open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
