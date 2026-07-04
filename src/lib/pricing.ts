/** 6% recargo por usar Mercado Pago (cubre comisiones de MP) */
export const MP_RECARGO = 0.06;

export function getMercadoPagoPrice(transferPrice: number): number {
  return Math.round(transferPrice * (1 + MP_RECARGO));
}

export function getTransferPrice(mpPrice: number): number {
  return Math.round(mpPrice / (1 + MP_RECARGO));
}
