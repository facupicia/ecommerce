import Link from "next/link";

export default function OrderConfirmedPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-24 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 border border-[#1a1a1a] mb-6">
        <svg
          className="w-8 h-8 text-[#1a1a1a]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="plug-font-serif text-3xl sm:text-4xl text-[#1a1a1a] mb-3">
        ¡Pedido confirmado!
      </h1>
      <p className="text-[14px] text-[#777777] mb-2 max-w-md mx-auto">
        Gracias por tu compra. Te vamos a contactar pronto para coordinar el
        envío y el pago.
      </p>
      <p className="text-[12px] text-[#777777] mb-8">
        Si tenés alguna duda, escribinos a hola@tienda.com
      </p>
      <Link href="/" className="kith-btn">
        Volver a la tienda
      </Link>
    </div>
  );
}
