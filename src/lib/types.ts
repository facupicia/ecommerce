export interface CssbuyOrder {
  oid: string;
  producto: string;
  imagen: string;
  url: string;
  vendedor: string;
  variante: string;
  precio_unitario_cny: number;
  envio_local_cny: number;
  envio_china_cny: number;
  cantidad: number;
  estado: string;
  tracking: string;
  peso_g: number;
  fecha_pedido: number;
}

export interface CssbuyTransaction {
  rid: number;
  uname: string;
  type: number; // 1 = debit, 2 = credit
  action: string;
  money: string;
  accountmoney: string;
  remark: string;
  addtime: number;
  source: number;
  id_type: number;
  other_id: number;
  purpose_id: string;
  is_kc: number;
  // parsed fields (filled by parser)
  orderId?: string;
  productName?: string;
  productUrl?: string;
  quantity?: number;
  seller?: string;
}

export interface CssbuyRecordGroup {
  orderId: string;
  transactions: CssbuyTransaction[];
  buyItemTotal: number;
  serviceFeeTotal: number;
  domesticShippingTotal: number;
  adjustPriceTotal: number;
  rechargeTotal: number;
  otherTotal: number;
  totalSpent: number;
  productName?: string;
  productUrl?: string;
  quantity?: number;
}

export interface Product {
  id: string;
  nombre: string;
  precioCNY: number;
  envioLocalCNY: number;
  envioChinaCNY: number;
  pesoG: number;
  cantidad: number;
  precioVentaUSD: number;
  link: string;
  imgURL: string;
  oid?: string;
}

export interface ShopProduct {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  precio_ars: number;
  precio_original_ars: number | null;
  fotos: string[];
  categoria: string;
  stock: number;
  talles: string[];
  color: string;
  marca: string | null;
  indumentaria: string | null;
  publicado: boolean;
  cssbuy_oid: string | null;
  peso_g: number;
  created_at: string;
  updated_at: string;
}

export interface ShopOrder {
  id: string;
  items: ShopOrderItem[];
  total_ars: number;
  estado: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  cliente_direccion: string;
  cliente_notas: string;
  created_at: string;
}

export interface ShopOrderItem {
  product_id: string;
  nombre: string;
  precio_ars: number;
  cantidad: number;
  imagen: string;
  talle?: string | null;
}

export interface FxRates {
  blue: number;
  oficial: number;
  mep: number;
  cny: number;
}

export interface ShipmentCosts {
  freightCNY: number;
  serviceCNY: number;
  recargaPct: number;
  recargaFijo: number;
  platformFee: number;
  markup: number;
}

export interface AduanaConfig {
  dentroFranquicia: boolean;
  enviosAnio: number;
  ivaPct: number;
  iibbPct: number;
  valorDeclaradoUSD: number | null;
  pagoNetoImpuestosUSD: number | null;
}

export interface ProductCalc extends Product {
  precioUnitUSD: number;
  envioLocalUnitUSD: number;
  envioChinaUnitUSD: number;
  costoProductoUnitUSD: number;
  costoUSD: number;
  pesoGTotal: number;
  envioProrrateadoUSD: number;
  impuestosProrrateadoUSD: number;
  costoTotalUSD: number;
  costoUnitUSD: number;
  precioSugeridoUSD: number;
  ventaUSD: number;
  gananciaUnitUSD: number;
  gananciaTotalUSD: number;
  costoUnitARS: number;
  ventaUnitARS: number;
  gananciaUnitARS: number;
  gananciaTotalARS: number;
}

export interface CalculationResult {
  productosCalc: ProductCalc[];
  productosUSDTotal: number;
  pesoTotalG: number;
  freightUSD: number;
  serviceUSD: number;
  recargaFee: number;
  costoEnvioTotalUSD: number;
  costoPaqueteUSD: number;
  costoPaqueteARS: number;
  fobRealUSD: number;
  fobDeclaradoUSD: number;
  ahorroSubdeclaracionUSD: number;
  fobUSD: number;
  impuestosUSD: number;
  impuestosARS: number;
  costoTotalARS: number;
  costoTotalUSD: number;
  ingresoTotalUSD: number;
  ingresoTotalARS: number;
  gananciaTotalUSD: number;
  gananciaTotalARS: number;
  margenTotalPct: number;
  detalleImpuestos: {
    arancel: number;
    iva: number;
    iibb: number;
    tasaEst: number;
    franquicia: boolean;
    ahorro: number;
  };
  alerts: { type: string; msg: string }[];
}

export interface Cotizacion {
  id: string;
  fecha: string;
  nombre: string;
  fx: FxRates;
  envio: ShipmentCosts;
  aduana: AduanaConfig;
  productos: Product[];
  resultados: CalculationResult;
}

export interface ShopCotizacion {
  id: string;
  nombre: string;
  fx: FxRates;
  envio: ShipmentCosts;
  aduana: AduanaConfig;
  productos: Product[];
  resultados: CalculationResult;
  created_at: string;
  updated_at: string;
}

// ── Admin / Payments / Logs ──────────────────────────────

export interface ShopOrderLog {
  id: string;
  order_id: string;
  estado_anterior: string | null;
  estado_nuevo: string;
  tipo: "webhook" | "manual" | "system";
  metadata: Record<string, any>;
  created_at: string;
}

export interface ShopPayment {
  id: string;
  order_id: string;
  mp_payment_id: string | null;
  mp_status: string | null;
  mp_status_detail: string | null;
  monto_pagado: number | null;
  metodo_pago: string | null;
  cuotas: number | null;
  fecha_pago: string | null;
  raw_response: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface ShopStockMovement {
  id: string;
  product_id: string;
  cantidad: number;
  tipo: "sale" | "restock" | "adjustment";
  order_id: string | null;
  motivo: string | null;
  created_at: string;
}
