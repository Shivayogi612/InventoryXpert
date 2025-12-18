-- Insert 80+ sample products across different categories and suppliers
-- Each supplier will get approximately 27-28 products

-- ABC Supplies Co. - Household Products (14 items)
INSERT INTO products (sku, name, description, category, brand, unit, price, cost, quantity, reorder_level, max_stock_level, supplier, location, barcode, is_active) VALUES
  ('ABC-HS-001', 'Detergent Powder 1kg', 'Premium washing powder', 'Household', 'CleanPro', 'kg', 180.00, 140.00, 95, 20, 280, 'ABC Supplies Co.', 'Store Room A', '3001001001101', true),
  ('ABC-HS-002', 'Liquid Detergent 2L', 'Concentrated liquid detergent', 'Household', 'CleanPro', 'liter', 320.00, 250.00, 60, 15, 180, 'ABC Supplies Co.', 'Store Room A', '3001001001102', true),
  ('ABC-HS-003', 'Dishwash Liquid 500ml', 'Lemon fresh dishwashing gel', 'Household', 'CleanDish', 'ml', 95.00, 72.00, 105, 23, 300, 'ABC Supplies Co.', 'Store Room A', '3001001001103', true),
  ('ABC-HS-004', 'Dishwash Bar 200g', 'Dishwashing bar soap', 'Household', 'CleanDish', 'gm', 35.00, 25.00, 150, 35, 400, 'ABC Supplies Co.', 'Store Room A', '3001001001104', true),
  ('ABC-HS-005', 'Floor Cleaner 1L', 'Disinfectant floor cleaner', 'Household', 'FloorShine', 'liter', 140.00, 105.00, 80, 18, 240, 'ABC Supplies Co.', 'Store Room A', '3001001001105', true),
  ('ABC-HS-006', 'Toilet Cleaner 500ml', 'Powerful toilet bowl cleaner', 'Household', 'FreshBowl', 'ml', 110.00, 85.00, 90, 20, 260, 'ABC Supplies Co.', 'Store Room A', '3001001001106', true),
  ('ABC-HS-007', 'Glass Cleaner 500ml', 'Streak-free glass cleaner', 'Household', 'ClearView', 'ml', 85.00, 65.00, 70, 16, 200, 'ABC Supplies Co.', 'Store Room A', '3001001001107', true),
  ('ABC-HS-008', 'Fabric Softener 1L', 'Clothes softener conditioner', 'Household', 'SoftTouch', 'liter', 160.00, 125.00, 75, 17, 220, 'ABC Supplies Co.', 'Store Room A', '3001001001108', true),
  ('ABC-HS-009', 'Bleach 500ml', 'Whitening bleach solution', 'Household', 'WhitePro', 'ml', 75.00, 55.00, 85, 19, 250, 'ABC Supplies Co.', 'Store Room A', '3001001001109', true),
  ('ABC-HS-010', 'All Purpose Cleaner 750ml', 'Multi-surface cleaner spray', 'Household', 'CleanAll', 'ml', 125.00, 95.00, 65, 15, 190, 'ABC Supplies Co.', 'Store Room A', '3001001001110', true),
  ('ABC-HS-031', 'Laundry Stain Remover 500ml', 'Powerful stain remover for tough stains', 'Household', 'CleanPro', 'ml', 125.00, 95.00, 75, 15, 220, 'ABC Supplies Co.', 'Store Room A', '3001001001131', true),
  ('ABC-HS-032', 'Fabric Conditioner 2L', 'Long-lasting fabric softener', 'Household', 'SoftTouch', 'liter', 280.00, 210.00, 60, 12, 180, 'ABC Supplies Co.', 'Store Room A', '3001001001132', true),
  ('ABC-HS-033', 'Carpet Cleaner Spray 750ml', 'Foam carpet cleaning solution', 'Household', 'FloorShine', 'ml', 165.00, 125.00, 55, 11, 160, 'ABC Supplies Co.', 'Store Room A', '3001001001133', true),
  ('ABC-HS-034', 'Oven Cleaner 750ml', 'Self-polishing oven cleaning gel', 'Household', 'CleanAll', 'ml', 140.00, 105.00, 65, 13, 190, 'ABC Supplies Co.', 'Store Room A', '3001001001134', true);

-- ABC Supplies Co. - Food & Beverages (14 items)
INSERT INTO products (sku, name, description, category, brand, unit, price, cost, quantity, reorder_level, max_stock_level, supplier, location, barcode, is_active) VALUES
  ('ABC-FB-001', 'Instant Coffee 200g', 'Premium instant coffee powder', 'Food & Beverages', 'CafeSelect', 'gm', 180.00, 135.00, 120, 24, 350, 'ABC Supplies Co.', 'Store Room D', '3001001002101', true),
  ('ABC-FB-002', 'Green Tea Bags 50pc', 'Antioxidant rich green tea', 'Food & Beverages', 'HerbalBlend', 'piece', 125.00, 95.00, 90, 18, 270, 'ABC Supplies Co.', 'Store Room D', '3001001002102', true),
  ('ABC-FB-003', 'Black Tea Bags 100pc', 'Classic black tea blend', 'Food & Beverages', 'HerbalBlend', 'piece', 165.00, 125.00, 85, 17, 250, 'ABC Supplies Co.', 'Store Room D', '3001001002103', true),
  ('ABC-FB-004', 'Sugar 1kg', 'Refined white sugar', 'Food & Beverages', 'SweetPure', 'kg', 45.00, 32.00, 200, 40, 600, 'ABC Supplies Co.', 'Store Room D', '3001001002104', true),
  ('ABC-FB-005', 'Salt 1kg', 'Iodized table salt', 'Food & Beverages', 'TasteRight', 'kg', 25.00, 18.00, 250, 50, 750, 'ABC Supplies Co.', 'Store Room D', '3001001002105', true),
  ('ABC-FB-006', 'Cooking Oil 1L', 'Refined sunflower oil', 'Food & Beverages', 'HealthyChoice', 'liter', 140.00, 105.00, 110, 22, 320, 'ABC Supplies Co.', 'Store Room D', '3001001002106', true),
  ('ABC-FB-007', 'Rice 5kg', 'Basmati rice premium quality', 'Food & Beverages', 'GrainMaster', 'kg', 280.00, 210.00, 60, 12, 180, 'ABC Supplies Co.', 'Store Room D', '3001001002107', true),
  ('ABC-FB-008', 'Pasta 500g', 'Durum wheat pasta', 'Food & Beverages', 'Italiano', 'gm', 65.00, 48.00, 150, 30, 450, 'ABC Supplies Co.', 'Store Room D', '3001001002108', true),
  ('ABC-FB-009', 'Mixed Nuts 500g', 'Assorted dry fruits and nuts', 'Food & Beverages', 'NutriMix', 'gm', 320.00, 240.00, 70, 14, 210, 'ABC Supplies Co.', 'Store Room D', '3001001002109', true),
  ('ABC-FB-010', 'Potato Chips 150g', 'Crunchy salted chips', 'Food & Beverages', 'SnackCrunch', 'gm', 35.00, 25.00, 250, 50, 750, 'ABC Supplies Co.', 'Store Room D', '3001001002110', true),
  ('ABC-FB-011', 'Chocolate Bar 100g', 'Milk chocolate with almonds', 'Food & Beverages', 'SweetDelight', 'gm', 45.00, 32.00, 200, 40, 600, 'ABC Supplies Co.', 'Store Room D', '3001001002111', true),
  ('ABC-FB-012', 'Cookies 200g', 'Butter cookies pack', 'Food & Beverages', 'Crumbly', 'gm', 55.00, 40.00, 180, 36, 540, 'ABC Supplies Co.', 'Store Room D', '3001001002112', true),
  ('ABC-FB-013', 'Energy Drink 250ml', 'Caffeinated energy beverage', 'Food & Beverages', 'PowerUp', 'ml', 65.00, 48.00, 150, 30, 450, 'ABC Supplies Co.', 'Store Room D', '3001001002113', true),
  ('ABC-FB-014', 'Mineral Water 1L', 'Purified drinking water', 'Food & Beverages', 'AquaPure', 'liter', 25.00, 18.00, 300, 60, 900, 'ABC Supplies Co.', 'Store Room D', '3001001002114', true);

-- Global Parts Ltd. - Household Products (14 items)
INSERT INTO products (sku, name, description, category, brand, unit, price, cost, quantity, reorder_level, max_stock_level, supplier, location, barcode, is_active) VALUES
  ('GPL-HS-011', 'Soap Bar 125g', 'Moisturizing bathing soap pack of 4', 'Household', 'FreshBath', 'piece', 80.00, 60.00, 150, 30, 400, 'Global Parts Ltd.', 'Store Room B', '3001001001211', true),
  ('GPL-HS-012', 'Hand Wash 250ml', 'Antibacterial liquid hand wash', 'Household', 'SafeHands', 'ml', 95.00, 72.00, 110, 24, 320, 'Global Parts Ltd.', 'Store Room B', '3001001001212', true),
  ('GPL-HS-013', 'Shampoo 400ml', 'Anti-dandruff hair shampoo', 'Household', 'HairCare', 'ml', 250.00, 190.00, 75, 18, 220, 'Global Parts Ltd.', 'Store Room B', '3001001001213', true),
  ('GPL-HS-014', 'Conditioner 400ml', 'Hair conditioner cream', 'Household', 'HairCare', 'ml', 280.00, 215.00, 65, 16, 200, 'Global Parts Ltd.', 'Store Room B', '3001001001214', true),
  ('GPL-HS-015', 'Toothpaste 200g', 'Whitening dental toothpaste', 'Household', 'SmileBright', 'gm', 95.00, 70.00, 110, 25, 320, 'Global Parts Ltd.', 'Store Room B', '3001001001215', true),
  ('GPL-HS-016', 'Toothbrush Pack', 'Soft bristle toothbrush pack of 2', 'Household', 'SmileBright', 'piece', 60.00, 45.00, 130, 28, 360, 'Global Parts Ltd.', 'Store Room B', '3001001001216', true),
  ('GPL-HS-017', 'Face Wash 100ml', 'Oil control face wash gel', 'Household', 'GlowFace', 'ml', 145.00, 110.00, 85, 19, 250, 'Global Parts Ltd.', 'Store Room B', '3001001001217', true),
  ('GPL-HS-018', 'Body Lotion 200ml', 'Moisturizing body lotion', 'Household', 'SoftSkin', 'ml', 185.00, 140.00, 70, 17, 210, 'Global Parts Ltd.', 'Store Room B', '3001001001218', true),
  ('GPL-HS-019', 'Talcum Powder 200g', 'Refreshing talcum powder', 'Household', 'FreshDay', 'gm', 110.00, 85.00, 95, 21, 280, 'Global Parts Ltd.', 'Store Room B', '3001001001219', true),
  ('GPL-HS-020', 'Shaving Cream 200g', 'Smooth shaving foam cream', 'Household', 'SmoothShave', 'gm', 135.00, 105.00, 80, 18, 240, 'Global Parts Ltd.', 'Store Room B', '3001001001220', true),
  ('GPL-HS-040', 'Battery AA 4pc', 'Alkaline batteries pack', 'Household', 'PowerPlus', 'piece', 45.00, 32.00, 200, 40, 600, 'Global Parts Ltd.', 'Store Room B', '3001001001240', true),
  ('GPL-HS-041', 'LED Bulbs 9W 3pc', 'Energy efficient LED bulbs', 'Household', 'BrightLight', 'piece', 195.00, 145.00, 75, 15, 220, 'Global Parts Ltd.', 'Store Room B', '3001001001241', true),
  ('GPL-HS-042', 'Extension Cord 3m', '3-pin extension cord', 'Household', 'SafePlug', 'piece', 220.00, 165.00, 50, 10, 150, 'Global Parts Ltd.', 'Store Room B', '3001001001242', true),
  ('GPL-HS-043', 'Adhesive Tape 50m', 'Transparent tape roll', 'Household', 'StickFast', 'meter', 35.00, 25.00, 180, 36, 540, 'Global Parts Ltd.', 'Store Room B', '3001001001243', true);

-- Global Parts Ltd. - Food & Beverages (14 items)
INSERT INTO products (sku, name, description, category, brand, unit, price, cost, quantity, reorder_level, max_stock_level, supplier, location, barcode, is_active) VALUES
  ('GPL-FB-015', 'Orange Juice 1L', '100% pure orange juice', 'Food & Beverages', 'FruitFresh', 'liter', 95.00, 70.00, 120, 24, 360, 'Global Parts Ltd.', 'Store Room E', '3001001002215', true),
  ('GPL-FB-016', 'Tomato Ketchup 1kg', 'Spicy tomato ketchup', 'Food & Beverages', 'TastyTop', 'kg', 120.00, 90.00, 90, 18, 270, 'Global Parts Ltd.', 'Store Room E', '3001001002216', true),
  ('GPL-FB-017', 'Mayonnaise 500g', 'Creamy eggless mayonnaise', 'Food & Beverages', 'CreamyDelight', 'gm', 85.00, 62.00, 110, 22, 330, 'Global Parts Ltd.', 'Store Room E', '3001001002217', true),
  ('GPL-FB-018', 'Instant Noodles 70g', 'Spicy flavor noodles', 'Food & Beverages', 'QuickMeal', 'gm', 20.00, 15.00, 300, 60, 900, 'Global Parts Ltd.', 'Store Room E', '3001001002218', true),
  ('GPL-FB-019', 'Popcorn 200g', 'Microwave popcorn', 'Food & Beverages', 'MovieTime', 'gm', 40.00, 30.00, 160, 32, 480, 'Global Parts Ltd.', 'Store Room E', '3001001002219', true),
  ('GPL-FB-020', 'Granola Bars 6pc', 'Oat and honey granola bars', 'Food & Beverages', 'EnergyBoost', 'piece', 95.00, 70.00, 130, 26, 390, 'Global Parts Ltd.', 'Store Room E', '3001001002220', true),
  ('GPL-FB-021', 'Protein Shake 500g', 'Vanilla flavored protein powder', 'Food & Beverages', 'MuscleFuel', 'gm', 420.00, 315.00, 50, 10, 150, 'Global Parts Ltd.', 'Store Room E', '3001001002221', true),
  ('GPL-FB-022', 'Sports Drink 500ml', 'Electrolyte replenishment drink', 'Food & Beverages', 'HydroBoost', 'ml', 55.00, 40.00, 170, 34, 510, 'Global Parts Ltd.', 'Store Room E', '3001001002222', true),
  ('GPL-FB-023', 'Coconut Water 1L', 'Natural coconut water', 'Food & Beverages', 'NaturePure', 'liter', 85.00, 62.00, 110, 22, 330, 'Global Parts Ltd.', 'Store Room E', '3001001002223', true),
  ('GPL-FB-024', 'Honey 500g', 'Pure forest honey', 'Food & Beverages', 'SweetNature', 'gm', 165.00, 125.00, 75, 15, 220, 'Global Parts Ltd.', 'Store Room E', '3001001002224', true),
  ('GPL-FB-025', 'Jam 500g', 'Mixed fruit jam', 'Food & Beverages', 'FruitSpread', 'gm', 110.00, 82.00, 95, 19, 280, 'Global Parts Ltd.', 'Store Room E', '3001001002225', true),
  ('GPL-FB-026', 'Peanut Butter 500g', 'Creamy roasted peanut butter', 'Food & Beverages', 'NuttyDelight', 'gm', 145.00, 95.00, 85, 17, 250, 'Global Parts Ltd.', 'Store Room E', '3001001002226', true),
  ('GPL-FB-027', 'Olive Oil 500ml', 'Extra virgin olive oil', 'Food & Beverages', 'Mediterra', 'ml', 185.00, 125.00, 70, 14, 210, 'Global Parts Ltd.', 'Store Room E', '3001001002227', true),
  ('GPL-FB-028', 'Soy Sauce 500ml', 'Premium soy sauce', 'Food & Beverages', 'AsianFlavor', 'ml', 65.00, 35.00, 120, 24, 360, 'Global Parts Ltd.', 'Store Room E', '3001001002228', true);

-- Tech Components Inc. - Household Products (14 items)
INSERT INTO products (sku, name, description, category, brand, unit, price, cost, quantity, reorder_level, max_stock_level, supplier, location, barcode, is_active) VALUES
  ('TCI-HS-021', 'Tissue Paper Roll', 'Soft toilet tissue pack of 4', 'Household', 'SoftTouch', 'piece', 110.00, 85.00, 130, 28, 360, 'Tech Components Inc.', 'Store Room C', '3001001001321', true),
  ('TCI-HS-022', 'Kitchen Towel Roll', 'Absorbent paper towel pack of 2', 'Household', 'QuickDry', 'piece', 85.00, 65.00, 100, 22, 300, 'Tech Components Inc.', 'Store Room C', '3001001001322', true),
  ('TCI-HS-023', 'Napkins Pack 100', 'Soft paper napkins', 'Household', 'SoftWipe', 'piece', 45.00, 32.00, 140, 30, 400, 'Tech Components Inc.', 'Store Room C', '3001001001323', true),
  ('TCI-HS-024', 'Garbage Bags Large', 'Heavy duty trash bags pack of 30', 'Household', 'StrongBag', 'piece', 120.00, 90.00, 90, 20, 270, 'Tech Components Inc.', 'Store Room C', '3001001001324', true),
  ('TCI-HS-025', 'Garbage Bags Small', 'Kitchen waste bags pack of 50', 'Household', 'StrongBag', 'piece', 75.00, 55.00, 110, 24, 330, 'Tech Components Inc.', 'Store Room C', '3001001001325', true),
  ('TCI-HS-026', 'Aluminum Foil Roll', 'Food grade aluminum foil 10m', 'Household', 'WrapIt', 'piece', 95.00, 72.00, 85, 19, 250, 'Tech Components Inc.', 'Store Room C', '3001001001326', true),
  ('TCI-HS-027', 'Cling Film Roll', 'Food wrap cling film 30m', 'Household', 'WrapIt', 'piece', 65.00, 48.00, 95, 21, 280, 'Tech Components Inc.', 'Store Room C', '3001001001327', true),
  ('TCI-HS-028', 'Disposable Plates 50pc', 'Paper plates pack', 'Household', 'PartyTime', 'piece', 85.00, 65.00, 75, 17, 220, 'Tech Components Inc.', 'Store Room C', '3001001001328', true),
  ('TCI-HS-029', 'Disposable Cups 100pc', 'Paper cups pack', 'Household', 'PartyTime', 'piece', 95.00, 72.00, 80, 18, 240, 'Tech Components Inc.', 'Store Room C', '3001001001329', true),
  ('TCI-HS-030', 'Wet Wipes Pack 80', 'Antibacterial wet wipes', 'Household', 'CleanWipe', 'piece', 105.00, 80.00, 100, 22, 300, 'Tech Components Inc.', 'Store Room C', '3001001001330', true),
  ('TCI-HS-048', 'Candle Set 6pc', 'Scented candles variety pack', 'Household', 'Ambiance', 'piece', 185.00, 140.00, 60, 12, 180, 'Tech Components Inc.', 'Store Room C', '3001001001348', true),
  ('TCI-HS-049', 'Matchbox 50stick', 'Safety match sticks', 'Household', 'FireLite', 'piece', 10.00, 7.00, 400, 80, 1200, 'Tech Components Inc.', 'Store Room C', '3001001001349', true),
  ('TCI-HS-050', 'Lighter Fluid 100ml', 'Refill for cigarette lighters', 'Household', 'FireLite', 'ml', 45.00, 32.00, 120, 24, 360, 'Tech Components Inc.', 'Store Room C', '3001001001350', true),
  ('TCI-HS-051', 'Sewing Kit', 'Complete sewing kit with needles', 'Household', 'StitchFix', 'piece', 65.00, 48.00, 100, 20, 300, 'Tech Components Inc.', 'Store Room C', '3001001001351', true);

-- Tech Components Inc. - Food & Beverages (14 items)
INSERT INTO products (sku, name, description, category, brand, unit, price, cost, quantity, reorder_level, max_stock_level, supplier, location, barcode, is_active) VALUES
  ('TCI-FB-029', 'Vinegar 500ml', 'Distilled white vinegar', 'Food & Beverages', 'PureClean', 'ml', 45.00, 25.00, 150, 30, 450, 'Tech Components Inc.', 'Store Room F', '3001001002329', true),
  ('TCI-FB-030', 'Mustard 200g', 'Yellow mustard condiment', 'Food & Beverages', 'SpiceWorld', 'gm', 35.00, 18.00, 180, 36, 540, 'Tech Components Inc.', 'Store Room F', '3001001002330', true),
  ('TCI-FB-031', 'Pickles 500g', 'Assorted pickle jar', 'Food & Beverages', 'CrunchyBits', 'gm', 75.00, 45.00, 100, 20, 300, 'Tech Components Inc.', 'Store Room F', '3001001002331', true),
  ('TCI-FB-032', 'Cereal 500g', 'Whole grain breakfast cereal', 'Food & Beverages', 'MorningStart', 'gm', 125.00, 75.00, 90, 18, 270, 'Tech Components Inc.', 'Store Room F', '3001001002332', true),
  ('TCI-FB-033', 'Dried Fruit Mix 200g', 'Mixed dried fruits and berries', 'Food & Beverages', 'NatureSweet', 'gm', 95.00, 55.00, 120, 24, 360, 'Tech Components Inc.', 'Store Room F', '3001001002333', true),
  ('TCI-FB-034', 'Spices Set 10pc', 'Assorted cooking spices set', 'Food & Beverages', 'FlavorMaster', 'piece', 145.00, 85.00, 65, 13, 195, 'Tech Components Inc.', 'Store Room F', '3001001002334', true),
  ('TCI-FB-035', 'Tea Infuser Set', 'Loose leaf tea infuser collection', 'Food & Beverages', 'LeafyBrew', 'piece', 165.00, 95.00, 55, 11, 165, 'Tech Components Inc.', 'Store Room F', '3001001002335', true),
  ('TCI-FB-036', 'Coffee Beans 500g', 'Arabica coffee beans medium roast', 'Food & Beverages', 'BeanGrind', 'gm', 225.00, 135.00, 70, 14, 210, 'Tech Components Inc.', 'Store Room F', '3001001002336', true),
  ('TCI-FB-037', 'Protein Bars 12pc', 'High protein snack bars', 'Food & Beverages', 'MuscleFuel', 'piece', 185.00, 110.00, 80, 16, 240, 'Tech Components Inc.', 'Store Room F', '3001001002337', true),
  ('TCI-FB-038', 'Energy Balls 200g', 'Date and nut energy bites', 'Food & Beverages', 'NaturalBoost', 'gm', 110.00, 65.00, 95, 19, 285, 'Tech Components Inc.', 'Store Room F', '3001001002338', true),
  ('TCI-FB-039', 'Soup Mix 500g', 'Dehydrated soup mix variety pack', 'Food & Beverages', 'ComfortFood', 'gm', 85.00, 45.00, 110, 22, 330, 'Tech Components Inc.', 'Store Room F', '3001001002339', true),
  ('TCI-FB-040', 'Pasta Sauce 500ml', 'Marinara pasta sauce', 'Food & Beverages', 'ItalianKitchen', 'ml', 65.00, 35.00, 140, 28, 420, 'Tech Components Inc.', 'Store Room F', '3001001002340', true),
  ('TCI-FB-041', 'Salad Dressing 250ml', 'Balsamic vinaigrette dressing', 'Food & Beverages', 'GardenFresh', 'ml', 55.00, 28.00, 130, 26, 390, 'Tech Components Inc.', 'Store Room F', '3001001002341', true),
  ('TCI-FB-042', 'Hot Sauce 150ml', 'Spicy sriracha-style sauce', 'Food & Beverages', 'FireBurn', 'ml', 45.00, 22.00, 160, 32, 480, 'Tech Components Inc.', 'Store Room F', '3001001002342', true);

-- Additional products to reach 80+ items
INSERT INTO products (sku, name, description, category, brand, unit, price, cost, quantity, reorder_level, max_stock_level, supplier, location, barcode, is_active) VALUES
  ('TCI-HS-052', 'First Aid Kit', 'Basic medical supplies kit', 'Household', 'HealthGuard', 'piece', 250.00, 185.00, 45, 9, 135, 'Tech Components Inc.', 'Store Room C', '3001001001352', true),
  ('TCI-HS-053', 'Tool Box Set', 'Basic household tool kit', 'Household', 'FixIt', 'piece', 450.00, 335.00, 30, 6, 90, 'Tech Components Inc.', 'Store Room C', '3001001001353', true),
  ('TCI-HS-054', 'Measuring Tape 5m', 'Flexible measuring tape', 'Household', 'MeasurePro', 'meter', 75.00, 55.00, 80, 16, 240, 'Tech Components Inc.', 'Store Room C', '3001001001354', true),
  ('TCI-HS-055', 'Rubber Gloves Pair', 'Durable rubber gloves', 'Household', 'ProtectWear', 'pair', 55.00, 40.00, 140, 28, 420, 'Tech Components Inc.', 'Store Room C', '3001001001355', true),
  ('ABC-FB-043', 'Vegetable Oil 1L', 'Refined vegetable cooking oil', 'Food & Beverages', 'HealthyChoice', 'liter', 135.00, 95.00, 100, 20, 300, 'ABC Supplies Co.', 'Store Room D', '3001001002143', true),
  ('GPL-FB-044', 'Flour 1kg', 'All-purpose wheat flour', 'Food & Beverages', 'BakeWell', 'kg', 35.00, 20.00, 200, 40, 600, 'Global Parts Ltd.', 'Store Room E', '3001001002244', true);

-- Verify the products were added
SELECT 
  COUNT(*) as total_products,
  supplier,
  COUNT(*) as products_per_supplier
FROM products
GROUP BY supplier
ORDER BY supplier;

-- Show all products with details
SELECT sku, name, category, price, quantity, supplier, location
FROM products
ORDER BY supplier, category, sku;