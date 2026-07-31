-- ============================================================
-- ESQUEMA BASE DE DATOS Y ALMACENAMIENTO SUPABASE PARA KAMALUSO
-- ============================================================

-- 1. Tabla de Productos
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  comparative_price NUMERIC,
  currency TEXT DEFAULT 'UYU',
  category TEXT NOT NULL,
  badge TEXT,
  in_stock BOOLEAN DEFAULT TRUE,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública para clientes
CREATE POLICY "Lectura pública de productos"
  ON public.products
  FOR SELECT
  USING (true);

-- Política de modificación solo para usuarios autenticados
CREATE POLICY "Modificación solo para administradores"
  ON public.products
  FOR ALL
  USING (auth.role() = 'authenticated');

-- 3. Crear Bucket en Supabase Storage para Imágenes
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
CREATE POLICY "Lectura pública de imágenes de producto"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Subida de imágenes solo para administradores"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
