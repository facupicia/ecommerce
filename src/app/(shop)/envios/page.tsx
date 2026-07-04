import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Envíos y Devoluciones | plug",
  description: "Información sobre envíos, tiempos de entrega y política de cambios y devoluciones en plug.",
};

export default function EnviosPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
      <div className="max-w-2xl mx-auto">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--plug-gray)] mb-4 text-center">
          Información
        </p>
        <h1 className="plug-font-serif text-3xl sm:text-4xl text-[#1a1a1a] mb-12 text-center">
          Envíos y Devoluciones
        </h1>

        <div className="space-y-10">
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a] mb-4">
              📦 Envíos
            </h2>
            <div className="space-y-4 text-[14px] leading-relaxed text-[var(--plug-gray)]">
              <p>
                Realizamos envíos a todo el país a través de Correo Argentino y Andreani.
                El costo del envío se calcula en base al peso del paquete y la distancia
                al destino, y se confirma al momento de coordinar el despacho.
              </p>
              <p>
                <strong className="text-[#1a1a1a]">Rosario y zona:</strong> entrega en 24-48hs
                hábiles. Coordinamos punto de encuentro o envío por cadetería.
              </p>
              <p>
                <strong className="text-[#1a1a1a]">Resto del país:</strong> de 3 a 7 días
                hábiles según la provincia.
              </p>
              <p>
                <strong className="text-[#1a1a1a]">Productos importados:</strong> pueden
                demorar entre 15 y 30 días por trámites aduaneros. Te mantenemos al tanto
                del estado de tu pedido.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a] mb-4">
              🔄 Cambios
            </h2>
            <div className="space-y-4 text-[14px] leading-relaxed text-[var(--plug-gray)]">
              <p>
                Aceptamos cambios por talle dentro de los <strong className="text-[#1a1a1a]">7 días</strong> de recibido el producto.
              </p>
              <p>
                Condiciones para el cambio:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>La prenda debe estar sin uso, en perfecto estado y con etiquetas originales.</li>
                <li>Los gastos de envío por cambio corren por cuenta del comprador.</li>
                <li>El cambio está sujeto a disponibilidad de stock en el talle solicitado.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a] mb-4">
              ❌ Devoluciones
            </h2>
            <div className="space-y-4 text-[14px] leading-relaxed text-[var(--plug-gray)]">
              <p>
                No realizamos devoluciones por dinero, salvo que el producto presente
                fallas de fabricación. En ese caso, ofrecemos cambio por el mismo producto
                o por otro de igual valor.
              </p>
              <p>
                Si tenés alguna duda o inconveniente con tu compra, contactanos por
                WhatsApp y lo resolvemos juntos.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#d9d9d9] text-center">
          <p className="text-[13px] text-[var(--plug-gray)] mb-4">
            ¿Tenés más preguntas?
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/faq" className="plug-btn text-xs">
              Ver FAQ
            </Link>
            <a
              href="https://wa.me/5493411234567"
              target="_blank"
              rel="noopener noreferrer"
              className="plug-btn text-xs"
            >
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
