-- Migration para implementar o sistema de Catálogo Base e Replicação (v2.1.0)
-- Compatível com estruturas existentes (usa ALTER TABLE quando necessário)

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- CATÁLOGO BASE
-- ========================================

-- Garantir colunas na base existente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name='base_products' AND column_name='sku'
  ) THEN
    ALTER TABLE base_products ADD COLUMN sku VARCHAR(64);
  END IF;
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name='base_products' AND column_name='image_url'
  ) THEN
    ALTER TABLE base_products ADD COLUMN image_url TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name='base_products' AND column_name='specifications'
  ) THEN
    ALTER TABLE base_products ADD COLUMN specifications JSONB DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name='base_products' AND column_name='source_url'
  ) THEN
    ALTER TABLE base_products ADD COLUMN source_url TEXT;
  END IF;
  -- Definir NOT NULL e UNIQUE do SKU se possível (preencher vazios antes se necessário)
  BEGIN
    ALTER TABLE base_products ADD CONSTRAINT base_products_sku_key UNIQUE (sku);
  EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN unique_violation THEN NULL; END;
  BEGIN
    ALTER TABLE base_products ALTER COLUMN sku SET NOT NULL;
  EXCEPTION WHEN not_null_violation THEN NULL; WHEN undefined_column THEN NULL; END;
END $$;

-- Tabela de imagens do produto base
CREATE TABLE IF NOT EXISTS base_product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_product_id UUID NOT NULL REFERENCES base_products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  bucket_key TEXT,
  is_cover BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de faixas de preço por quantidade do produto base
CREATE TABLE IF NOT EXISTS base_pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_product_id UUID NOT NULL REFERENCES base_products(id) ON DELETE CASCADE,
  min_qty INTEGER NOT NULL CHECK (min_qty > 0),
  unit_price DECIMAL(10,2),
  discount_pct DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(base_product_id, min_qty)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_base_products_sku ON base_products(sku);
CREATE INDEX IF NOT EXISTS idx_base_products_category ON base_products(category_id);
CREATE INDEX IF NOT EXISTS idx_base_products_status ON base_products(status);

-- ========================================
-- PRODUTOS REPLICADOS POR CLIENTE
-- ========================================

CREATE TABLE IF NOT EXISTS client_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  base_product_id UUID NOT NULL REFERENCES base_products(id),
  name VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  final_sku VARCHAR(64) UNIQUE NOT NULL,
  ean_13 VARCHAR(13) UNIQUE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  stock_quantity INTEGER DEFAULT 0,
  margin_pct DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_product_id UUID NOT NULL REFERENCES client_products(id) ON DELETE CASCADE,
  min_qty INTEGER NOT NULL CHECK (min_qty > 0),
  unit_price DECIMAL(10,2),
  discount_pct DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_product_id, min_qty)
);

CREATE TABLE IF NOT EXISTS client_product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_product_id UUID NOT NULL REFERENCES client_products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  bucket_key TEXT,
  is_cover BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_products_client_id ON client_products(client_id);
CREATE INDEX IF NOT EXISTS idx_client_products_base_product_id ON client_products(base_product_id);
CREATE INDEX IF NOT EXISTS idx_client_products_final_sku ON client_products(final_sku);
CREATE INDEX IF NOT EXISTS idx_client_products_ean_13 ON client_products(ean_13);
CREATE INDEX IF NOT EXISTS idx_client_products_status ON client_products(status);

-- ========================================
-- EAN-13
-- ========================================

CREATE TABLE IF NOT EXISTS ean_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ean_13 VARCHAR(13) UNIQUE NOT NULL,
  client_product_id UUID REFERENCES client_products(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'reserved')),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Função: validar EAN-13
CREATE OR REPLACE FUNCTION validate_ean13(ean VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  checksum INTEGER := 0;
  i INTEGER;
  digit INTEGER;
BEGIN
  IF length(ean) != 13 THEN RETURN FALSE; END IF;
  IF ean !~ '^[0-9]{13}$' THEN RETURN FALSE; END IF;
  FOR i IN 1..12 LOOP
    digit := substring(ean from i for 1)::integer;
    IF i % 2 = 1 THEN checksum := checksum + digit; ELSE checksum := checksum + digit * 3; END IF;
  END LOOP;
  checksum := (10 - (checksum % 10)) % 10;
  RETURN checksum = substring(ean from 13 for 1)::integer;
END;
$$ LANGUAGE plpgsql;

-- Função: gerar EAN-13
CREATE OR REPLACE FUNCTION generate_ean13()
RETURNS VARCHAR AS $$
DECLARE
  ean VARCHAR(12);
  checksum INTEGER := 0;
  i INTEGER;
  digit INTEGER;
BEGIN
  ean := lpad(floor(random() * 1000000000000)::text, 12, '0');
  FOR i IN 1..12 LOOP
    digit := substring(ean from i for 1)::integer;
    IF i % 2 = 1 THEN checksum := checksum + digit; ELSE checksum := checksum + digit * 3; END IF;
  END LOOP;
  checksum := (10 - (checksum % 10)) % 10;
  RETURN ean || checksum::text;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ORÇAMENTOS E COMPRAS
-- ========================================

CREATE TABLE IF NOT EXISTS orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  gestor_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'novo' CHECK (status IN ('novo', 'em_analise', 'aprovado', 'rejeitado', 'convertido')),
  total_amount DECIMAL(10,2) DEFAULT 0,
  admin_notes TEXT,
  gestor_notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orcamento_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  client_product_id UUID NOT NULL REFERENCES client_products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orcamento_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orcamentos_client_id ON orcamentos(client_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_gestor_id ON orcamentos(gestor_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_created_at ON orcamentos(created_at);

-- Pedidos de compra
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id UUID REFERENCES orcamentos(id),
  client_id UUID NOT NULL,
  admin_id UUID NOT NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'criado' CHECK (status IN ('criado', 'aprovado', 'em_producao', 'enviado', 'entregue', 'cancelado')),
  total_amount DECIMAL(10,2) NOT NULL,
  supplier_info JSONB DEFAULT '{}'::jsonb,
  shipping_info JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  client_product_id UUID NOT NULL REFERENCES client_products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_client_id ON purchase_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_number ON purchase_orders(order_number);

-- ========================================
-- AUDITORIA
-- ========================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ========================================
-- FUNÇÕES AUXILIARES E TRIGGERS
-- ========================================

-- Atualizar coluna updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- SKU final do cliente
CREATE OR REPLACE FUNCTION generate_client_sku(base_sku VARCHAR, client_id UUID)
RETURNS VARCHAR AS $$
BEGIN
  RETURN base_sku || '-' || client_id::text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_client_sku()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.final_sku IS NULL OR NEW.final_sku = '' THEN
    SELECT generate_client_sku(bp.sku, NEW.client_id) INTO NEW.final_sku
    FROM base_products bp WHERE bp.id = NEW.base_product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_client_products_set_sku
BEFORE INSERT ON client_products
FOR EACH ROW EXECUTE FUNCTION set_client_sku();

-- EAN-13: gerar automaticamente se não informado e registrar
CREATE OR REPLACE FUNCTION set_ean13()
RETURNS TRIGGER AS $$
DECLARE
  new_ean VARCHAR(13);
BEGIN
  IF NEW.ean_13 IS NULL OR NEW.ean_13 = '' THEN
    LOOP
      new_ean := generate_ean13();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM ean_registry WHERE ean_13 = new_ean);
    END LOOP;
    NEW.ean_13 := new_ean;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_client_products_set_ean
BEFORE INSERT ON client_products
FOR EACH ROW EXECUTE FUNCTION set_ean13();

CREATE OR REPLACE FUNCTION register_ean13()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ean_13 IS NOT NULL AND NEW.ean_13 <> '' THEN
    INSERT INTO ean_registry (ean_13, client_product_id, status)
    VALUES (NEW.ean_13, NEW.id, 'active')
    ON CONFLICT (ean_13) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_client_products_register_ean
AFTER INSERT ON client_products
FOR EACH ROW EXECUTE FUNCTION register_ean13();

-- Triggers de updated_at
DO $$
BEGIN
  BEGIN
    CREATE TRIGGER update_client_products_updated_at BEFORE UPDATE ON client_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON orcamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;


