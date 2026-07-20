interface Benefit {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const iconClass = "w-6 h-6";

const benefits: Benefit[] = [
  {
    title: "Envíos a todo el país",
    description: "Recibí tu pedido donde estés",
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    title: "Compra protegida",
    description: "Pagos seguros con Mercado Pago",
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "Transferencia sin recargo",
    description: "El mejor precio pagando por transferencia",
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    title: "Atención personalizada",
    description: "Te asesoramos por WhatsApp",
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
];

interface BenefitsBarProps {
  variant?: "default" | "compact";
}

/**
 * Barra de beneficios / propuesta de valor — estándar en tiendas
 * competitivas (TiendaNube, Shopify) para generar confianza.
 */
export function BenefitsBar({ variant = "default" }: BenefitsBarProps) {
  if (variant === "compact") {
    return (
      <ul className="space-y-3">
        {benefits.map((b) => (
          <li key={b.title} className="flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#f5f5f7] text-[#1d1d1f] flex-shrink-0 [&>svg]:w-4.5 [&>svg]:h-4.5">
              {b.icon}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[#1d1d1f] leading-tight">{b.title}</p>
              <p className="text-[12px] text-[#86868b] leading-tight mt-0.5">{b.description}</p>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section aria-label="Beneficios de comprar en plug" className="bg-white border-b border-[#ebebeb]">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 py-10 lg:py-12">
          {benefits.map((b) => (
            <div key={b.title} className="flex flex-col items-center text-center gap-3">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#f5f5f7] text-[#1d1d1f]">
                {b.icon}
              </span>
              <div>
                <p className="text-[13px] font-semibold text-[#1d1d1f] leading-tight">{b.title}</p>
                <p className="text-[12px] text-[#86868b] leading-snug mt-1">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
