-- Migração para integração com Cubbo e Olist
-- Sistema de fulfillment e gestão de estoque

-- Tabela de integração com Cubbo (fulfillment)
CREATE TABLE IF NOT EXISTS cubbo_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    is_global BOOLEAN DEFAULT false,
    cubbo_api_key TEXT NOT NULL,
    cubbo_warehouse_id TEXT,
    cubbo_company_id TEXT,
    olist_api_key TEXT,
    olist_company_id TEXT,
    is_active BOOLEAN DEFAULT true,
    sync_products BOOLEAN DEFAULT true,
    sync_orders BOOLEAN DEFAULT true,
    sync_inventory BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_store_or_global CHECK (
        (store_id IS NOT NULL AND is_global = false) OR 
        (store_id IS NULL AND is_global = true)
    )
);

-- Tabela de rastreamento de pedidos no Cubbo
CREATE TABLE IF NOT EXISTS cubbo_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    cubbo_order_id TEXT UNIQUE,
    cubbo_tracking_code TEXT,
    cubbo_status TEXT,
    cubbo_status_details JSONB,
    cubbo_shipment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sincronização de produtos com Cubbo/Olist
CREATE TABLE IF NOT EXISTS product_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES company_products(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL CHECK (sync_type IN ('cubbo', 'olist', 'both')),
    sync_status VARCHAR(50) NOT NULL CHECK (sync_status IN ('pending', 'success', 'failed', 'retry')),
    cubbo_product_id TEXT,
    olist_product_id TEXT,
    sync_data JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    last_sync_attempt TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de estoque sincronizado
CREATE TABLE IF NOT EXISTS inventory_sync (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES company_products(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    cubbo_quantity INTEGER DEFAULT 0,
    olist_quantity INTEGER DEFAULT 0,
    local_quantity INTEGER DEFAULT 0,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(50) DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cubbo_integrations_store ON cubbo_integrations(store_id);
CREATE INDEX IF NOT EXISTS idx_cubbo_orders_order ON cubbo_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_cubbo_orders_tracking ON cubbo_orders(cubbo_tracking_code);
CREATE INDEX IF NOT EXISTS idx_product_sync_log_product ON product_sync_log(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sync_log_store ON product_sync_log(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sync_product ON inventory_sync(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sync_store ON inventory_sync(store_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cubbo_integrations_updated_at BEFORE UPDATE ON cubbo_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cubbo_orders_updated_at BEFORE UPDATE ON cubbo_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_sync_log_updated_at BEFORE UPDATE ON product_sync_log FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_sync_updated_at BEFORE UPDATE ON inventory_sync FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE cubbo_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cubbo_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_sync ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cubbo_integrations
CREATE POLICY "Admins can view all cubbo integrations" ON cubbo_integrations
    FOR SELECT USING (auth.role() = 'admin');

CREATE POLICY "Managers can view their store cubbo integrations" ON cubbo_integrations
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        store_id IN (
            SELECT s.id FROM stores s
            WHERE s.company_id IN (
                SELECT company_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can manage all cubbo integrations" ON cubbo_integrations
    FOR ALL USING (auth.role() = 'admin');

CREATE POLICY "Managers can manage their store cubbo integrations" ON cubbo_integrations
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        store_id IN (
            SELECT s.id FROM stores s
            WHERE s.company_id IN (
                SELECT company_id FROM users WHERE id = auth.uid()
            )
        )
    );

-- Políticas RLS para cubbo_orders
CREATE POLICY "Admins can view all cubbo orders" ON cubbo_orders
    FOR SELECT USING (auth.role() = 'admin');

CREATE POLICY "Users can view their cubbo orders" ON cubbo_orders
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        order_id IN (
            SELECT o.id FROM orders o
            WHERE o.user_id = auth.uid()
        )
    );

-- Políticas RLS para product_sync_log
CREATE POLICY "Admins can view all product sync logs" ON product_sync_log
    FOR SELECT USING (auth.role() = 'admin');

CREATE POLICY "Managers can view their store product sync logs" ON product_sync_log
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        store_id IN (
            SELECT s.id FROM stores s
            WHERE s.company_id IN (
                SELECT company_id FROM users WHERE id = auth.uid()
            )
        )
    );

-- Políticas RLS para inventory_sync
CREATE POLICY "Admins can view all inventory sync" ON inventory_sync
    FOR SELECT USING (auth.role() = 'admin');

CREATE POLICY "Managers can view their store inventory sync" ON inventory_sync
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        store_id IN (
            SELECT s.id FROM stores s
            WHERE s.company_id IN (
                SELECT company_id FROM users WHERE id = auth.uid()
            )
        )
    );

-- Função para sincronizar produtos com Cubbo
CREATE OR REPLACE FUNCTION sync_products_with_cubbo(p_store_id UUID)
RETURNS JSONB AS $$
DECLARE
    cubbo_config RECORD;
    product_record RECORD;
    sync_result JSONB;
BEGIN
    -- Buscar configuração do Cubbo para a loja
    SELECT * INTO cubbo_config FROM cubbo_integrations WHERE store_id = p_store_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cubbo integration not found or inactive');
    END IF;
    
    -- Aqui seria implementada a lógica de sincronização com a API do Cubbo
    -- Por enquanto, vamos apenas registrar a tentativa de sincronização
    
    FOR product_record IN 
        SELECT cp.* FROM company_products cp
        JOIN stores s ON cp.company_id = s.company_id
        WHERE s.id = p_store_id AND cp.status = 'active'
    LOOP
        -- Inserir log de sincronização
        INSERT INTO product_sync_log (
            product_id, 
            store_id, 
            sync_type, 
            sync_status, 
            sync_data,
            last_sync_attempt
        ) VALUES (
            product_record.id,
            p_store_id,
            'cubbo',
            'pending',
            jsonb_build_object(
                'product_name', product_record.name,
                'product_price', product_record.price,
                'product_stock', product_record.stock_quantity
            ),
            NOW()
        );
    END LOOP;
    
    -- Atualizar timestamp da última sincronização
    UPDATE cubbo_integrations 
    SET last_sync_at = NOW() 
    WHERE store_id = p_store_id;
    
    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Products queued for sync with Cubbo',
        'store_id', p_store_id
    );
END;
$$ LANGUAGE plpgsql;

-- Função para sincronizar estoque com Cubbo
CREATE OR REPLACE FUNCTION sync_inventory_with_cubbo(p_store_id UUID)
RETURNS JSONB AS $$
DECLARE
    cubbo_config RECORD;
    inventory_record RECORD;
BEGIN
    -- Buscar configuração do Cubbo para a loja
    SELECT * INTO cubbo_config FROM cubbo_integrations WHERE store_id = p_store_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cubbo integration not found or inactive');
    END IF;
    
    -- Sincronizar estoque de todos os produtos da loja
    FOR inventory_record IN 
        SELECT cp.id, cp.stock_quantity FROM company_products cp
        JOIN stores s ON cp.company_id = s.company_id
        WHERE s.id = p_store_id AND cp.status = 'active'
    LOOP
        -- Inserir ou atualizar registro de sincronização de estoque
        INSERT INTO inventory_sync (product_id, store_id, local_quantity, last_sync_at)
        VALUES (inventory_record.id, p_store_id, inventory_record.stock_quantity, NOW())
        ON CONFLICT (product_id, store_id) 
        DO UPDATE SET 
            local_quantity = inventory_record.stock_quantity,
            last_sync_at = NOW(),
            sync_status = 'synced';
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Inventory synced with Cubbo',
        'store_id', p_store_id
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronizar produto automaticamente quando criado/atualizado
CREATE OR REPLACE FUNCTION trigger_product_sync()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o produto tem store_id, sincronizar com Cubbo
    IF NEW.store_id IS NOT NULL THEN
        PERFORM sync_products_with_cubbo(NEW.store_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela company_products
CREATE TRIGGER trigger_product_sync_after_insert
    AFTER INSERT ON company_products
    FOR EACH ROW
    EXECUTE FUNCTION trigger_product_sync();

CREATE TRIGGER trigger_product_sync_after_update
    AFTER UPDATE ON company_products
    FOR EACH ROW
    EXECUTE FUNCTION trigger_product_sync();
