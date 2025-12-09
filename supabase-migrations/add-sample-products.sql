-- Add 30 household products distributed across 3 different suppliers
-- Each supplier has unique products they specialize in

-- ABC Supplies Co. - Cleaning & Laundry Products (10 items)
INSERT INTO products (sku, name, description, category, brand, unit, price, cost, quantity, reorder_level, max_stock_level, supplier, location, barcode, is_active) VALUES
  ('HS-001', 'Detergent Powder 1kg', 'Premium washing powder', 'Household', 'CleanPro', 'kg', 180.00, 140.00, 95, 20, 280, 'ABC Supplies Co.', 'Store Room A', '3001001001001', true),
  ('HS-002', 'Liquid Detergent 2L', 'Concentrated liquid detergent', 'Household', 'CleanPro', 'liter', 320.00, 250.00, 60, 15, 180, 'ABC Supplies Co.', 'Store Room A', '3001001001002', true),
  ('HS-003', 'Dishwash Liquid 500ml', 'Lemon fresh dishwashing gel', 'Household', 'CleanDish', 'ml', 95.00, 72.00, 105, 23, 300, 'ABC Supplies Co.', 'Store Room A', '3001001001003', true),
  ('HS-004', 'Dishwash Bar 200g', 'Dishwashing bar soap', 'Household', 'CleanDish', 'gm', 35.00, 25.00, 150, 35, 400, 'ABC Supplies Co.', 'Store Room A', '3001001001004', true),
  ('HS-005', 'Floor Cleaner 1L', 'Disinfectant floor cleaner', 'Household', 'FloorShine', 'liter', 140.00, 105.00, 80, 18, 240, 'ABC Supplies Co.', 'Store Room A', '3001001001005', true),
  ('HS-006', 'Toilet Cleaner 500ml', 'Powerful toilet bowl cleaner', 'Household', 'FreshBowl', 'ml', 110.00, 85.00, 90, 20, 260, 'ABC Supplies Co.', 'Store Room A', '3001001001006', true),
  ('HS-007', 'Glass Cleaner 500ml', 'Streak-free glass cleaner', 'Household', 'ClearView', 'ml', 85.00, 65.00, 70, 16, 200, 'ABC Supplies Co.', 'Store Room A', '3001001001007', true),
  ('HS-008', 'Fabric Softener 1L', 'Clothes softener conditioner', 'Household', 'SoftTouch', 'liter', 160.00, 125.00, 75, 17, 220, 'ABC Supplies Co.', 'Store Room A', '3001001001008', true),
  ('HS-009', 'Bleach 500ml', 'Whitening bleach solution', 'Household', 'WhitePro', 'ml', 75.00, 55.00, 85, 19, 250, 'ABC Supplies Co.', 'Store Room A', '3001001001009', true),
  ('HS-010', 'All Purpose Cleaner 750ml', 'Multi-surface cleaner spray', 'Household', 'CleanAll', 'ml', 125.00, 95.00, 65, 15, 190, 'ABC Supplies Co.', 'Store Room A', '3001001001010', true),

-- Global Parts Ltd. - Personal Care & Hygiene (10 items)
  ('HS-011', 'Soap Bar 125g', 'Moisturizing bathing soap pack of 4', 'Household', 'FreshBath', 'piece', 80.00, 60.00, 150, 30, 400, 'Global Parts Ltd.', 'Store Room B', '3001001001011', true),
  ('HS-012', 'Hand Wash 250ml', 'Antibacterial liquid hand wash', 'Household', 'SafeHands', 'ml', 95.00, 72.00, 110, 24, 320, 'Global Parts Ltd.', 'Store Room B', '3001001001012', true),
  ('HS-013', 'Shampoo 400ml', 'Anti-dandruff hair shampoo', 'Household', 'HairCare', 'ml', 250.00, 190.00, 75, 18, 220, 'Global Parts Ltd.', 'Store Room B', '3001001001013', true),
  ('HS-014', 'Conditioner 400ml', 'Hair conditioner cream', 'Household', 'HairCare', 'ml', 280.00, 215.00, 65, 16, 200, 'Global Parts Ltd.', 'Store Room B', '3001001001014', true),
  ('HS-015', 'Toothpaste 200g', 'Whitening dental toothpaste', 'Household', 'SmileBright', 'gm', 95.00, 70.00, 110, 25, 320, 'Global Parts Ltd.', 'Store Room B', '3001001001015', true),
  ('HS-016', 'Toothbrush Pack', 'Soft bristle toothbrush pack of 2', 'Household', 'SmileBright', 'piece', 60.00, 45.00, 130, 28, 360, 'Global Parts Ltd.', 'Store Room B', '3001001001016', true),
  ('HS-017', 'Face Wash 100ml', 'Oil control face wash gel', 'Household', 'GlowFace', 'ml', 145.00, 110.00, 85, 19, 250, 'Global Parts Ltd.', 'Store Room B', '3001001001017', true),
  ('HS-018', 'Body Lotion 200ml', 'Moisturizing body lotion', 'Household', 'SoftSkin', 'ml', 185.00, 140.00, 70, 17, 210, 'Global Parts Ltd.', 'Store Room B', '3001001001018', true),
  ('HS-019', 'Talcum Powder 200g', 'Refreshing talcum powder', 'Household', 'FreshDay', 'gm', 110.00, 85.00, 95, 21, 280, 'Global Parts Ltd.', 'Store Room B', '3001001001019', true),
  ('HS-020', 'Shaving Cream 200g', 'Smooth shaving foam cream', 'Household', 'SmoothShave', 'gm', 135.00, 105.00, 80, 18, 240, 'Global Parts Ltd.', 'Store Room B', '3001001001020', true),

-- Tech Components Inc. - Paper Products & Disposables (10 items)
  ('HS-021', 'Tissue Paper Roll', 'Soft toilet tissue pack of 4', 'Household', 'SoftTouch', 'piece', 110.00, 85.00, 130, 28, 360, 'Tech Components Inc.', 'Store Room C', '3001001001021', true),
  ('HS-022', 'Kitchen Towel Roll', 'Absorbent paper towel pack of 2', 'Household', 'QuickDry', 'piece', 85.00, 65.00, 100, 22, 300, 'Tech Components Inc.', 'Store Room C', '3001001001022', true),
  ('HS-023', 'Napkins Pack 100', 'Soft paper napkins', 'Household', 'SoftWipe', 'piece', 45.00, 32.00, 140, 30, 400, 'Tech Components Inc.', 'Store Room C', '3001001001023', true),
  ('HS-024', 'Garbage Bags Large', 'Heavy duty trash bags pack of 30', 'Household', 'StrongBag', 'piece', 120.00, 90.00, 90, 20, 270, 'Tech Components Inc.', 'Store Room C', '3001001001024', true),
  ('HS-025', 'Garbage Bags Small', 'Kitchen waste bags pack of 50', 'Household', 'StrongBag', 'piece', 75.00, 55.00, 110, 24, 330, 'Tech Components Inc.', 'Store Room C', '3001001001025', true),
  ('HS-026', 'Aluminum Foil Roll', 'Food grade aluminum foil 10m', 'Household', 'WrapIt', 'piece', 95.00, 72.00, 85, 19, 250, 'Tech Components Inc.', 'Store Room C', '3001001001026', true),
  ('HS-027', 'Cling Film Roll', 'Food wrap cling film 30m', 'Household', 'WrapIt', 'piece', 65.00, 48.00, 95, 21, 280, 'Tech Components Inc.', 'Store Room C', '3001001001027', true),
  ('HS-028', 'Disposable Plates 50pc', 'Paper plates pack', 'Household', 'PartyTime', 'piece', 85.00, 65.00, 75, 17, 220, 'Tech Components Inc.', 'Store Room C', '3001001001028', true),
  ('HS-029', 'Disposable Cups 100pc', 'Paper cups pack', 'Household', 'PartyTime', 'piece', 95.00, 72.00, 80, 18, 240, 'Tech Components Inc.', 'Store Room C', '3001001001029', true),
  ('HS-030', 'Wet Wipes Pack 80', 'Antibacterial wet wipes', 'Household', 'CleanWipe', 'piece', 105.00, 80.00, 100, 22, 300, 'Tech Components Inc.', 'Store Room C', '3001001001030', true)
ON CONFLICT (sku) DO NOTHING;

-- Verify the products were added
SELECT 
  COUNT(*) as total_products,
  supplier,
  COUNT(*) as products_per_supplier
FROM products
WHERE sku LIKE 'HS-%'
GROUP BY supplier
ORDER BY supplier;

-- Show products by supplier
SELECT supplier, COUNT(*) as count, 
  STRING_AGG(name, ', ' ORDER BY sku) as product_names
FROM products
WHERE sku LIKE 'HS-%'
GROUP BY supplier
ORDER BY supplier;

-- Show all products with details
SELECT sku, name, price, quantity, supplier, location
FROM products
WHERE sku LIKE 'HS-%'
ORDER BY supplier, sku;
