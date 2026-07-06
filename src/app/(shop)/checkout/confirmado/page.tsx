import OrderConfirmedClient from "./OrderConfirmedClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrderConfirmedPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status || params.collection_status || "") as string;
  const paymentId = (params.payment_id || params.collection_id || "") as string;
  const orderId = (params.order || params.external_reference || "") as string;
  const method = (params.method || "mercadopago") as string;

  return (
    <OrderConfirmedClient
      paymentId={paymentId}
      orderId={orderId}
      initialStatus={status}
      paymentMethod={method}
    />
  );
}
