import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones — The Plug Rosario",
  description:
    "Términos y condiciones del servicio de encargos de The Plug Rosario.",
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
          <h2 className="text-lg font-semibold">1. Servicio de encargos</h2>
          <p>
            The Plug Rosario ofrece un servicio de encargos de indumentaria importada. El
            cliente puede solicitar productos del catálogo disponible en la web o
            enviar una imagen de un producto específico que desee adquirir.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Seña y pagos</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Para confirmar un encargo, el cliente debe abonar una{" "}
              <strong>seña del 50%</strong> del precio total.
            </li>
            <li>
              La seña puede abonarse mediante{" "}
              <strong>Mercado Pago o transferencia bancaria</strong>.
            </li>
            <li>
              El <strong>50% restante</strong> debe abonarse al momento de la
              entrega o retiro del producto.
            </li>
            <li>
              El cliente tiene un plazo de <strong>24 horas</strong> para pagar la
              seña una vez aceptado el presupuesto. Transcurrido ese plazo sin
              pago, el encargo será cancelado automáticamente.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            3. Política de cancelación y reembolsos
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Cancelación antes de la compra en China:</strong> se devuelve
              el 100% de la seña abonada.
            </li>
            <li>
              <strong>Cancelación después de confirmado el pedido:</strong> la seña
              no es reembolsable, ya que se utilizó para adquirir el producto.
            </li>
            <li>
              <strong>Falta de stock del proveedor:</strong> se devuelve el 100% de
              la seña abonada.
            </li>
            <li>
              Si el cliente no completa el pago del restante dentro de los{" "}
              <strong>7 días</strong> posteriores a la notificación de llegada del
              producto, The Plug Rosario se reserva el derecho de disponer del
              producto.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            4. Plazos de importación
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              El plazo estimado de importación es de{" "}
              <strong>30 días hábiles</strong> desde la confirmación del pedido.
            </li>
            <li>
              A este plazo se suma el tiempo de{" "}
              <strong>envío dentro de Argentina</strong>, que varía según la
              ubicación del cliente.
            </li>
            <li>
              Los plazos son estimativos y pueden variar por factores externos
              (aduana, envío internacional, feriados, etc.).
            </li>
            <li>
              The Plug Rosario comunicará al cliente cualquier demora significativa
              en el proceso.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            5. Presupuestos (encargos personalizados)
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Para encargos personalizados (con foto), The Plug Rosario enviará un
              presupuesto al cliente por email.
            </li>
            <li>
              El presupuesto incluye el precio total del producto con el margen
              aplicado.
            </li>
            <li>
              El cliente tiene <strong>24 horas</strong> para aceptar o rechazar el
              presupuesto.
            </li>
            <li>
              Si el presupuesto no es aceptado dentro del plazo, el encargo será
              cancelado.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            6. Productos y disponibilidad
          </h2>
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
          <h2 className="text-lg font-semibold">
            7. Protección de datos
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
          <h2 className="text-lg font-semibold">8. Contacto</h2>
          <p>
            Para consultas sobre estos términos, puede contactarnos a través de
            nuestro email o WhatsApp disponible en la web.
          </p>
        </section>
      </div>
    </div>
  );
}
