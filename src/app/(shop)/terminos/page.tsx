import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones — The Plug Rosario",
  description:
    "Términos y condiciones de The Plug Rosario.",
};

export default function TerminosPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Términos y Condiciones</h1>
      <p className="text-sm text-[var(--color-fg-muted)] mb-8">
        Última actualización: julio 2026
      </p>

      <div className="prose prose-sm max-w-none space-y-6 text-[var(--color-fg)]">
        <section>
          <h2 className="text-lg font-semibold">1. Productos y disponibilidad</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              La disponibilidad de los productos está sujeta a la confirmación con
              el proveedor.
            </li>
            <li>
              Pueden existir diferencias menores de color o tonalidad respecto a
              las imágenes mostradas.
            </li>
            <li>
              Las talles pueden variar según el fabricante. The Plug Rosario
              proporcionará la información de talles disponible.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Pagos</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Los pagos se procesan a través de Mercado Pago. Aceptamos tarjetas de
              crédito, débito y dinero en cuenta.
            </li>
            <li>
              El precio publicado incluye todos los impuestos aplicables.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Envíos</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Realizamos envíos a todo el país. Los tiempos de entrega varían
              según la ubicación.
            </li>
            <li>
              The Plug Rosario comunicará al cliente cualquier demora significativa
              en el proceso.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Cambios y devoluciones</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Aceptamos cambios por talle dentro de los 7 días de recibido el producto.
            </li>
            <li>
              La prenda debe estar sin uso y con etiquetas. Los gastos de envío por
              cambio corren por cuenta del comprador.
            </li>
            <li>
              No hacemos devoluciones por dinero.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            5. Protección de datos
          </h2>
          <p>
            Los datos personales del cliente serán tratados conforme a la Ley
            25.326 de Protección de Datos Personales de la República Argentina.
            Para más información, consulte nuestra{" "}
            <a href="/privacy" className="underline">
              Política de Privacidad
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Contacto</h2>
          <p>
            Para consultas sobre estos términos, puede contactarnos a través de
            nuestro email o WhatsApp disponible en la web.
          </p>
        </section>
      </div>
    </div>
  );
}
