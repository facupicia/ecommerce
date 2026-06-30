import { CssbuyOrder, FxRates, ShipmentCosts, AduanaConfig, Product, Cotizacion } from "./types";
import { calcularTodo } from "./utils";

export const CALC_CONFIG_KEY = "cssbuy-calc-config";

export interface CalcConfig {
  fx: FxRates;
  envio: ShipmentCosts;
  aduana: AduanaConfig;
}

export const DEFAULT_CALC_CONFIG: CalcConfig = {
  fx: { blue: 1300, oficial: 1100, mep: 1200, cny: 7.2 },
  envio: {
    freightUSD: 0,
    depositFeePct: 0.04,
    markup: 2.0,
  },
  aduana: {
    dentroFranquicia: false,
    enviosAnio: 0,
    ivaPct: 0.21,
    iibbPct: 0.03,
    valorDeclaradoUSD: null,
    pagoNetoImpuestosUSD: null,
  },
};

export function loadCalcConfig(): CalcConfig {
  if (typeof window === "undefined") return DEFAULT_CALC_CONFIG;
  try {
    const raw = localStorage.getItem(CALC_CONFIG_KEY);
    if (!raw) return DEFAULT_CALC_CONFIG;
    const parsed = JSON.parse(raw);
    const migratedEnvio = { ...DEFAULT_CALC_CONFIG.envio, ...parsed.envio };
    if ("freightCNY" in parsed.envio && !("freightUSD" in parsed.envio)) {
      migratedEnvio.freightUSD = parsed.envio.freightCNY;
    }
    return {
      fx: { ...DEFAULT_CALC_CONFIG.fx, ...parsed.fx },
      envio: migratedEnvio,
      aduana: { ...DEFAULT_CALC_CONFIG.aduana, ...parsed.aduana },
    };
  } catch {
    return DEFAULT_CALC_CONFIG;
  }
}

export function saveCalcConfig(config: CalcConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CALC_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export interface PricingEstimate {
  precioSugeridoARS: number;
  costoUnitUSD: number;
  costoTotalUSD: number;
  gananciaUnitUSD: number;
  gananciaTotalUSD: number;
  margenPct: number;
  fobRealUSD: number;
  impuestosUSD: number;
  pesoG: number;
}

export function buildProductFromOrder(
  order: CssbuyOrder,
  overrides?: Partial<Pick<Product, "pesoG" | "precioCNY" | "envioLocalCNY" | "envioChinaCNY" | "cantidad">>
): Product {
  return {
    id: order.oid || "order",
    nombre: order.producto || "Producto",
    precioCNY: overrides?.precioCNY ?? order.precio_unitario_cny ?? 0,
    envioLocalCNY: overrides?.envioLocalCNY ?? order.envio_local_cny ?? 0,
    envioChinaCNY: overrides?.envioChinaCNY ?? order.envio_china_cny ?? 0,
    pesoG: overrides?.pesoG ?? order.peso_g ?? 0,
    cantidad: overrides?.cantidad ?? order.cantidad ?? 1,
    precioVentaUSD: 0,
    link: order.url || "",
    imgURL: order.imagen || "",
    oid: order.oid || undefined,
  };
}

export function calculateProductEstimate(
  product: Product,
  config: CalcConfig = DEFAULT_CALC_CONFIG
): PricingEstimate | null {
  if (!product.precioCNY && !product.pesoG) return null;

  const result = calcularTodo([product], config.fx, config.envio, config.aduana);
  if (result.productosCalc.length === 0) return null;

  const p = result.productosCalc[0];
  return {
    precioSugeridoARS: p.ventaUnitARS,
    costoUnitUSD: p.costoUnitUSD,
    costoTotalUSD: p.costoTotalUSD,
    gananciaUnitUSD: p.gananciaUnitUSD,
    gananciaTotalUSD: p.gananciaTotalUSD,
    margenPct: result.margenTotalPct,
    fobRealUSD: result.fobRealUSD,
    impuestosUSD: result.impuestosUSD,
    pesoG: result.pesoTotalG,
  };
}

export function estimateFromOrder(
  order: CssbuyOrder,
  config: CalcConfig = DEFAULT_CALC_CONFIG,
  overrides?: Partial<Pick<Product, "pesoG" | "precioCNY" | "envioLocalCNY" | "envioChinaCNY" | "cantidad">>
): PricingEstimate | null {
  return calculateProductEstimate(buildProductFromOrder(order, overrides), config);
}

export function estimateFromOrderAndCotizacion(
  order: CssbuyOrder,
  cot: Cotizacion,
  overrides?: Partial<Pick<Product, "pesoG" | "precioCNY" | "envioLocalCNY" | "envioChinaCNY" | "cantidad">>
): PricingEstimate | null {
  const config: CalcConfig = { fx: cot.fx, envio: cot.envio, aduana: cot.aduana };
  return calculateProductEstimate(buildProductFromOrder(order, overrides), config);
}

function findProductInCotizacion(order: CssbuyOrder, cot: Cotizacion): Product | undefined {
  return cot.productos.find((p) => p.oid === order.oid || p.link === order.url);
}

export function estimateFromOrderAndCotizacionProduct(
  order: CssbuyOrder,
  cot: Cotizacion,
  overrides?: Partial<Pick<Product, "pesoG" | "precioCNY" | "envioLocalCNY" | "envioChinaCNY" | "cantidad">>
): PricingEstimate | null {
  const config: CalcConfig = { fx: cot.fx, envio: cot.envio, aduana: cot.aduana };

  // Use the full cotizacion product list so freight and taxes are prorated correctly.
  // If the order is not in the cotizacion, fall back to single-product estimate.
  const existing = findProductInCotizacion(order, cot);
  if (!existing && cot.productos.length > 0) {
    return calculateProductEstimate(buildProductFromOrder(order, overrides), config);
  }

  const targetProduct = buildProductFromOrder(order, overrides);
  const products = cot.productos.map((p) =>
    p.id === existing?.id || p.oid === order.oid || p.link === order.url ? targetProduct : p
  );
  // If for some reason the product wasn't found but cotizacion is empty, use target alone.
  const allProducts = products.length > 0 ? products : [targetProduct];

  const result = calcularTodo(allProducts, config.fx, config.envio, config.aduana);
  const p = result.productosCalc.find(
    (pc) => pc.id === targetProduct.id || pc.oid === order.oid || pc.link === order.url
  );
  if (!p) return null;

  return {
    precioSugeridoARS: p.ventaUnitARS,
    costoUnitUSD: p.costoUnitUSD,
    costoTotalUSD: p.costoTotalUSD,
    gananciaUnitUSD: p.gananciaUnitUSD,
    gananciaTotalUSD: p.gananciaTotalUSD,
    margenPct: result.margenTotalPct,
    fobRealUSD: result.fobRealUSD,
    impuestosUSD: result.impuestosUSD,
    pesoG: result.pesoTotalG,
  };
}

export interface PricingEstimateBreakdown {
  fobUSD: number;
  envioProrrateadoUSD: number;
  impuestosProrrateadosUSD: number;
  costoUnitUSD: number;
  precioSugeridoUSD: number;
  gananciaUnitUSD: number;
  margenPct: number;
}

export function calculateProductEstimateBreakdown(
  product: Product,
  config: CalcConfig = DEFAULT_CALC_CONFIG
): PricingEstimateBreakdown | null {
  const estimate = calculateProductEstimate(product, config);
  if (!estimate) return null;

  const result = calcularTodo([product], config.fx, config.envio, config.aduana);
  const p = result.productosCalc[0];
  if (!p) return null;

  return {
    fobUSD: p.precioUnitUSD + p.envioLocalUnitUSD + p.envioChinaUnitUSD,
    envioProrrateadoUSD: p.envioProrrateadoUSD,
    impuestosProrrateadosUSD: p.impuestosProrrateadoUSD,
    costoUnitUSD: estimate.costoUnitUSD,
    precioSugeridoUSD: p.precioSugeridoUSD,
    gananciaUnitUSD: estimate.gananciaUnitUSD,
    margenPct: estimate.margenPct,
  };
}

export function calculateProductEstimateBreakdownFromCotizacion(
  order: CssbuyOrder,
  cot: Cotizacion,
  overrides?: Partial<Pick<Product, "pesoG" | "precioCNY" | "envioLocalCNY" | "envioChinaCNY" | "cantidad">>
): PricingEstimateBreakdown | null {
  const estimate = estimateFromOrderAndCotizacionProduct(order, cot, overrides);
  if (!estimate) return null;

  const config: CalcConfig = { fx: cot.fx, envio: cot.envio, aduana: cot.aduana };
  const existing = findProductInCotizacion(order, cot);
  const targetProduct = buildProductFromOrder(order, overrides);
  const products = cot.productos.length > 0
    ? cot.productos.map((p) =>
        p.id === existing?.id || p.oid === order.oid || p.link === order.url ? targetProduct : p
      )
    : [targetProduct];

  const result = calcularTodo(products, config.fx, config.envio, config.aduana);
  const p = result.productosCalc.find(
    (pc) => pc.id === targetProduct.id || pc.oid === order.oid || pc.link === order.url
  );
  if (!p) return null;

  return {
    fobUSD: p.precioUnitUSD + p.envioLocalUnitUSD + p.envioChinaUnitUSD,
    envioProrrateadoUSD: p.envioProrrateadoUSD,
    impuestosProrrateadosUSD: p.impuestosProrrateadoUSD,
    costoUnitUSD: p.costoUnitUSD,
    precioSugeridoUSD: p.precioSugeridoUSD,
    gananciaUnitUSD: p.gananciaUnitUSD,
    margenPct: result.margenTotalPct,
  };
}

export function formatARS(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}
