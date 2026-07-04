import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada | plug",
};

export default function NotFound() {
  return (
    <div className="shop-layout flex flex-col min-h-screen bg-white">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--plug-gray)] mb-6">
            404
          </p>
          <h1 className="plug-font-serif text-4xl sm:text-5xl text-[#1a1a1a] mb-4">
            Página no encontrada
          </h1>
          <p className="text-[14px] text-[var(--plug-gray)] leading-relaxed mb-8">
            Lo que buscás no existe o fue movido. Volvé al inicio y seguí explorando.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="plug-btn">
              Ir al inicio
            </Link>
            <Link href="/categorias" className="plug-btn">
              Ver catálogo
            </Link>
          </div>
        </div>
      </main>
      <footer className="text-center py-6 text-[11px] text-[var(--plug-gray)] border-t border-[#d9d9d9]">
        plug — Rosario, Argentina
      </footer>
    </div>
  );
}
