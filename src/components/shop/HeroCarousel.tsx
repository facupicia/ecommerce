"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";

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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const goTo = useCallback(
    (index: number) => {
      let nextIndex = index;
      if (nextIndex < 0) nextIndex = slides.length - 1;
      if (nextIndex >= slides.length) nextIndex = 0;
      setCurrent(nextIndex);
    },
    [slides.length]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1 >= slides.length ? 0 : c + 1));
    }, 8000);
  }, [slides.length]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const handleGoTo = (index: number) => {
    goTo(index);
    resetTimer();
  };

  const handleNext = () => {
    next();
    resetTimer();
  };

  const handlePrev = () => {
    prev();
    resetTimer();
  };

  if (!slides || slides.length === 0) return null;

  return (
    <section className="relative w-full h-[calc(100vh-60px)] overflow-hidden bg-[#0d0d0d]">
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === current;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                isActive
                  ? "opacity-100 z-10 pointer-events-auto"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Background image with slow zoom effect */}
              <CloudinaryImage
                src={slide.image}
                alt={slide.title || "Slide"}
                fill
                priority
                className={`absolute inset-0 object-cover transition-transform duration-[8000ms] ease-out ${
                  isActive ? "scale-105" : "scale-100"
                }`}
              />
              {/* Premium dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-20">
                <div
                  className={`max-w-2xl transition-all duration-1000 delay-300 transform ${
                    isActive ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                  }`}
                >
                  {slide.title && (
                    <h2 className="plug-font-serif text-4xl sm:text-5xl lg:text-6xl text-white mb-4 drop-shadow-md leading-tight">
                      {slide.title}
                    </h2>
                  )}
                  {slide.subtitle && (
                    <p className="text-[13px] sm:text-[15px] text-white/90 leading-relaxed mb-8 max-w-lg drop-shadow-sm font-light">
                      {slide.subtitle}
                    </p>
                  )}
                  <Link
                    href={slide.href}
                    className="inline-flex items-center justify-center min-w-[150px] px-6 py-3.5 border border-white bg-white text-black text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-300 shadow-md"
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/30 text-white/80 hover:bg-black/60 hover:text-white backdrop-blur-sm transition-all duration-200 border border-white/5"
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
            onClick={handleNext}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/30 text-white/80 hover:bg-black/60 hover:text-white backdrop-blur-sm transition-all duration-200 border border-white/5"
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

          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => handleGoTo(i)}
                className={`transition-all duration-300 ${
                  i === current
                    ? "bg-white w-6 h-1.5 rounded-full"
                    : "bg-white/40 w-1.5 h-1.5 rounded-full hover:bg-white/80"
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
