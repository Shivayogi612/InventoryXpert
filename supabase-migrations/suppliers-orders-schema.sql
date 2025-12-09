-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'delayed', 'cancelled')),
  items_count INTEGER DEFAULT 0,
  total_value DECIMAL(12,2) DEFAULT 0,
  order_date DATE DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  actual_delivery DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchase_order_items table (optional - for detailed line items)
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_dates ON purchase_orders(order_date, expected_delivery);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_order ON purchase_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product ON purchase_order_items(product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read purchase_orders"
  ON purchase_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert purchase_orders"
  ON purchase_orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update purchase_orders"
  ON purchase_orders FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete purchase_orders"
  ON purchase_orders FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read purchase_order_items"
  ON purchase_order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert purchase_order_items"
  ON purchase_order_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update purchase_order_items"
  ON purchase_order_items FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete purchase_order_items"
  ON purchase_order_items FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address, rating) VALUES
  ('Belagavi Fresh Supplies', 'Ravi Desai', 'ravi@belagavifresh.com', '+91 831 245 6789', 'Plot 12, Udyambag Industrial Estate, Belagavi, Karnataka', 4.7),
  ('Kittur Components LLP', 'Meera Patil', 'meera@kitturcomponents.in', '+91 831 267 8899', '34 Shivaji Road, Tilakwadi, Belagavi, Karnataka', 4.5),
  ('Gokak Agro Partners', 'Sandeep Kulkarni', 'sandeep@gokakagro.in', '+91 831 223 4455', '5th Cross, Hanuman Nagar, Belagavi, Karnataka', 4.3)
ON CONFLICT DO NOTHING;

-- Insert sample purchase orders
INSERT INTO purchase_orders (order_number, supplier_id, status, items_count, total_value, order_date, expected_delivery) 
SELECT 
  'PO-2024-001',
  (SELECT id FROM suppliers WHERE name = 'Belagavi Fresh Supplies' LIMIT 1),
  'pending',
  15,
  5420.00,
  '2024-12-01',
  '2024-12-10'
WHERE NOT EXISTS (SELECT 1 FROM purchase_orders WHERE order_number = 'PO-2024-001');

INSERT INTO purchase_orders (order_number, supplier_id, status, items_count, total_value, order_date, expected_delivery) 
SELECT 
  'PO-2024-002',
  (SELECT id FROM suppliers WHERE name = 'Kittur Components LLP' LIMIT 1),
  'shipped',
  8,
  3200.00,
  '2024-11-28',
  '2024-12-08'
WHERE NOT EXISTS (SELECT 1 FROM purchase_orders WHERE order_number = 'PO-2024-002');

INSERT INTO purchase_orders (order_number, supplier_id, status, items_count, total_value, order_date, expected_delivery, actual_delivery) 
SELECT 
  'PO-2024-003',
  (SELECT id FROM suppliers WHERE name = 'Belagavi Fresh Supplies' LIMIT 1),
  'delivered',
  22,
  8900.00,
  '2024-11-20',
  '2024-11-30',
  '2024-11-29'
WHERE NOT EXISTS (SELECT 1 FROM purchase_orders WHERE order_number = 'PO-2024-003');

INSERT INTO purchase_orders (order_number, supplier_id, status, items_count, total_value, order_date, expected_delivery) 
SELECT 
  'PO-2024-004',
  (SELECT id FROM suppliers WHERE name = 'Gokak Agro Partners' LIMIT 1),
  'delayed',
  12,
  4100.00,
  '2024-11-25',
  '2024-12-05'
WHERE NOT EXISTS (SELECT 1 FROM purchase_orders WHERE order_number = 'PO-2024-004');
