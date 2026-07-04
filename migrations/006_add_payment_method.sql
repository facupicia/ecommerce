-- Agrega columna payment_method para soportar transferencia vs mercadopago
ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'mercadopago';
