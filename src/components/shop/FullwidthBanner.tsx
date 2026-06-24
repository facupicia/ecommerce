import Link from "next/link";

interface FullwidthBannerProps {
  image: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  align?: "left" | "center";
}

export function FullwidthBanner({
  image,
  title,
  description,
  primaryCta,
  secondaryCta,
  align = "left",
}: FullwidthBannerProps) {
  return (
    <section className="relative w-full h-[80vh] min-h-[500px] max-h-[900px] overflow-hidden">
      {/* Background */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Content */}
      <div
        className={`absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-16 ${
          align === "center" ? "items-center text-center" : "items-start text-left"
        }`}
      >
        <div className="max-w-2xl">
          <h2 className="plug-font-serif text-3xl sm:text-5xl lg:text-6xl text-white mb-3 drop-shadow-sm">
            {title}
          </h2>
          <p className="text-[13px] sm:text-[15px] text-white/90 leading-relaxed mb-6 max-w-lg drop-shadow-sm">
            {description}
          </p>
          <div
            className={`flex flex-wrap gap-3 ${
              align === "center" ? "justify-center" : "justify-start"
            }`}
          >
            <Link
              href={primaryCta.href}
              className="inline-flex items-center justify-center min-w-[140px] px-6 py-3 bg-white text-[#1a1a1a] text-[11px] font-medium uppercase tracking-[0.15em] hover:bg-[#f5f5f5] transition-colors"
            >
              {primaryCta.label}
            </Link>
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="inline-flex items-center justify-center min-w-[140px] px-6 py-3 border border-white text-white text-[11px] font-medium uppercase tracking-[0.15em] hover:bg-white hover:text-[#1a1a1a] transition-all duration-200"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
