// Script para ejecutar en Supabase SQL Editor
// Copia y pega este contenido en el SQL Editor de tu proyecto Supabase

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  pin TEXT,
  role TEXT DEFAULT 'entrepreneur',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Negocios
CREATE TABLE IF NOT EXISTS businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  phone TEXT,
  location TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Ventas
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  location TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Catálogos de Métodos de Pago
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Ubicaciones
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para acceso temporal (TODO: Refinar para producción)
CREATE POLICY "Permitir todo usuarios" ON users FOR ALL USING (true);
CREATE POLICY "Permitir todo ventas" ON sales FOR ALL USING (true);
CREATE POLICY "Permitir todo métodos pago" ON payment_methods FOR ALL USING (true);
CREATE POLICY "Permitir todo ubicaciones" ON locations FOR ALL USING (true);
CREATE POLICY "Permitir todo negocios" ON businesses FOR ALL USING (true);

-- Insertar datos de ejemplo
INSERT INTO payment_methods (name, description) VALUES
  ('Efectivo', 'Pago en efectivo'),
  ('QR', 'Transferencia mediante código QR'),
  ('Transferencia', 'Transferencia bancaria'),
  ('Tarjeta', 'Pago con tarjeta de débito/crédito')
ON CONFLICT DO NOTHING;

INSERT INTO locations (name, description) VALUES
  ('Tienda', 'Venta en tienda física'),
  ('Feria', 'Venta en feria o evento'),
  ('Delivery', 'Venta con entrega a domicilio'),
  ('En línea', 'Venta en línea/redes sociales')
ON CONFLICT DO NOTHING;

-- Crear índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_user_created ON sales(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at);

