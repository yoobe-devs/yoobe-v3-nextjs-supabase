-- Tabelas para o Gestor da Loja

-- Tabela de funcionários
CREATE TABLE employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    status user_role DEFAULT 'user',
    points_balance INTEGER DEFAULT 0,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de produtos da empresa
CREATE TABLE company_products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    points_cost INTEGER DEFAULT 0,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de pedidos da empresa
CREATE TABLE company_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    employee_id UUID REFERENCES employees(id),
    employee_name TEXT NOT NULL,
    employee_email TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    points_used INTEGER DEFAULT 0,
    status order_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de itens dos pedidos da empresa
CREATE TABLE company_order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES company_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES company_products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de configurações da empresa
CREATE TABLE company_config (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#1e40af',
    points_system_enabled BOOLEAN DEFAULT true,
    max_points_per_month INTEGER DEFAULT 1000,
    auto_approve_orders BOOLEAN DEFAULT false,
    notification_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_company_products_company ON company_products(company_id);
CREATE INDEX idx_company_products_category ON company_products(category);
CREATE INDEX idx_company_products_status ON company_products(status);
CREATE INDEX idx_company_orders_employee ON company_orders(employee_id);
CREATE INDEX idx_company_orders_status ON company_orders(status);
CREATE INDEX idx_company_orders_created ON company_orders(created_at);
CREATE INDEX idx_company_order_items_order ON company_order_items(order_id);
CREATE INDEX idx_company_order_items_product ON company_order_items(product_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_products_updated_at BEFORE UPDATE ON company_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_orders_updated_at BEFORE UPDATE ON company_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_config_updated_at BEFORE UPDATE ON company_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sequência para números de pedido da empresa
CREATE SEQUENCE IF NOT EXISTS company_order_sequence START 1;

-- Função para gerar número de pedido da empresa
CREATE OR REPLACE FUNCTION generate_company_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'COMP-ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(CAST(nextval('company_order_sequence') AS TEXT), 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para gerar número de pedido da empresa
CREATE TRIGGER generate_company_order_number BEFORE INSERT ON company_orders FOR EACH ROW EXECUTE FUNCTION generate_company_order_number();

-- Políticas RLS (Row Level Security)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_config ENABLE ROW LEVEL SECURITY;

-- Políticas para employees
CREATE POLICY "Employees can view their own data" ON employees FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Managers can view all employees" ON employees FOR ALL USING (auth.jwt() ->> 'role' = 'manager');

-- Políticas para company_products
CREATE POLICY "Anyone can view company products" ON company_products FOR SELECT USING (true);
CREATE POLICY "Managers can manage company products" ON company_products FOR ALL USING (auth.jwt() ->> 'role' = 'manager');

-- Políticas para company_orders
CREATE POLICY "Employees can view their own orders" ON company_orders FOR SELECT USING (auth.uid()::text = employee_id::text);
CREATE POLICY "Managers can view all orders" ON company_orders FOR ALL USING (auth.jwt() ->> 'role' = 'manager');

-- Políticas para company_order_items
CREATE POLICY "Anyone can view order items" ON company_order_items FOR SELECT USING (true);
CREATE POLICY "Managers can manage order items" ON company_order_items FOR ALL USING (auth.jwt() ->> 'role' = 'manager');

-- Políticas para company_config
CREATE POLICY "Anyone can view company config" ON company_config FOR SELECT USING (true);
CREATE POLICY "Managers can manage company config" ON company_config FOR ALL USING (auth.jwt() ->> 'role' = 'manager');
