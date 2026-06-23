import Link from "next/link";

export default function OrderConfirmedPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
        <svg
          className="w-10 h-10 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
        ¡Pedido confirmado!
      </h1>
      <p className="text-gray-500 mb-2 max-w-md mx-auto">
        Gracias por tu compra. Te vamos a contactar pronto para coordinar el
        envío y el pago.
      </p>
      <p className="text-sm text-gray-400 mb-8">
        Si tenés alguna duda, escribinos a hola@tienda.com
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-colors"
      >
        Volver a la tienda
      </Link>
    </div>
  );
}
