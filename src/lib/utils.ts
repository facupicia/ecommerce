import { FxRates, ShipmentCosts, AduanaConfig, Product, ProductCalc, CalculationResult } from "./types";

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function fmtUSD(n: number): string {
  return `USD ${n.toFixed(2)}`;
}

export function fmtARS(n: number): string {
  return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function calcularTodo(
  productos: Product[],
  fx: FxRates,
  envio: ShipmentCosts,
  aduana: AduanaConfig
): CalculationResult {
  if (productos.length === 0) {
    return emptyResult();
  }

  const cnyToUsd = fx.cny > 0 ? 1 / fx.cny : 0.1389;
  const blue = fx.blue > 0 ? fx.blue : 1300;
  const alertas: { type: string; msg: string }[] = [];

  // Calcular cada producto
  const productosCalc: ProductCalc[] = productos.map((p) => {
    const cantidad = Math.max(1, p.cantidad || 1);
    const precioUnitUSD = (p.precioCNY || 0) * cnyToUsd;
    const envioLocalUnitUSD = (p.envioLocalCNY || 0) * cnyToUsd;
    const envioChinaUnitUSD = (p.envioChinaCNY || 0) * cnyToUsd;
    const costoProductoUnitUSD = precioUnitUSD + envioLocalUnitUSD;
    const pesoGTotal = (p.pesoG || 0) * cantidad;
    const costoUSD = costoProductoUnitUSD * cantidad;
    const precioSugeridoUSD = costoProductoUnitUSD * (envio.markup || 2);

    return {
      ...p,
      cantidad,
      precioUnitUSD,
      envioLocalUnitUSD,
      envioChinaUnitUSD,
      costoProductoUnitUSD,
      costoUSD,
      pesoGTotal,
      envioProrrateadoUSD: 0,
      impuestosProrrateadoUSD: 0,
      costoTotalUSD: 0,
      costoUnitUSD: 0,
      precioSugeridoUSD,
      ventaUSD: precioSugeridoUSD * cantidad,
      gananciaUnitUSD: 0,
      gananciaTotalUSD: 0,
      costoUnitARS: 0,
      ventaUnitARS: 0,
      gananciaUnitARS: 0,
      gananciaTotalARS: 0,
    };
  });

  const productosUSDTotal = productosCalc.reduce((s, p) => s + p.costoUSD, 0);
  const pesoTotalG = productosCalc.reduce((s, p) => s + p.pesoGTotal, 0);

  // Envío
  const freightUSD = (envio.freightCNY || 0) * cnyToUsd;
  const serviceUSD = (envio.serviceCNY || 0) * cnyToUsd;
  const baseEnvio = freightUSD + serviceUSD;
  const recargaFee = baseEnvio * (envio.recargaPct || 0) + (envio.recargaFijo || 0);
  const costoEnvioTotalUSD = baseEnvio + recargaFee;

  // Prorrateo de envío por peso
  const pcWithShipping = productosCalc.map((p) => {
    const envioProrrateadoUSD = pesoTotalG > 0 ? (costoEnvioTotalUSD * p.pesoGTotal) / pesoTotalG : 0;
    const costoSinImpuestos = p.costoUSD + envioProrrateadoUSD;
    return { ...p, envioProrrateadoUSD, costoSinImpuestos };
  });

  // FOB / Aduana
  const fobRealUSD = productosUSDTotal + envio.freightCNY * cnyToUsd;
  const fobDeclaradoUSD = aduana.valorDeclaradoUSD != null ? aduana.valorDeclaradoUSD : fobRealUSD;
  const ahorroSubdeclaracionUSD = fobRealUSD - fobDeclaradoUSD;
  const fobUSD = aduana.dentroFranquicia ? 0 : fobDeclaradoUSD;

  const arancel = fobUSD > 0 ? (fobUSD > 1000 ? fobUSD * 0.35 : 0) : 0;
  const iva = fobUSD > 0 ? (fobUSD + arancel) * (aduana.ivaPct || 0.21) : 0;
  const iibb = fobUSD > 0 ? (fobUSD + arancel + iva) * (aduana.iibbPct || 0.03) : 0;
  const tasaEst = fobUSD > 0 ? fobUSD * 0.02 : 0;
  const impuestosUSD = arancel + iva + iibb + tasaEst;
  const impuestosARS = impuestosUSD * blue;

  const costoTotalUSD = productosUSDTotal + costoEnvioTotalUSD + impuestosUSD;
  const costoTotalARS = costoTotalUSD * blue;

  // Prorrateo de impuestos
  const productosFinal = pcWithShipping.map((p) => {
    const impuestosProrrateadoUSD = pesoTotalG > 0 ? (impuestosUSD * p.pesoGTotal) / pesoTotalG : 0;
    const costoTotalProducto = p.costoSinImpuestos + impuestosProrrateadoUSD;
    const costoUnitUSD = p.cantidad > 0 ? costoTotalProducto / p.cantidad : 0;
    const ventaUSD = p.precioSugeridoUSD * p.cantidad;
    const gananciaTotalUSD = ventaUSD - costoTotalProducto;
    const gananciaUnitUSD = p.cantidad > 0 ? gananciaTotalUSD / p.cantidad : 0;

    return {
      ...p,
      impuestosProrrateadoUSD,
      costoTotalUSD: costoTotalProducto,
      costoUnitUSD,
      ventaUSD,
      gananciaUnitUSD,
      gananciaTotalUSD,
      costoUnitARS: costoUnitUSD * blue,
      ventaUnitARS: p.precioSugeridoUSD * blue,
      gananciaUnitARS: gananciaUnitUSD * blue,
      gananciaTotalARS: gananciaTotalUSD * blue,
    };
  });

  const ingresoTotalUSD = productosFinal.reduce((s, p) => s + p.ventaUSD, 0);
  const ingresoTotalARS = ingresoTotalUSD * blue;
  const gananciaTotalUSD = ingresoTotalUSD - costoTotalUSD;
  const gananciaTotalARS = gananciaTotalUSD * blue;
  const margenTotalPct = costoTotalUSD > 0 ? gananciaTotalUSD / costoTotalUSD : 0;

  // Alertas
  if (aduana.enviosAnio > 3) alertas.push({ type: "warning", msg: "Ya superaste 3 envíos este año" });
  if (ahorroSubdeclaracionUSD > 200) alertas.push({ type: "warning", msg: "Ahorro por subdeclaración > USD 200" });
  if (productos.length > 3) alertas.push({ type: "info", msg: `${productos.length} productos en el paquete` });
  if (productosUSDTotal === 0) alertas.push({ type: "warning", msg: "Falta configurar el valor CNY a USD" });

  return {
    productosCalc: productosFinal,
    productosUSDTotal,
    pesoTotalG,
    freightUSD,
    serviceUSD,
    recargaFee,
    costoEnvioTotalUSD,
    costoPaqueteUSD: costoTotalUSD,
    costoPaqueteARS: costoTotalARS,
    fobRealUSD,
    fobDeclaradoUSD,
    ahorroSubdeclaracionUSD,
    fobUSD,
    impuestosUSD,
    impuestosARS,
    costoTotalARS,
    costoTotalUSD,
    ingresoTotalUSD,
    ingresoTotalARS,
    gananciaTotalUSD,
    gananciaTotalARS,
    margenTotalPct,
    detalleImpuestos: { arancel, iva, iibb, tasaEst, franquicia: aduana.dentroFranquicia, ahorro: ahorroSubdeclaracionUSD },
    alerts: alertas,
  };
}

function emptyResult(): CalculationResult {
  return {
    productosCalc: [],
    productosUSDTotal: 0,
    pesoTotalG: 0,
    freightUSD: 0,
    serviceUSD: 0,
    recargaFee: 0,
    costoEnvioTotalUSD: 0,
    costoPaqueteUSD: 0,
    costoPaqueteARS: 0,
    fobRealUSD: 0,
    fobDeclaradoUSD: 0,
    ahorroSubdeclaracionUSD: 0,
    fobUSD: 0,
    impuestosUSD: 0,
    impuestosARS: 0,
    costoTotalARS: 0,
    costoTotalUSD: 0,
    ingresoTotalUSD: 0,
    ingresoTotalARS: 0,
    gananciaTotalUSD: 0,
    gananciaTotalARS: 0,
    margenTotalPct: 0,
    detalleImpuestos: { arancel: 0, iva: 0, iibb: 0, tasaEst: 0, franquicia: false, ahorro: 0 },
    alerts: [],
  };
}
