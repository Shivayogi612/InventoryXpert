-- Add sample items to existing purchase orders
-- This links purchase orders to actual products in your inventory

-- First, let's add items to PO-2024-001 (15 items, $5,420 total)
-- Assuming you have some products in your inventory, we'll use the first few
INSERT INTO purchase_order_items (order_id, product_id, product_name, quantity, unit_price)
SELECT 
  (SELECT id FROM purchase_orders WHERE order_number = 'PO-2024-001' LIMIT 1),
  p.id,
  p.name,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY p.name) = 1 THEN 50  -- First product: 50 units
    WHEN ROW_NUMBER() OVER (ORDER BY p.name) = 2 THEN 30  -- Second product: 30 units
    WHEN ROW_NUMBER() OVER (ORDER BY p.name) = 3 THEN 20  -- Third product: 20 units
    ELSE 10
  END as quantity,
  COALESCE(p.price, 25.00) as unit_price
FROM products p
WHERE p.is_active = true
LIMIT 3
ON CONFLICT DO NOTHING;

-- Add items to PO-2024-002 (8 items, $3,200 total)
INSERT INTO purchase_order_items (order_id, product_id, product_name, quantity, unit_price)
SELECT 
  (SELECT id FROM purchase_orders WHERE order_number = 'PO-2024-002' LIMIT 1),
  p.id,
  p.name,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY p.name) = 1 THEN 40
    WHEN ROW_NUMBER() OVER (ORDER BY p.name) = 2 THEN 25
    ELSE 15
  END as quantity,
  COALESCE(p.price, 30.00) as unit_price
FROM products p
WHERE p.is_active = true
OFFSET 3
LIMIT 2
ON CONFLICT DO NOTHING;

-- Add items to PO-2024-003 (22 items, $8,900 total) - Already delivered
INSERT INTO purchase_order_items (order_id, product_id, product_name, quantity, unit_price)
SELECT 
  (SELECT id FROM purchase_orders WHERE order_number = 'PO-2024-003' LIMIT 1),
  p.id,
  p.name,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY p.name) = 1 THEN 60
    WHEN ROW_NUMBER() OVER (ORDER BY p.name) = 2 THEN 45
    WHEN ROW_NUMBER() OVER (ORDER BY p.name) = 3 THEN 35
    ELSE 20
  END as quantity,
  COALESCE(p.price, 35.00) as unit_price
FROM products p
WHERE p.is_active = true
OFFSET 5
LIMIT 4
ON CONFLICT DO NOTHING;

-- Add items to PO-2024-004 (12 items, $4,100 total) - Delayed
INSERT INTO purchase_order_items (order_id, product_id, product_name, quantity, unit_price)
SELECT 
  (SELECT id FROM purchase_orders WHERE order_number = 'PO-2024-004' LIMIT 1),
  p.id,
  p.name,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY p.name) = 1 THEN 35
    WHEN ROW_NUMBER() OVER (ORDER BY p.name) = 2 THEN 28
    ELSE 18
  END as quantity,
  COALESCE(p.price, 28.00) as unit_price
FROM products p
WHERE p.is_active = true
OFFSET 9
LIMIT 3
ON CONFLICT DO NOTHING;

-- Verify the items were added
SELECT 
  po.order_number,
  po.status,
  COUNT(poi.id) as items_added,
  SUM(poi.quantity * poi.unit_price) as calculated_total
FROM purchase_orders po
LEFT JOIN purchase_order_items poi ON poi.order_id = po.id
WHERE po.order_number LIKE 'PO-2024-%'
GROUP BY po.id, po.order_number, po.status
ORDER BY po.order_number;
