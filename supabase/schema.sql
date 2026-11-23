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


-- ============================================================
-- 4. TABLA DE CLIENTES (CRM / ENVÍOS / NOTAS PRIVADAS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  department TEXT DEFAULT 'Montevideo',
  city TEXT DEFAULT '',
  address TEXT DEFAULT '',
  delivery_type TEXT,
  shipping_company TEXT,
  observations TEXT,
  rut_info TEXT,
  shipping_method_name TEXT,
  payment_method_id TEXT,
  internal_notes TEXT,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers (email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers (phone);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. TABLA DE PEDIDOS / VENTAS (EXCLUSIVA SERVIDOR CON SERVICE ROLE)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_id TEXT,
  customer JSONB NOT NULL DEFAULT '{}'::jsonb,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_price NUMERIC NOT NULL DEFAULT 0,
  final_total NUMERIC NOT NULL DEFAULT 0,
  payment_method_id TEXT DEFAULT 'brou',
  payment_method_name TEXT DEFAULT '',
  shipping_method_name TEXT DEFAULT '',
  shipping_cost NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendiente',
  notes TEXT,
  observations TEXT,
  delivery_type TEXT,
  mp_payment_id TEXT,
  mp_payer_email TEXT,
  mp_payer_name TEXT,
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders (customer_id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
