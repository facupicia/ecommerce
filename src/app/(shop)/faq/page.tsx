import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes | plug",
  description: "Respondemos tus dudas sobre compras, envíos, pagos y devoluciones en plug.",
};

const faqs = [
  {
    q: "¿Cómo compro en plug?",
    a: "Navegá por el catálogo, elegí los productos que te gusten, seleccioná talle y agregalos al carrito. Cuando termines, andá a Pagar, completá tus datos y serás redirigido a Mercado Pago para realizar el pago de forma segura.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Procesamos todos los pagos a través de Mercado Pago. Aceptamos tarjetas de crédito, débito y dinero en cuenta de Mercado Pago.",
  },
  {
    q: "¿Cuánto tarda el envío?",
    a: "Depende de tu ubicación y del producto. Los envíos dentro de Rosario suelen entregarse en 24-48hs hábiles. Para el resto del país, de 3 a 7 días hábiles a través de Correo Argentino o Andreani. Productos importados pueden demorar más por trámites aduaneros.",
  },
  {
    q: "¿Hacen envíos a todo el país?",
    a: "Sí. Despachamos a toda Argentina. El costo lo calculamos según peso y destino al confirmar el pedido.",
  },
  {
    q: "¿Puedo cambiar o devolver un producto?",
    a: "Sí, aceptamos cambios por talle dentro de los 7 días de recibido el producto. La prenda debe estar sin uso y con etiquetas. Los gastos de envío por cambio corren por cuenta del comprador. No hacemos devoluciones por dinero.",
  },
  {
    q: "¿Cómo sé qué talle elegir?",
    a: "Cada producto incluye medidas aproximadas en la descripción cuando están disponibles. Si tenés dudas, contactanos por WhatsApp y te ayudamos a elegir.",
  },
  {
    q: "¿Son productos originales?",
    a: "Trabajamos con proveedores directos de fábricas y mayoristas en China. Algunos productos son de marcas reconocidas y otros son de fabricación independiente con diseños exclusivos. La calidad es nuestra prioridad.",
  },
  {
    q: "¿Tienen local físico?",
    a: "Actualmente operamos 100% online desde Rosario, Argentina. Podés retirar en persona coordinando previamente por WhatsApp.",
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
      <div className="max-w-2xl mx-auto">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--plug-gray)] mb-4 text-center">
          Ayuda
        </p>
        <h1 className="plug-font-serif text-3xl sm:text-4xl text-[#1a1a1a] mb-4 text-center">
          Preguntas Frecuentes
        </h1>
        <p className="text-[14px] text-[var(--plug-gray)] text-center mb-12">
          Todo lo que necesitás saber sobre compras, envíos y más.
        </p>

        <div className="space-y-1">
          {faqs.map((faq, i) => (
            <details key={i} className="group border-b border-[#ebebeb]">
              <summary className="flex items-center justify-between py-4 cursor-pointer list-none">
                <span className="text-[14px] font-medium text-[#1a1a1a] pr-4">
                  {faq.q}
                </span>
                <svg
                  className="w-4 h-4 text-[var(--plug-gray)] flex-shrink-0 transition-transform duration-200 group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="pb-4 text-[13px] leading-relaxed text-[var(--plug-gray)]">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
