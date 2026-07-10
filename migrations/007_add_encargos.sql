-- Migración: Sistema de Encargos
-- Ejecutar en Supabase SQL Editor

-- ============================================================
-- 1. Perfil de cliente (extiende auth.users)
-- ============================================================
create table if not exists shop_client_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null default '',
  telefono text not null default '',
  direccion text not null default '',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- 2. Encargos
-- ============================================================
create table if not exists shop_encargos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Tipo: catálogo (pre-cargado) o personalizado (foto del cliente)
  tipo text not null check (tipo in ('catalogo', 'personalizado')),

  -- Estado del encargo
  estado text not null default 'pendiente_presupuesto'
    check (estado in (
      'pendiente_presupuesto',
      'pendiente',
      'confirmado',
      'en_camino',
      'listo',
      'entregado',
      'cancelado'
    )),

  -- Datos del producto (catálogo)
  producto_id uuid references shop_products(id) on delete set null,

  -- Datos del producto (personalizado — foto + descripción)
  imagen_url text,
  descripcion text,

  -- Común a ambos tipos
  categoria text not null,
  talle text not null,
  cantidad integer not null default 1 check (cantidad > 0),

  -- Precios
  precio_total numeric(12,2) default 0,
  sena_pagada numeric(12,2) default 0,
  monto_restante numeric(12,2) generated always as (precio_total - sena_pagada) stored,

  -- Presupuesto (caso personalizado)
  presupuesto_enviado boolean default false,
  presupuesto_aceptado boolean,
  presupuesto_expires_at timestamp with time zone,

  -- Notas admin
  notas_admin text default '',

  -- Metadata
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_shop_encargos_user_id on shop_encargos(user_id);
create index if not exists idx_shop_encargos_estado on shop_encargos(estado);
create index if not exists idx_shop_encargos_tipo on shop_encargos(tipo);
create index if not exists idx_shop_encargos_created_at on shop_encargos(created_at desc);

-- ============================================================
-- 3. Historial de estados del encargo
-- ============================================================
create table if not exists shop_encargo_status_history (
  id uuid primary key default gen_random_uuid(),
  encargo_id uuid not null references shop_encargos(id) on delete cascade,
  estado_anterior text,
  estado_nuevo text not null,
  notas text default '',
  created_at timestamp with time zone default now()
);

create index if not exists idx_shop_encargo_status_history_encargo on shop_encargo_status_history(encargo_id);

-- ============================================================
-- 4. Pagos del encargo (seña y restante)
-- ============================================================
create table if not exists shop_encargo_payments (
  id uuid primary key default gen_random_uuid(),
  encargo_id uuid not null references shop_encargos(id) on delete cascade,
  mp_payment_id text,
  mp_preference_id text,
  monto numeric(12,2) not null,
  tipo text not null check (tipo in ('sena', 'resto')),
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'aprobado', 'rechazado')),
  metodo_pago text,
  raw_response jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_shop_encargo_payments_encargo on shop_encargo_payments(encargo_id);
create unique index if not exists idx_shop_encargo_payments_mp on shop_encargo_payments(mp_payment_id) where mp_payment_id is not null;

-- ============================================================
-- 5. Trigger para updated_at en shop_encargos
-- ============================================================
create or replace function update_shop_encargos_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_shop_encargos_updated_at on shop_encargos;
create trigger trg_shop_encargos_updated_at
  before update on shop_encargos
  for each row
  execute function update_shop_encargos_updated_at();

-- Trigger para updated_at en shop_encargo_payments
drop trigger if exists trg_shop_encargo_payments_updated_at on shop_encargo_payments;
create trigger trg_shop_encargo_payments_updated_at
  before update on shop_encargo_payments
  for each row
  execute function update_shop_encargos_updated_at();

-- ============================================================
-- 6. RLS (Row Level Security) — lectura pública, escritura autenticada
-- ============================================================
alter table shop_client_profiles enable row level security;
alter table shop_encargos enable row level security;
alter table shop_encargo_status_history enable row level security;
alter table shop_encargo_payments enable row level security;

-- Perfiles: el usuario solo ve/edita el suyo
create policy "Users can view own profile"
  on shop_client_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on shop_client_profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on shop_client_profiles for insert
  with check (auth.uid() = id);

-- Encargos: el usuario ve los suyos
create policy "Users can view own encargos"
  on shop_encargos for select
  using (auth.uid() = user_id);

create policy "Users can insert own encargos"
  on shop_encargos for insert
  with check (auth.uid() = user_id);

-- Historial: el usuario ve el historial de sus encargos
create policy "Users can view own encargo history"
  on shop_encargo_status_history for select
  using (
    encargo_id in (
      select id from shop_encargos where user_id = auth.uid()
    )
  );

-- Pagos: el usuario ve los pagos de sus encargos
create policy "Users can view own encargo payments"
  on shop_encargo_payments for select
  using (
    encargo_id in (
      select id from shop_encargos where user_id = auth.uid()
    )
  );
