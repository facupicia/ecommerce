import Link from "next/link";
import type { CategoryCard } from "@/lib/settings";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";

interface CategoryCardsProps {
  cards: CategoryCard[];
}

export function CategoryCards({ cards }: CategoryCardsProps) {
  if (!cards || cards.length === 0) return null;

  return (
    <section className="py-12 lg:py-20 bg-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div
          className="grid gap-3 sm:gap-4 lg:gap-5"
          style={{
            gridTemplateColumns: `repeat(${Math.min(cards.length, 4)}, minmax(0, 1fr))`,
          }}
        >
          {cards.map((card) => (
            <Link
              key={card.id}
              href={card.href || "/categorias"}
              className="group relative block aspect-[3/4] overflow-hidden rounded-lg bg-neutral-100"
            >
              {card.imagen ? (
                <CloudinaryImage
                  src={card.imagen}
                  alt={card.nombre}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                  // MANTENIDO: El desenfoque general de fondo en hover
                  className="object-cover transition-all duration-700 ease-out group-hover:scale-105 group-hover:blur-[3px]"
                />
              ) : (
                <div className="absolute inset-0 bg-neutral-200" />
              )}

              {/* Capa de degradado oscuro constante */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-black/45 transition-opacity duration-500 group-hover:opacity-90" />

              {/* Contenedor del texto */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative z-10 inline-block">
                  <h3
                    // VOLVIÓ A: font-semibold o los tamaños que tenías para tu efecto original, adaptado en blanco
                    className="text-[16px] sm:text-xl lg:text-2xl font-bold font-expanded uppercase tracking-[0.22em] text-center leading-none"
                    style={{
                      color: "#ffffff",
                      textShadow:
                        "0 2px 4px rgba(0,0,0,0.7), 0 4px 14px rgba(0,0,0,0.5), 0 0 18px rgba(255,255,255,0.22)",
                    }}
                  >
                    {card.nombre}
                  </h3>

                  {/* MANTENIDO: Capa del efecto shine original */}

                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}