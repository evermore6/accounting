-- 005_create_inventory.sql
-- Create inventory tables with FIFO tracking

CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  item_code VARCHAR(50) UNIQUE NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  unit_of_measure VARCHAR(50) NOT NULL,
  current_quantity DECIMAL(10, 2) DEFAULT 0,
  unit_cost DECIMAL(15, 2) DEFAULT 0,
  total_value DECIMAL(15, 2) DEFAULT 0,
  minimum_stock DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE inventory_movement_type AS ENUM ('purchase', 'usage', 'adjustment');

CREATE TABLE inventory_transactions (
  id SERIAL PRIMARY KEY,
  inventory_id INTEGER REFERENCES inventory(id) NOT NULL,
  transaction_id INTEGER REFERENCES transactions(id),
  movement_type inventory_movement_type NOT NULL,
  movement_date DATE NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_cost DECIMAL(15, 2) NOT NULL,
  total_cost DECIMAL(15, 2) NOT NULL,
  remaining_quantity DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_code ON inventory(item_code);
CREATE INDEX idx_inventory_transactions_item ON inventory_transactions(inventory_id);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(movement_date);
