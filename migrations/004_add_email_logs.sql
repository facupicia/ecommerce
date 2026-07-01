-- Migración: log de emails transaccionales enviados
-- Ejecutar en Supabase SQL Editor

create table if not exists shop_email_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references shop_orders(id) on delete set null,
  tipo text not null check (tipo in ('payment_approved', 'payment_rejected', 'order_shipped', 'order_delivered', 'order_cancelled')),
  to_email text not null,
  subject text not null,
  provider text not null default 'resend',
  provider_id text,
  status text not null check (status in ('sent', 'failed', 'skipped')),
  error text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

create index if not exists idx_shop_email_logs_order_id on shop_email_logs(order_id);
create index if not exists idx_shop_email_logs_created_at on shop_email_logs(created_at desc);
create index if not exists idx_shop_email_logs_tipo on shop_email_logs(tipo);
