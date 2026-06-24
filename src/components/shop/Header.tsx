"use client";

import { useState } from "react";
import Link from "next/link";
import { CartIcon } from "@/components/CartIcon";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/categorias", label: "Categorías" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#d9d9d9]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-[60px]">
          {/* Left — desktop nav / mobile menu */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 -ml-2 text-[#1a1a1a] hover:text-[var(--plug-gray)] transition-colors lg:hidden"
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
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#1a1a1a] hover:text-[var(--plug-gray)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center — logo */}
          <Link
            href="/"
            className="inline-block px-1.5 py-0.5  text-white text-[14px] sm:text-[16px] font-bold uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors"
          >
            THEPLUG
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
              <span className="inline-block px-1.5 py-0.5 bg-[#1a1a1a] text-white text-sm font-bold uppercase tracking-[0.15em]">
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
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm font-medium uppercase tracking-[0.2em] text-[#1a1a1a] hover:text-[var(--plug-gray)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
