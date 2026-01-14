-- Migration 005: Create inventory tables

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL,
    quantity DECIMAL(15, 3) NOT NULL DEFAULT 0,
    unit_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT chk_inventory_quantity CHECK (quantity >= 0),
    CONSTRAINT chk_inventory_cost CHECK (unit_cost >= 0),
    CONSTRAINT chk_inventory_value CHECK (total_value >= 0)
);

-- Create inventory_transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY,
    inventory_id UUID NOT NULL REFERENCES inventory(id),
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('IN', 'OUT')),
    quantity DECIMAL(15, 3) NOT NULL,
    unit_cost DECIMAL(15, 2) NOT NULL,
    total_cost DECIMAL(15, 2) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_inv_txn_quantity CHECK (quantity > 0),
    CONSTRAINT chk_inv_txn_cost CHECK (unit_cost >= 0)
);

-- Create indexes
CREATE INDEX idx_inventory_code ON inventory(item_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_inventory_status ON inventory(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_inventory_txn_inventory ON inventory_transactions(inventory_id);
CREATE INDEX idx_inventory_txn_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inventory_txn_date ON inventory_transactions(created_at);
CREATE INDEX idx_inventory_txn_reference ON inventory_transactions(reference_type, reference_id);

-- Add comments
COMMENT ON TABLE inventory IS 'Inventory items master list';
COMMENT ON TABLE inventory_transactions IS 'Inventory movement transactions (IN/OUT)';
COMMENT ON COLUMN inventory.quantity IS 'Current quantity in stock';
COMMENT ON COLUMN inventory.unit_cost IS 'Weighted average unit cost';
COMMENT ON COLUMN inventory.total_value IS 'Total inventory value (quantity * unit_cost)';
COMMENT ON COLUMN inventory_transactions.transaction_type IS 'IN = receive inventory, OUT = issue inventory';
