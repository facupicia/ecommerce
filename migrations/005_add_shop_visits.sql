-- Migración: tracking de visitas a la tienda pública
-- Ejecutar en Supabase SQL Editor

create table if not exists shop_visits (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer text,
  user_agent text,
  ip_hash text,
  country text,
  created_at timestamp with time zone default now()
);

create index if not exists idx_shop_visits_created_at on shop_visits(created_at desc);
create index if not exists idx_shop_visits_path on shop_visits(path);
create index if not exists idx_shop_visits_ip_hash on shop_visits(ip_hash);
