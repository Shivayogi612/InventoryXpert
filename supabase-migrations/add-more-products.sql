-- Add 50 more products (25 Household + 25 Food & Beverages) distributed across 3 suppliers
-- Each supplier will get approximately 17 new products

-- ABC Supplies Co. - Household Products (9 items)
INSERT INTO products (sku, name, description, category, brand, unit, price, cost, quantity, reorder_level, max_stock_level, supplier, location, barcode, is_active) VALUES
  ('HS-031', 'Laundry Stain Remover 500ml', 'Powerful stain remover for tough stains', 'Household', 'CleanPro', 'ml', 125.00, 95.00, 75, 15, 220, 'ABC Supplies Co.', 'Store Room A', '3001001001031', true),
  ('HS-032', 'Fabric Conditioner 2L', 'Long-lasting fabric softener', 'Household', 'SoftTouch', 'liter', 280.00, 210.00, 60, 12, 180, 'ABC Supplies Co.', 'Store Room A', '3001001001032', true),
  ('HS-033', 'Carpet Cleaner Spray 750ml', 'Foam carpet cleaning solution', 'Household', 'FloorShine', 'ml', 165.00, 125.00, 55, 11, 160, 'ABC Supplies Co.', 'Store Room A', '3001001001033', true),
  ('HS-034', 'Oven Cleaner 750ml', 'Self-polishing oven cleaning gel', 'Household', 'CleanAll', 'ml', 140.00, 105.00, 65, 13, 190, 'ABC Supplies Co.', 'Store Room A', '3001001001034', true),
  ('HS-035', 'Drain Cleaner 1L', 'Pipe unclogging liquid', 'Household', 'ClearFlow', 'liter', 110.00, 82.00, 80, 16, 240, 'ABC Supplies Co.', 'Store Room A', '3001001001035', true),
  ('HS-036', 'Air Freshener 300ml', 'Long lasting room fragrance', 'Household', 'FreshAir', 'ml', 95.00, 70.00, 110, 22, 320, 'ABC Supplies Co.', 'Store Room A', '3001001001036', true),
  ('HS-037', 'Mosquito Repellent 500ml', 'DEET free mosquito spray', 'Household', 'BugFree', 'ml', 135.00, 100.00, 95, 19, 280, 'ABC Supplies Co.', 'Store Room A', '3001001001037', true),
  ('HS-038', 'Disinfectant Spray 500ml', 'Multi-surface sanitizer', 'Household', 'SanitizePro', 'ml', 120.00, 90.00, 85, 17, 250, 'ABC Supplies Co.', 'Store Room A', '3001001001038', true),
  ('HS-039', 'Laundry Bleach Alternative 1L', 'Color-safe bleaching agent', 'Household', 'CleanPro', 'liter', 155.00, 115.00, 70, 14, 200, 'ABC Supplies Co.', 'Store Room A', '3001001001039', true),

-- ABC Supplies Co. - Food & Beverages (8 items)
  ('FB-001', 'Instant Coffee 200g', 'Premium instant coffee powder', 'Food & Beverages', 'CafeSelect', 'gm', 180.00, 135.00, 120, 24, 350, 'ABC Supplies Co.', 'Store Room D', '3001001002001', true),
  ('FB-002', 'Green Tea Bags 50pc', 'Antioxidant rich green tea', 'Food & Beverages', 'HerbalBlend', 'piece', 125.00, 95.00, 90, 18, 270, 'ABC Supplies Co.', 'Store Room D', '3001001002002', true),
  ('FB-003', 'Black Tea Bags 100pc', 'Classic black tea blend', 'Food & Beverages', 'HerbalBlend', 'piece', 165.00, 125.00, 85, 17, 250, 'ABC Supplies Co.', 'Store Room D', '3001001002003', true),
  ('FB-004', 'Sugar 1kg', 'Refined white sugar', 'Food & Beverages', 'SweetPure', 'kg', 45.00, 32.00, 200, 40, 600, 'ABC Supplies Co.', 'Store Room D', '3001001002004', true),
  ('FB-005', 'Salt 1kg', 'Iodized table salt', 'Food & Beverages', 'TasteRight', 'kg', 25.00, 18.00, 250, 50, 750, 'ABC Supplies Co.', 'Store Room D', '3001001002005', true),
  ('FB-006', 'Cooking Oil 1L', 'Refined sunflower oil', 'Food & Beverages', 'HealthyChoice', 'liter', 140.00, 105.00, 110, 22, 320, 'ABC Supplies Co.', 'Store Room D', '3001001002006', true),
  ('FB-007', 'Rice 5kg', 'Basmati rice premium quality', 'Food & Beverages', 'GrainMaster', 'kg', 280.00, 210.00, 60, 12, 180, 'ABC Supplies Co.', 'Store Room D', '3001001002007', true),
  ('FB-008', 'Pasta 500g', 'Durum wheat pasta', 'Food & Beverages', 'Italiano', 'gm', 65.00, 48.00, 150, 30, 450, 'ABC Supplies Co.', 'Store Room D', '3001001002008', true);

-- Global Parts Ltd. - Household Products (8 items)
INSERT INTO products (sku, name, description, category, brand, unit, price, cost, quantity, reorder_level, max_stock_level, supplier, location, barcode, is_active) VALUES
  ('HS-040', 'Battery AA 4pc', 'Alkaline batteries pack', 'Household', 'PowerPlus', 'piece', 45.00, 32.00, 200, 40, 600, 'Global Parts Ltd.', 'Store Room B', '3001001001040', true),
  ('HS-041', 'LED Bulbs 9W 3pc', 'Energy efficient LED bulbs', 'Household', 'BrightLight', 'piece', 195.00, 145.00, 75, 15, 220, 'Global Parts Ltd.', 'Store Room B', '3001001001041', true),
  ('HS-042', 'Extension Cord 3m', '3-pin extension cord', 'Household', 'SafePlug', 'piece', 220.00, 165.00, 50, 10, 150, 'Global Parts Ltd.', 'Store Room B', '3001001001042', true),
  ('HS-043', 'Adhesive Tape 50m', 'Transparent tape roll', 'Household', 'StickFast', 'meter', 35.00, 25.00, 180, 36, 540, 'Global Parts Ltd.', 'Store Room B', '3001001001043', true),
  ('HS-044', 'Glue Stick 20g', 'Non-toxic glue stick', 'Household', 'BondPro', 'gm', 25.00, 18.00, 160, 32, 480, 'Global Parts Ltd.', 'Store Room B', '3001001001044', true),
  ('HS-045', 'Scissors 8inch', 'Stainless steel scissors', 'Household', 'CutSharp', 'piece', 85.00, 62.00, 90, 18, 270, 'Global Parts Ltd.', 'Store Room B', '3001001001045', true),
  ('HS-046', 'Flashlight 3LED', 'Water resistant flashlight', 'Household', 'BrightBeam', 'piece', 150.00, 110.00, 65, 13, 190, 'Global Parts Ltd.', 'Store Room B', '3001001001046', true),
  ('HS-047', 'Thermos Flask 1L', 'Double wall vacuum flask', 'Household', 'HeatRetain', 'liter', 320.00, 240.00, 40, 8, 120, 'Global Parts Ltd.', 'Store Room B', '3001001001047', true),

-- Global Parts Ltd. - Food & Beverages (9 items)
  ('FB-009', 'Mixed Nuts 500g', 'Assorted dry fruits and nuts', 'Food & Beverages', 'NutriMix', 'gm', 320.00, 240.00, 70, 14, 210, 'Global Parts Ltd.', 'Store Room E', '3001001002009', true),
  ('FB-010', 'Potato Chips 150g', 'Crunchy salted chips', 'Food & Beverages', 'SnackCrunch', 'gm', 35.00, 25.00, 250, 50, 750, 'Global Parts Ltd.', 'Store Room E', '3001001002010', true),
  ('FB-011', 'Chocolate Bar 100g', 'Milk chocolate with almonds', 'Food & Beverages', 'SweetDelight', 'gm', 45.00, 32.00, 200, 40, 600, 'Global Parts Ltd.', 'Store Room E', '3001001002011', true),
  ('FB-012', 'Cookies 200g', 'Butter cookies pack', 'Food & Beverages', 'Crumbly', 'gm', 55.00, 40.00, 180, 36, 540, 'Global Parts Ltd.', 'Store Room E', '3001001002012', true),
  ('FB-013', 'Energy Drink 250ml', 'Caffeinated energy beverage', 'Food & Beverages', 'PowerUp', 'ml', 65.00, 48.00, 150, 30, 450, 'Global Parts Ltd.', 'Store Room E', '3001001002013', true),
  ('FB-014', 'Mineral Water 1L', 'Purified drinking water', 'Food & Beverages', 'AquaPure', 'liter', 25.00, 18.00, 300, 60, 900, 'Global Parts Ltd.', 'Store Room E', '3001001002014', true),
  ('FB-015', 'Orange Juice 1L', '100% pure orange juice', 'Food & Beverages', 'FruitFresh', 'liter', 95.00, 70.00, 120, 24, 360, 'Global Parts Ltd.', 'Store Room E', '3001001002015', true),
  ('FB-016', 'Tomato Ketchup 1kg', 'Spicy tomato ketchup', 'Food & Beverages', 'TastyTop', 'kg', 120.00, 90.00, 90, 18, 270, 'Global Parts Ltd.', 'Store Room E', '3001001002016', true),
  ('FB-017', 'Mayonnaise 500g', 'Creamy eggless mayonnaise', 'Food & Beverages', 'CreamyDelight', 'gm', 85.00, 62.00, 110, 22, 330, 'Global Parts Ltd.', 'Store Room E', '3001001002017', true);

-- Tech Components Inc. - Household Products (8 items)
INSERT INTO products (sku, name, description, category, brand, unit, price, cost, quantity, reorder_level, max_stock_level, supplier, location, barcode, is_active) VALUES
  ('HS-048', 'Candle Set 6pc', 'Scented candles variety pack', 'Household', 'Ambiance', 'piece', 185.00, 140.00, 60, 12, 180, 'Tech Components Inc.', 'Store Room C', '3001001001048', true),
  ('HS-049', 'Matchbox 50stick', 'Safety match sticks', 'Household', 'FireLite', 'piece', 10.00, 7.00, 400, 80, 1200, 'Tech Components Inc.', 'Store Room C', '3001001001049', true),
  ('HS-050', 'Lighter Fluid 100ml', 'Refill for cigarette lighters', 'Household', 'FireLite', 'ml', 45.00, 32.00, 120, 24, 360, 'Tech Components Inc.', 'Store Room C', '3001001001050', true),
  ('HS-051', 'Sewing Kit', 'Complete sewing kit with needles', 'Household', 'StitchFix', 'piece', 65.00, 48.00, 100, 20, 300, 'Tech Components Inc.', 'Store Room C', '3001001001051', true),
  ('HS-052', 'First Aid Kit', 'Basic medical supplies kit', 'Household', 'HealthGuard', 'piece', 250.00, 185.00, 45, 9, 135, 'Tech Components Inc.', 'Store Room C', '3001001001052', true),
  ('HS-053', 'Tool Box Set', 'Basic household tool kit', 'Household', 'FixIt', 'piece', 450.00, 335.00, 30, 6, 90, 'Tech Components Inc.', 'Store Room C', '3001001001053', true),
  ('HS-054', 'Measuring Tape 5m', 'Flexible measuring tape', 'Household', 'MeasurePro', 'meter', 75.00, 55.00, 80, 16, 240, 'Tech Components Inc.', 'Store Room C', '3001001001054', true),
  ('HS-055', 'Rubber Gloves Pair', 'Durable rubber gloves', 'Household', 'ProtectWear', 'pair', 55.00, 40.00, 140, 28, 420, 'Tech Components Inc.', 'Store Room C', '3001001001055', true),

-- Tech Components Inc. - Food & Beverages (8 items)
  ('FB-018', 'Instant Noodles 70g', 'Spicy flavor noodles', 'Food & Beverages', 'QuickMeal', 'gm', 20.00, 15.00, 300, 60, 900, 'Tech Components Inc.', 'Store Room F', '3001001002018', true),
  ('FB-019', 'Popcorn 200g', 'Microwave popcorn', 'Food & Beverages', 'MovieTime', 'gm', 40.00, 30.00, 160, 32, 480, 'Tech Components Inc.', 'Store Room F', '3001001002019', true),
  ('FB-020', 'Granola Bars 6pc', 'Oat and honey granola bars', 'Food & Beverages', 'EnergyBoost', 'piece', 95.00, 70.00, 130, 26, 390, 'Tech Components Inc.', 'Store Room F', '3001001002020', true),
  ('FB-021', 'Protein Shake 500g', 'Vanilla flavored protein powder', 'Food & Beverages', 'MuscleFuel', 'gm', 420.00, 315.00, 50, 10, 150, 'Tech Components Inc.', 'Store Room F', '3001001002021', true),
  ('FB-022', 'Sports Drink 500ml', 'Electrolyte replenishment drink', 'Food & Beverages', 'HydroBoost', 'ml', 55.00, 40.00, 170, 34, 510, 'Tech Components Inc.', 'Store Room F', '3001001002022', true),
  ('FB-023', 'Coconut Water 1L', 'Natural coconut water', 'Food & Beverages', 'NaturePure', 'liter', 85.00, 62.00, 110, 22, 330, 'Tech Components Inc.', 'Store Room F', '3001001002023', true),
  ('FB-024', 'Honey 500g', 'Pure forest honey', 'Food & Beverages', 'SweetNature', 'gm', 165.00, 125.00, 75, 15, 220, 'Tech Components Inc.', 'Store Room F', '3001001002024', true),
  ('FB-025', 'Jam 500g', 'Mixed fruit jam', 'Food & Beverages', 'FruitSpread', 'gm', 110.00, 82.00, 95, 19, 280, 'Tech Components Inc.', 'Store Room F', '3001001002025', true)
ON CONFLICT (sku) DO NOTHING;

-- Verify the new products were added
SELECT 
  COUNT(*) as total_new_products,
  category,
  COUNT(*) as products_per_category
FROM products
WHERE sku LIKE 'HS-03%' OR sku LIKE 'FB-%'
GROUP BY category
ORDER BY category;

-- Show all new products with details
SELECT sku, name, category, price, quantity, supplier, location
FROM products
WHERE sku LIKE 'HS-03%' OR sku LIKE 'FB-%'
ORDER BY category, supplier, sku;