interface MercadoPagoBadgeProps {
  variant?: "light" | "dark";
  className?: string;
}

export function MercadoPagoBadge({
  variant = "light",
  className = "",
}: MercadoPagoBadgeProps) {
  const isDark = variant === "dark";
  return (
    <div
      className={`plug-mp-badge ${isDark ? "plug-mp-badge-dark" : ""} ${className}`}
      role="note"
      aria-label="Los pagos se procesan a través de Mercado Pago"
    >
      <svg
        className="plug-mp-badge-icon"
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M16 3C8.82 3 3 8.82 3 16s5.82 13 13 13 13-5.82 13-13S23.18 3 16 3zm0 2.5c5.8 0 10.5 4.7 10.5 10.5S21.8 26.5 16 26.5 5.5 21.8 5.5 16 10.2 5.5 16 5.5zm-1.1 4.4c-1.6 0-2.7.4-3.5 1.1-.7.7-1.1 1.7-1.1 2.9 0 1.3.4 2.3 1.2 3 .8.7 2 1.2 3.6 1.5l1.1.2c.9.2 1.5.4 1.8.7.3.3.5.7.5 1.2 0 .6-.2 1-.6 1.3-.4.3-1 .5-1.8.5-.9 0-1.7-.2-2.3-.6-.5-.3-.9-.8-1.1-1.5h-2.7c.2 1.5.9 2.6 2.1 3.4 1.1.7 2.5 1.1 4.1 1.1 1.7 0 3.1-.4 4.1-1.2 1-.8 1.5-1.9 1.5-3.3 0-1.3-.4-2.3-1.2-3-.8-.7-2-1.2-3.6-1.5l-1.1-.2c-.9-.2-1.5-.4-1.8-.6-.3-.3-.5-.6-.5-1.1 0-.5.2-1 .6-1.3.4-.3.9-.4 1.6-.4.8 0 1.4.2 1.9.5.4.3.7.7.9 1.3h2.6c-.2-1.3-.8-2.4-1.9-3.1-1-.7-2.3-1-3.8-1z"
        />
      </svg>
      <span className="plug-mp-badge-text">
        Pagos seguros a través de{" "}
        <strong className="plug-mp-badge-name">Mercado Pago</strong>
      </span>
    </div>
  );
}
