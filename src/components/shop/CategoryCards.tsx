import Link from "next/link";
import type { CategoryCard } from "@/lib/settings";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";

interface CategoryCardsProps {
  cards: CategoryCard[];
}

export function CategoryCards({ cards }: CategoryCardsProps) {
  if (!cards || cards.length === 0) return null;

  return (
    <section className="py-12 lg:py-20 bg-white font-sans">
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
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-neutral-200" />
              )}

              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 transition-opacity duration-300 group-hover:opacity-90" />

              <div className="absolute inset-0 flex items-center justify-center p-3">
                <h3 className="text-white text-[15px] sm:text-lg lg:text-xl font-semibold tracking-[0.18em] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] text-center">
                  {card.nombre}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
