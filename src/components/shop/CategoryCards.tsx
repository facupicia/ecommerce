import Link from "next/link";
import type { CategoryCard } from "@/lib/settings";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";

interface CategoryCardsProps {
  cards: CategoryCard[];
  eyebrow?: string;
  title?: string;
}

const colsClass: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

export function CategoryCards({
  cards,
  eyebrow = "Navegá por categoría",
  title = "Encontrá tu estilo",
}: CategoryCardsProps) {
  if (!cards || cards.length === 0) return null;

  const lgCols = colsClass[Math.min(cards.length, 4)] ?? "lg:grid-cols-4";

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        {/* Encabezado */}
        <div className="text-center mb-10 lg:mb-12">
          <p className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.22em] text-[#86868b] mb-3">
            {eyebrow}
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
            {title}
          </h2>
        </div>

        {/* Grilla: 2 columnas en mobile, N en desktop */}
        <div className={`grid grid-cols-2 ${lgCols} gap-3 sm:gap-4 lg:gap-5`}>
          {cards.map((card) => (
            <Link
              key={card.id}
              href={card.href || "/categorias"}
              className="group relative block aspect-[3/4] overflow-hidden rounded-[20px] bg-[#f5f5f7]"
            >
              {card.imagen ? (
                <CloudinaryImage
                  src={card.imagen}
                  alt={card.nombre}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 transform-gpu"
                />
              ) : (
                <div className="absolute inset-0 bg-neutral-200" />
              )}

              {/* Degradado para legibilidad */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5 transition-opacity duration-500 group-hover:from-black/80" />

              {/* Texto + CTA */}
              <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6 flex flex-col items-start gap-2.5">
                <h3 className="text-[16px] sm:text-xl lg:text-2xl font-bold uppercase tracking-[0.18em] text-white leading-none drop-shadow-md">
                  {card.nombre}
                </h3>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/90 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 ease-out">
                  Ver más
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
