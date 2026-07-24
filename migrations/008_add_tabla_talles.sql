-- Agregar columna tabla_talles a shop_products
-- Almacena la URL o el public ID de Cloudinary de la imagen con la guía de talles
ALTER TABLE shop_products
  ADD COLUMN IF NOT EXISTS tabla_talles TEXT DEFAULT NULL;

COMMENT ON COLUMN shop_products.tabla_talles IS 'URL o Cloudinary public ID de la imagen de tabla de talles';
