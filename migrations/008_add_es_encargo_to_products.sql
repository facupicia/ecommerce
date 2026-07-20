-- Migración: distinguir productos de encargo en el catálogo
alter table if exists shop_products
  add column if not exists es_encargo boolean default false;

create index if not exists idx_shop_products_es_encargo
  on shop_products(es_encargo);

comment on column shop_products.es_encargo is
  'true = producto visible solo en el catálogo de encargos, false = catálogo de venta inmediata';
