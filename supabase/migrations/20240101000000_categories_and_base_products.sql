-- Criar tabela de categorias de produtos
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(7),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de produtos-base
CREATE TABLE IF NOT EXISTS base_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES product_categories(id),
  base_price DECIMAL(10,2) DEFAULT 0,
  base_points_cost INTEGER DEFAULT 0,
  image_url TEXT,
  specifications JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de templates de email
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela company_products se não existir (sem foreign key por enquanto)
CREATE TABLE IF NOT EXISTS company_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  points_cost INTEGER DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  company_id UUID,
  category_id UUID REFERENCES product_categories(id),
  base_product_id UUID REFERENCES base_products(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir categorias padrão
INSERT INTO product_categories (name, description, icon, color) VALUES
  ('Vestuário', 'Roupas e acessórios corporativos', 'shirt', '#3B82F6'),
  ('Tecnologia', 'Produtos tecnológicos e gadgets', 'smartphone', '#10B981'),
  ('Escritório', 'Material de escritório e papelaria', 'briefcase', '#F59E0B'),
  ('Bem-estar', 'Produtos para saúde e bem-estar', 'heart', '#EF4444'),
  ('Casa e Decoração', 'Produtos para casa e decoração', 'home', '#8B5CF6'),
  ('Esportes', 'Produtos esportivos e fitness', 'dumbbell', '#06B6D4'),
  ('Alimentação', 'Produtos alimentícios e bebidas', 'coffee', '#84CC16'),
  ('Viagem', 'Produtos para viagem e turismo', 'map-pin', '#F97316')
ON CONFLICT (name) DO NOTHING;

-- Inserir produtos-base padrão
INSERT INTO base_products (name, description, category_id, base_price, base_points_cost, specifications) 
SELECT 
  'Camiseta Corporativa',
  'Camiseta 100% algodão com logo personalizável',
  pc.id,
  25.00,
  250,
  '{"material": "100% Algodão", "tamanhos": ["P", "M", "G", "GG"], "cores": ["Branco", "Preto", "Azul", "Cinza"]}'::jsonb
FROM product_categories pc WHERE pc.name = 'Vestuário'
ON CONFLICT (name) DO NOTHING;

INSERT INTO base_products (name, description, category_id, base_price, base_points_cost, specifications) 
SELECT 
  'Caneca Personalizada',
  'Caneca de cerâmica com logo personalizável',
  pc.id,
  15.00,
  150,
  '{"material": "Cerâmica", "capacidade": "350ml", "cores": ["Branco", "Preto", "Azul"]}'::jsonb
FROM product_categories pc WHERE pc.name = 'Escritório'
ON CONFLICT (name) DO NOTHING;

INSERT INTO base_products (name, description, category_id, base_price, base_points_cost, specifications) 
SELECT 
  'Power Bank',
  'Carregador portátil de 10000mAh',
  pc.id,
  45.00,
  450,
  '{"capacidade": "10000mAh", "entrada": "USB-C, Micro USB", "saida": "USB-A, USB-C", "cores": ["Preto", "Branco", "Azul"]}'::jsonb
FROM product_categories pc WHERE pc.name = 'Tecnologia'
ON CONFLICT (name) DO NOTHING;

INSERT INTO base_products (name, description, category_id, base_price, base_points_cost, specifications) 
SELECT 
  'Garrafa Térmica',
  'Garrafa térmica de aço inox 500ml',
  pc.id,
  35.00,
  350,
  '{"material": "Aco Inox", "capacidade": "500ml", "isolamento": "24h", "cores": ["Prata", "Preto", "Azul"]}'::jsonb
FROM product_categories pc WHERE pc.name = 'Bem-estar'
ON CONFLICT (name) DO NOTHING;

INSERT INTO base_products (name, description, category_id, base_price, base_points_cost, specifications) 
SELECT 
  'Mochila Executiva',
  'Mochila executiva com compartimento para notebook',
  pc.id,
  80.00,
  800,
  '{"material": "Nylon", "compartimentos": "15 inch laptop", "cores": ["Preto", "Cinza", "Azul"]}'::jsonb
FROM product_categories pc WHERE pc.name = 'Escritório'
ON CONFLICT (name) DO NOTHING;

-- Inserir produtos de exemplo (após as categorias serem criadas)
-- Isso será feito no seed.sql

-- Criar triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_base_products_updated_at BEFORE UPDATE ON base_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
