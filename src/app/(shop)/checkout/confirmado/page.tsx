import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrderConfirmedPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status || params.collection_status || "") as string;
  const paymentId = (params.payment_id || params.collection_id || "") as string;
  const orderId = (params.order || params.external_reference || "") as string;

  let title = "¡Pedido confirmado!";
  let message = "Gracias por tu compra. Te vamos a contactar pronto para coordinar el envío y el pago.";
  let iconColor = "text-[#1a1a1a]";
  let iconPath = "M5 13l4 4L19 7"; // Checkmark

  if (status === "approved") {
    title = "¡Pago aprobado!";
    message = "Tu pago se procesó con éxito. El pedido ha sido registrado y comenzaremos a prepararlo pronto.";
  } else if (status === "pending" || status === "in_process") {
    title = "Pago en proceso";
    message = "Mercado Pago está procesando tu pago. Una vez aprobado, actualizaremos tu pedido de forma automática.";
    iconColor = "text-amber-500";
    iconPath = "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"; // Clock
  } else if (status === "rejected" || status === "failure") {
    title = "Pago no procesado";
    message = "No pudimos completar tu pago a través de Mercado Pago. Podés intentar nuevamente o contactarnos si el problema persiste.";
    iconColor = "text-red-500";
    iconPath = "M6 18L18 6M6 6l12 12"; // X mark
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-24 text-center">
      <div className={`inline-flex items-center justify-center w-16 h-16 border ${status === "rejected" || status === "failure" ? "border-red-500" : status === "pending" || status === "in_process" ? "border-amber-500" : "border-[#1a1a1a]"} mb-6`}>
        <svg
          className={`w-8 h-8 ${iconColor}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={iconPath}
          />
        </svg>
      </div>
      <h1 className="plug-font-serif text-3xl sm:text-4xl text-[#1a1a1a] mb-3">
        {title}
      </h1>
      <p className="text-[14px] text-[var(--plug-gray)] mb-4 max-w-md mx-auto">
        {message}
      </p>

      <div className="space-y-1 mb-8">
        {paymentId && (
          <p className="text-[12px] text-neutral-400 font-mono">
            ID de Pago: {paymentId}
          </p>
        )}
        {orderId && (
          <p className="text-[12px] text-neutral-400 font-mono">
            ID de Pedido: {orderId}
          </p>
        )}
      </div>

      <p className="text-[12px] text-[var(--plug-gray)] mb-8">
        Si tenés alguna duda, escribinos a hola@tienda.com
      </p>

      <Link href="/" className="plug-btn">
        Volver a la tienda
      </Link>
    </div>
  );
}
