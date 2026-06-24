-- Índices para acelerar el listado, búsqueda y filtros de productos en el admin/tienda.
-- Ejecutar en Supabase SQL Editor.

-- Extensión necesaria para índices trigram (gin_trgm_ops)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_shop_products_slug ON shop_products(slug);
CREATE INDEX IF NOT EXISTS idx_shop_products_publicado ON shop_products(publicado);
CREATE INDEX IF NOT EXISTS idx_shop_products_created_at ON shop_products(created_at DESC);

-- Índices de búsqueda texto (ilike) usados en el buscador del admin
CREATE INDEX IF NOT EXISTS idx_shop_products_nombre_gin ON shop_products USING gin(nombre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_shop_products_categoria_gin ON shop_products USING gin(categoria gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_shop_products_marca_gin ON shop_products USING gin(marca gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_shop_products_indumentaria_gin ON shop_products USING gin(indumentaria gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_shop_products_cssbuy_oid ON shop_products(cssbuy_oid);
