-- Migración: tabla de cotizaciones de la calculadora
-- Ejecutar en Supabase SQL Editor

-- ============================================================
-- Tabla de cotizaciones guardadas
-- ============================================================
create table if not exists shop_cotizaciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fx jsonb not null default '{}'::jsonb,
  envio jsonb not null default '{}'::jsonb,
  aduana jsonb not null default '{}'::jsonb,
  productos jsonb not null default '[]'::jsonb,
  resultados jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_shop_cotizaciones_created_at on shop_cotizaciones(created_at desc);

-- Trigger para actualizar updated_at (la función ya existe desde la migración 001)
drop trigger if exists update_shop_cotizaciones_updated_at on shop_cotizaciones;
create trigger update_shop_cotizaciones_updated_at
  before update on shop_cotizaciones
  for each row
  execute function update_updated_at_column();
