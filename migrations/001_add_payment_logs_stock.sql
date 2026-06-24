-- Migración: tablas de logs, pagos y movimientos de stock
-- Ejecutar en Supabase SQL Editor

-- ============================================================
-- 1. Logs de cambios de estado de órdenes
-- ============================================================
create table if not exists shop_order_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references shop_orders(id) on delete cascade,
  estado_anterior text,
  estado_nuevo text not null,
  tipo text not null check (tipo in ('webhook', 'manual', 'system')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

create index if not exists idx_shop_order_logs_order_id on shop_order_logs(order_id);
create index if not exists idx_shop_order_logs_created_at on shop_order_logs(created_at desc);

-- ============================================================
-- 2. Pagos asociados a órdenes (principalmente Mercado Pago)
-- ============================================================
create table if not exists shop_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references shop_orders(id) on delete cascade,
  mp_payment_id text,
  mp_status text,
  mp_status_detail text,
  monto_pagado numeric(12,2),
  metodo_pago text,
  cuotas integer,
  fecha_pago timestamp with time zone,
  raw_response jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_shop_payments_order_id on shop_payments(order_id);
create unique index if not exists idx_shop_payments_mp_payment_id on shop_payments(mp_payment_id) where mp_payment_id is not null;
create index if not exists idx_shop_payments_mp_status on shop_payments(mp_status);

-- ============================================================
-- 3. Movimientos de stock (ventas, restock, ajustes)
-- ============================================================
create table if not exists shop_stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references shop_products(id) on delete cascade,
  cantidad integer not null,
  tipo text not null check (tipo in ('sale', 'restock', 'adjustment')),
  order_id uuid references shop_orders(id) on delete set null,
  motivo text,
  created_at timestamp with time zone default now()
);

create index if not exists idx_shop_stock_movements_product_id on shop_stock_movements(product_id);
create index if not exists idx_shop_stock_movements_order_id on shop_stock_movements(order_id);
create index if not exists idx_shop_stock_movements_created_at on shop_stock_movements(created_at desc);

-- Trigger para actualizar updated_at en shop_payments
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_shop_payments_updated_at ON shop_payments;
CREATE TRIGGER update_shop_payments_updated_at
  BEFORE UPDATE ON shop_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
