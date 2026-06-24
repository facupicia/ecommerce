"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface Slide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
}

interface HeroCarouselProps {
  slides: Slide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const goTo = useCallback(
    (index: number) => {
      let next = index;
      if (next < 0) next = slides.length - 1;
      if (next >= slides.length) next = 0;
      setCurrent(next);
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        containerRef.current.scrollTo({
          left: width * next,
          behavior: "smooth",
        });
      }
    },
    [slides.length]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => {
        const next = c + 1 >= slides.length ? 0 : c + 1;
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth;
          containerRef.current.scrollTo({
            left: width * next,
            behavior: "smooth",
          });
        }
        return next;
      });
    }, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const width = containerRef.current.offsetWidth;
    const index = Math.round(containerRef.current.scrollLeft / width);
    setCurrent(index);
  };

  return (
    <section className="relative w-full h-[calc(100vh-60px)] overflow-hidden bg-[#1a1a1a]">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="relative flex-shrink-0 w-full h-full snap-start"
          >
            {/* Background image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-16">
              <div className="max-w-2xl">
                <h2 className="plug-font-serif text-3xl sm:text-5xl lg:text-6xl text-white mb-3 drop-shadow-sm">
                  {slide.title}
                </h2>
                <p className="text-[13px] sm:text-[15px] text-white/90 leading-relaxed mb-6 max-w-lg drop-shadow-sm">
                  {slide.subtitle}
                </p>
                <Link
                  href={slide.href}
                  className="inline-flex items-center justify-center min-w-[140px] px-6 py-3 border border-white text-white text-[11px] font-medium uppercase tracking-[0.15em] hover:bg-white hover:text-[#1a1a1a] transition-all duration-200"
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Anterior"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Siguiente"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i === current ? "bg-white w-4" : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Ir a slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
