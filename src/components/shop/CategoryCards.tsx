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

              <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/0 to-black/45 transition-opacity duration-500 group-hover:opacity-80" />

              <div className="absolute inset-0 flex items-center justify-center p-3">
                <div className="relative">
                  <h3
                    className="relative text-white text-[16px] sm:text-xl lg:text-2xl font-semibold uppercase tracking-[0.22em] text-center leading-none"
                    style={{
                      textShadow:
                        "0 1px 2px rgba(0,0,0,0.6), 0 0 18px rgba(255,255,255,0.18)",
                    }}
                  >
                    <span
                      className="block bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white bg-[length:200%_100%] animate-shine"
                      style={{
                        WebkitBackgroundClip: "text",
                        backgroundImage:
                          "linear-gradient(110deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.55) 100%)",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {card.nombre}
                    </span>
                  </h3>
                  <span
                    aria-hidden
                    className="absolute left-1/2 -translate-x-1/2 -bottom-2 h-px w-0 bg-white/80 transition-all duration-500 ease-out group-hover:w-3/4"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
