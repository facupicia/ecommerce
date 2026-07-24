-- Migración: tablas de encargos (productos sincronizados del scraper + pedidos)
-- Ejecutar en Supabase SQL Editor

-- ============================================================
-- 1. Productos disponibles para encargo (sincronizados desde el scraper)
-- ============================================================
create table if not exists encargos_products (
  id          uuid primary key default gen_random_uuid(),
  scraper_id  integer not null unique,
  source_type text not null default '',
  item_id     text not null default '',
  title       text not null default '',
  title_cn    text,
  price_cny   numeric(12, 2),
  image_urls  jsonb default '[]'::jsonb,
  desc_images jsonb default '[]'::jsonb,
  product_url text,
  detail_url  text,
  category    text,
  variants    jsonb default '[]'::jsonb,
  activo      boolean default true,
  synced_at   timestamp with time zone default now(),
  created_at  timestamp with time zone default now()
);

create index if not exists idx_encargos_products_activo on encargos_products(activo);
create index if not exists idx_encargos_products_category on encargos_products(category);
create index if not exists idx_encargos_products_synced on encargos_products(synced_at desc);

-- ============================================================
-- 2. Pedidos de encargo
-- ============================================================
create table if not exists encargos_orders (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references encargos_products(id) on delete cascade,
  product_title     text not null default '',
  product_image     text,
  variante_nombre   text,
  variante_imagen   text,
  talle             text,
  precio_cny        numeric(12, 2),
  precio_usd        numeric(12, 2),
  cantidad          integer not null default 1,
  cliente_nombre    text not null,
  cliente_email     text not null,
  cliente_telefono  text,
  cliente_direccion text,
  cliente_notas     text,
  estado            text not null default 'pending' check (estado in ('pending', 'confirmed', 'ordered', 'received', 'delivered', 'cancelled')),
  admin_notas       text,
  created_at        timestamp with time zone default now(),
  updated_at        timestamp with time zone default now()
);

create index if not exists idx_encargos_orders_estado on encargos_orders(estado);
create index if not exists idx_encargos_orders_created on encargos_orders(created_at desc);
create index if not exists idx_encargos_orders_product on encargos_orders(product_id);

-- Trigger para actualizar updated_at (la función ya existe desde migración 001)
drop trigger if exists update_encargos_orders_updated_at on encargos_orders;
create trigger update_encargos_orders_updated_at
  before update on encargos_orders
  for each row
  execute function update_updated_at_column();
