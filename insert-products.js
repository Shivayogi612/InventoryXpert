import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define the new products to insert
const newProducts = [
  // ABC Supplies Co. - Household Products (9 items)
  { sku: 'HS-031', name: 'Laundry Stain Remover 500ml', description: 'Powerful stain remover for tough stains', category: 'Household', brand: 'CleanPro', unit: 'ml', price: 125.00, cost: 95.00, quantity: 75, reorder_level: 15, max_stock_level: 220, supplier: 'ABC Supplies Co.', location: 'Store Room A', barcode: '3001001001031', is_active: true },
  { sku: 'HS-032', name: 'Fabric Conditioner 2L', description: 'Long-lasting fabric softener', category: 'Household', brand: 'SoftTouch', unit: 'liter', price: 280.00, cost: 210.00, quantity: 60, reorder_level: 12, max_stock_level: 180, supplier: 'ABC Supplies Co.', location: 'Store Room A', barcode: '3001001001032', is_active: true },
  { sku: 'HS-033', name: 'Carpet Cleaner Spray 750ml', description: 'Foam carpet cleaning solution', category: 'Household', brand: 'FloorShine', unit: 'ml', price: 165.00, cost: 125.00, quantity: 55, reorder_level: 11, max_stock_level: 160, supplier: 'ABC Supplies Co.', location: 'Store Room A', barcode: '3001001001033', is_active: true },
  { sku: 'HS-034', name: 'Oven Cleaner 750ml', description: 'Self-polishing oven cleaning gel', category: 'Household', brand: 'CleanAll', unit: 'ml', price: 140.00, cost: 105.00, quantity: 65, reorder_level: 13, max_stock_level: 190, supplier: 'ABC Supplies Co.', location: 'Store Room A', barcode: '3001001001034', is_active: true },
  { sku: 'HS-035', name: 'Drain Cleaner 1L', description: 'Pipe unclogging liquid', category: 'Household', brand: 'ClearFlow', unit: 'liter', price: 110.00, cost: 82.00, quantity: 80, reorder_level: 16, max_stock_level: 240, supplier: 'ABC Supplies Co.', location: 'Store Room A', barcode: '3001001001035', is_active: true },
  { sku: 'HS-036', name: 'Air Freshener 300ml', description: 'Long lasting room fragrance', category: 'Household', brand: 'FreshAir', unit: 'ml', price: 95.00, cost: 70.00, quantity: 110, reorder_level: 22, max_stock_level: 320, supplier: 'ABC Supplies Co.', location: 'Store Room A', barcode: '3001001001036', is_active: true },
  { sku: 'HS-037', name: 'Mosquito Repellent 500ml', description: 'DEET free mosquito spray', category: 'Household', brand: 'BugFree', unit: 'ml', price: 135.00, cost: 100.00, quantity: 95, reorder_level: 19, max_stock_level: 280, supplier: 'ABC Supplies Co.', location: 'Store Room A', barcode: '3001001001037', is_active: true },
  { sku: 'HS-038', name: 'Disinfectant Spray 500ml', description: 'Multi-surface sanitizer', category: 'Household', brand: 'SanitizePro', unit: 'ml', price: 120.00, cost: 90.00, quantity: 85, reorder_level: 17, max_stock_level: 250, supplier: 'ABC Supplies Co.', location: 'Store Room A', barcode: '3001001001038', is_active: true },
  { sku: 'HS-039', name: 'Laundry Bleach Alternative 1L', description: 'Color-safe bleaching agent', category: 'Household', brand: 'CleanPro', unit: 'liter', price: 155.00, cost: 115.00, quantity: 70, reorder_level: 14, max_stock_level: 200, supplier: 'ABC Supplies Co.', location: 'Store Room A', barcode: '3001001001039', is_active: true },

  // ABC Supplies Co. - Food & Beverages (8 items)
  { sku: 'FB-001', name: 'Instant Coffee 200g', description: 'Premium instant coffee powder', category: 'Food & Beverages', brand: 'CafeSelect', unit: 'gm', price: 180.00, cost: 135.00, quantity: 120, reorder_level: 24, max_stock_level: 350, supplier: 'ABC Supplies Co.', location: 'Store Room D', barcode: '3001001002001', is_active: true },
  { sku: 'FB-002', name: 'Green Tea Bags 50pc', description: 'Antioxidant rich green tea', category: 'Food & Beverages', brand: 'HerbalBlend', unit: 'piece', price: 125.00, cost: 95.00, quantity: 90, reorder_level: 18, max_stock_level: 270, supplier: 'ABC Supplies Co.', location: 'Store Room D', barcode: '3001001002002', is_active: true },
  { sku: 'FB-003', name: 'Black Tea Bags 100pc', description: 'Classic black tea blend', category: 'Food & Beverages', brand: 'HerbalBlend', unit: 'piece', price: 165.00, cost: 125.00, quantity: 85, reorder_level: 17, max_stock_level: 250, supplier: 'ABC Supplies Co.', location: 'Store Room D', barcode: '3001001002003', is_active: true },
  { sku: 'FB-004', name: 'Sugar 1kg', description: 'Refined white sugar', category: 'Food & Beverages', brand: 'SweetPure', unit: 'kg', price: 45.00, cost: 32.00, quantity: 200, reorder_level: 40, max_stock_level: 600, supplier: 'ABC Supplies Co.', location: 'Store Room D', barcode: '3001001002004', is_active: true },
  { sku: 'FB-005', name: 'Salt 1kg', description: 'Iodized table salt', category: 'Food & Beverages', brand: 'TasteRight', unit: 'kg', price: 25.00, cost: 18.00, quantity: 250, reorder_level: 50, max_stock_level: 750, supplier: 'ABC Supplies Co.', location: 'Store Room D', barcode: '3001001002005', is_active: true },
  { sku: 'FB-006', name: 'Cooking Oil 1L', description: 'Refined sunflower oil', category: 'Food & Beverages', brand: 'HealthyChoice', unit: 'liter', price: 140.00, cost: 105.00, quantity: 110, reorder_level: 22, max_stock_level: 320, supplier: 'ABC Supplies Co.', location: 'Store Room D', barcode: '3001001002006', is_active: true },
  { sku: 'FB-007', name: 'Rice 5kg', description: 'Basmati rice premium quality', category: 'Food & Beverages', brand: 'GrainMaster', unit: 'kg', price: 280.00, cost: 210.00, quantity: 60, reorder_level: 12, max_stock_level: 180, supplier: 'ABC Supplies Co.', location: 'Store Room D', barcode: '3001001002007', is_active: true },
  { sku: 'FB-008', name: 'Pasta 500g', description: 'Durum wheat pasta', category: 'Food & Beverages', brand: 'Italiano', unit: 'gm', price: 65.00, cost: 48.00, quantity: 150, reorder_level: 30, max_stock_level: 450, supplier: 'ABC Supplies Co.', location: 'Store Room D', barcode: '3001001002008', is_active: true },

  // Global Parts Ltd. - Household Products (8 items)
  { sku: 'HS-040', name: 'Battery AA 4pc', description: 'Alkaline batteries pack', category: 'Household', brand: 'PowerPlus', unit: 'piece', price: 45.00, cost: 32.00, quantity: 200, reorder_level: 40, max_stock_level: 600, supplier: 'Global Parts Ltd.', location: 'Store Room B', barcode: '3001001001040', is_active: true },
  { sku: 'HS-041', name: 'LED Bulbs 9W 3pc', description: 'Energy efficient LED bulbs', category: 'Household', brand: 'BrightLight', unit: 'piece', price: 195.00, cost: 145.00, quantity: 75, reorder_level: 15, max_stock_level: 220, supplier: 'Global Parts Ltd.', location: 'Store Room B', barcode: '3001001001041', is_active: true },
  { sku: 'HS-042', name: 'Extension Cord 3m', description: '3-pin extension cord', category: 'Household', brand: 'SafePlug', unit: 'piece', price: 220.00, cost: 165.00, quantity: 50, reorder_level: 10, max_stock_level: 150, supplier: 'Global Parts Ltd.', location: 'Store Room B', barcode: '3001001001042', is_active: true },
  { sku: 'HS-043', name: 'Adhesive Tape 50m', description: 'Transparent tape roll', category: 'Household', brand: 'StickFast', unit: 'meter', price: 35.00, cost: 25.00, quantity: 180, reorder_level: 36, max_stock_level: 540, supplier: 'Global Parts Ltd.', location: 'Store Room B', barcode: '3001001001043', is_active: true },
  { sku: 'HS-044', name: 'Glue Stick 20g', description: 'Non-toxic glue stick', category: 'Household', brand: 'BondPro', unit: 'gm', price: 25.00, cost: 18.00, quantity: 160, reorder_level: 32, max_stock_level: 480, supplier: 'Global Parts Ltd.', location: 'Store Room B', barcode: '3001001001044', is_active: true },
  { sku: 'HS-045', name: 'Scissors 8inch', description: 'Stainless steel scissors', category: 'Household', brand: 'CutSharp', unit: 'piece', price: 85.00, cost: 62.00, quantity: 90, reorder_level: 18, max_stock_level: 270, supplier: 'Global Parts Ltd.', location: 'Store Room B', barcode: '3001001001045', is_active: true },
  { sku: 'HS-046', name: 'Flashlight 3LED', description: 'Water resistant flashlight', category: 'Household', brand: 'BrightBeam', unit: 'piece', price: 150.00, cost: 110.00, quantity: 65, reorder_level: 13, max_stock_level: 190, supplier: 'Global Parts Ltd.', location: 'Store Room B', barcode: '3001001001046', is_active: true },
  { sku: 'HS-047', name: 'Thermos Flask 1L', description: 'Double wall vacuum flask', category: 'Household', brand: 'HeatRetain', unit: 'liter', price: 320.00, cost: 240.00, quantity: 40, reorder_level: 8, max_stock_level: 120, supplier: 'Global Parts Ltd.', location: 'Store Room B', barcode: '3001001001047', is_active: true },

  // Global Parts Ltd. - Food & Beverages (9 items)
  { sku: 'FB-009', name: 'Mixed Nuts 500g', description: 'Assorted dry fruits and nuts', category: 'Food & Beverages', brand: 'NutriMix', unit: 'gm', price: 320.00, cost: 240.00, quantity: 70, reorder_level: 14, max_stock_level: 210, supplier: 'Global Parts Ltd.', location: 'Store Room E', barcode: '3001001002009', is_active: true },
  { sku: 'FB-010', name: 'Potato Chips 150g', description: 'Crunchy salted chips', category: 'Food & Beverages', brand: 'SnackCrunch', unit: 'gm', price: 35.00, cost: 25.00, quantity: 250, reorder_level: 50, max_stock_level: 750, supplier: 'Global Parts Ltd.', location: 'Store Room E', barcode: '3001001002010', is_active: true },
  { sku: 'FB-011', name: 'Chocolate Bar 100g', description: 'Milk chocolate with almonds', category: 'Food & Beverages', brand: 'SweetDelight', unit: 'gm', price: 45.00, cost: 32.00, quantity: 200, reorder_level: 40, max_stock_level: 600, supplier: 'Global Parts Ltd.', location: 'Store Room E', barcode: '3001001002011', is_active: true },
  { sku: 'FB-012', name: 'Cookies 200g', description: 'Butter cookies pack', category: 'Food & Beverages', brand: 'Crumbly', unit: 'gm', price: 55.00, cost: 40.00, quantity: 180, reorder_level: 36, max_stock_level: 540, supplier: 'Global Parts Ltd.', location: 'Store Room E', barcode: '3001001002012', is_active: true },
  { sku: 'FB-013', name: 'Energy Drink 250ml', description: 'Caffeinated energy beverage', category: 'Food & Beverages', brand: 'PowerUp', unit: 'ml', price: 65.00, cost: 48.00, quantity: 150, reorder_level: 30, max_stock_level: 450, supplier: 'Global Parts Ltd.', location: 'Store Room E', barcode: '3001001002013', is_active: true },
  { sku: 'FB-014', name: 'Mineral Water 1L', description: 'Purified drinking water', category: 'Food & Beverages', brand: 'AquaPure', unit: 'liter', price: 25.00, cost: 18.00, quantity: 300, reorder_level: 60, max_stock_level: 900, supplier: 'Global Parts Ltd.', location: 'Store Room E', barcode: '3001001002014', is_active: true },
  { sku: 'FB-015', name: 'Orange Juice 1L', description: '100% pure orange juice', category: 'Food & Beverages', brand: 'FruitFresh', unit: 'liter', price: 95.00, cost: 70.00, quantity: 120, reorder_level: 24, max_stock_level: 360, supplier: 'Global Parts Ltd.', location: 'Store Room E', barcode: '3001001002015', is_active: true },
  { sku: 'FB-016', name: 'Tomato Ketchup 1kg', description: 'Spicy tomato ketchup', category: 'Food & Beverages', brand: 'TastyTop', unit: 'kg', price: 120.00, cost: 90.00, quantity: 90, reorder_level: 18, max_stock_level: 270, supplier: 'Global Parts Ltd.', location: 'Store Room E', barcode: '3001001002016', is_active: true },
  { sku: 'FB-017', name: 'Mayonnaise 500g', description: 'Creamy eggless mayonnaise', category: 'Food & Beverages', brand: 'CreamyDelight', unit: 'gm', price: 85.00, cost: 62.00, quantity: 110, reorder_level: 22, max_stock_level: 330, supplier: 'Global Parts Ltd.', location: 'Store Room E', barcode: '3001001002017', is_active: true },

  // Tech Components Inc. - Household Products (8 items)
  { sku: 'HS-048', name: 'Candle Set 6pc', description: 'Scented candles variety pack', category: 'Household', brand: 'Ambiance', unit: 'piece', price: 185.00, cost: 140.00, quantity: 60, reorder_level: 12, max_stock_level: 180, supplier: 'Tech Components Inc.', location: 'Store Room C', barcode: '3001001001048', is_active: true },
  { sku: 'HS-049', name: 'Matchbox 50stick', description: 'Safety match sticks', category: 'Household', brand: 'FireLite', unit: 'piece', price: 10.00, cost: 7.00, quantity: 400, reorder_level: 80, max_stock_level: 1200, supplier: 'Tech Components Inc.', location: 'Store Room C', barcode: '3001001001049', is_active: true },
  { sku: 'HS-050', name: 'Lighter Fluid 100ml', description: 'Refill for cigarette lighters', category: 'Household', brand: 'FireLite', unit: 'ml', price: 45.00, cost: 32.00, quantity: 120, reorder_level: 24, max_stock_level: 360, supplier: 'Tech Components Inc.', location: 'Store Room C', barcode: '3001001001050', is_active: true },
  { sku: 'HS-051', name: 'Sewing Kit', description: 'Complete sewing kit with needles', category: 'Household', brand: 'StitchFix', unit: 'piece', price: 65.00, cost: 48.00, quantity: 100, reorder_level: 20, max_stock_level: 300, supplier: 'Tech Components Inc.', location: 'Store Room C', barcode: '3001001001051', is_active: true },
  { sku: 'HS-052', name: 'First Aid Kit', description: 'Basic medical supplies kit', category: 'Household', brand: 'HealthGuard', unit: 'piece', price: 250.00, cost: 185.00, quantity: 45, reorder_level: 9, max_stock_level: 135, supplier: 'Tech Components Inc.', location: 'Store Room C', barcode: '3001001001052', is_active: true },
  { sku: 'HS-053', name: 'Tool Box Set', description: 'Basic household tool kit', category: 'Household', brand: 'FixIt', unit: 'piece', price: 450.00, cost: 335.00, quantity: 30, reorder_level: 6, max_stock_level: 90, supplier: 'Tech Components Inc.', location: 'Store Room C', barcode: '3001001001053', is_active: true },
  { sku: 'HS-054', name: 'Measuring Tape 5m', description: 'Flexible measuring tape', category: 'Household', brand: 'MeasurePro', unit: 'meter', price: 75.00, cost: 55.00, quantity: 80, reorder_level: 16, max_stock_level: 240, supplier: 'Tech Components Inc.', location: 'Store Room C', barcode: '3001001001054', is_active: true },
  { sku: 'HS-055', name: 'Rubber Gloves Pair', description: 'Durable rubber gloves', category: 'Household', brand: 'ProtectWear', unit: 'pair', price: 55.00, cost: 40.00, quantity: 140, reorder_level: 28, max_stock_level: 420, supplier: 'Tech Components Inc.', location: 'Store Room C', barcode: '3001001001055', is_active: true },

  // Tech Components Inc. - Food & Beverages (8 items)
  { sku: 'FB-018', name: 'Instant Noodles 70g', description: 'Spicy flavor noodles', category: 'Food & Beverages', brand: 'QuickMeal', unit: 'gm', price: 20.00, cost: 15.00, quantity: 300, reorder_level: 60, max_stock_level: 900, supplier: 'Tech Components Inc.', location: 'Store Room F', barcode: '3001001002018', is_active: true },
  { sku: 'FB-019', name: 'Popcorn 200g', description: 'Microwave popcorn', category: 'Food & Beverages', brand: 'MovieTime', unit: 'gm', price: 40.00, cost: 30.00, quantity: 160, reorder_level: 32, max_stock_level: 480, supplier: 'Tech Components Inc.', location: 'Store Room F', barcode: '3001001002019', is_active: true },
  { sku: 'FB-020', name: 'Granola Bars 6pc', description: 'Oat and honey granola bars', category: 'Food & Beverages', brand: 'EnergyBoost', unit: 'piece', price: 95.00, cost: 70.00, quantity: 130, reorder_level: 26, max_stock_level: 390, supplier: 'Tech Components Inc.', location: 'Store Room F', barcode: '3001001002020', is_active: true },
  { sku: 'FB-021', name: 'Protein Shake 500g', description: 'Vanilla flavored protein powder', category: 'Food & Beverages', brand: 'MuscleFuel', unit: 'gm', price: 420.00, cost: 315.00, quantity: 50, reorder_level: 10, max_stock_level: 150, supplier: 'Tech Components Inc.', location: 'Store Room F', barcode: '3001001002021', is_active: true },
  { sku: 'FB-022', name: 'Sports Drink 500ml', description: 'Electrolyte replenishment drink', category: 'Food & Beverages', brand: 'HydroBoost', unit: 'ml', price: 55.00, cost: 40.00, quantity: 170, reorder_level: 34, max_stock_level: 510, supplier: 'Tech Components Inc.', location: 'Store Room F', barcode: '3001001002022', is_active: true },
  { sku: 'FB-023', name: 'Coconut Water 1L', description: 'Natural coconut water', category: 'Food & Beverages', brand: 'NaturePure', unit: 'liter', price: 85.00, cost: 62.00, quantity: 110, reorder_level: 22, max_stock_level: 330, supplier: 'Tech Components Inc.', location: 'Store Room F', barcode: '3001001002023', is_active: true },
  { sku: 'FB-024', name: 'Honey 500g', description: 'Pure forest honey', category: 'Food & Beverages', brand: 'SweetNature', unit: 'gm', price: 165.00, cost: 125.00, quantity: 75, reorder_level: 15, max_stock_level: 220, supplier: 'Tech Components Inc.', location: 'Store Room F', barcode: '3001001002024', is_active: true },
  { sku: 'FB-025', name: 'Jam 500g', description: 'Mixed fruit jam', category: 'Food & Beverages', brand: 'FruitSpread', unit: 'gm', price: 110.00, cost: 82.00, quantity: 95, reorder_level: 19, max_stock_level: 280, supplier: 'Tech Components Inc.', location: 'Store Room F', barcode: '3001001002025', is_active: true }
];

async function insertProducts() {
  try {
    console.log(`Inserting ${newProducts.length} products...`);
    
    // Insert products in batches to avoid timeouts
    const batchSize = 10;
    for (let i = 0; i < newProducts.length; i += batchSize) {
      const batch = newProducts.slice(i, i + batchSize);
      console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(newProducts.length/batchSize)}`);
      
      const { data, error } = await supabase
        .from('products')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Error inserting batch:`, error);
      } else {
        console.log(`Successfully inserted ${batch.length} products in batch ${Math.floor(i/batchSize) + 1}`);
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('All products inserted!');
    
    // Verify the products were added
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact' });
    
    if (countError) {
      console.error('Error counting products:', countError);
    } else {
      console.log(`Total products in database: ${count}`);
    }
  } catch (err) {
    console.error('Failed to insert products:', err);
  }
}

insertProducts();