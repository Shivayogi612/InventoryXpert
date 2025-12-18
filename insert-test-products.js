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

async function insertTestProducts() {
  try {
    console.log('Inserting test products...');
    
    // Simple test products
    const testProducts = [
      {
        sku: 'TEST-001',
        name: 'Test Product 1',
        description: 'A sample product for testing',
        category: 'Test',
        brand: 'TestBrand',
        unit: 'piece',
        price: 100.00,
        cost: 80.00,
        quantity: 50,
        reorder_level: 10,
        max_stock_level: 100,
        supplier: 'Test Supplier',
        location: 'Test Location',
        barcode: '1234567890123',
        is_active: true
      },
      {
        sku: 'TEST-002',
        name: 'Test Product 2',
        description: 'Another sample product for testing',
        category: 'Test',
        brand: 'TestBrand',
        unit: 'piece',
        price: 150.00,
        cost: 120.00,
        quantity: 30,
        reorder_level: 5,
        max_stock_level: 75,
        supplier: 'Test Supplier',
        location: 'Test Location',
        barcode: '1234567890124',
        is_active: true
      },
      {
        sku: 'TEST-003',
        name: 'Test Product 3',
        description: 'Third sample product for testing',
        category: 'Test',
        brand: 'TestBrand',
        unit: 'piece',
        price: 200.00,
        cost: 160.00,
        quantity: 20,
        reorder_level: 3,
        max_stock_level: 50,
        supplier: 'Test Supplier',
        location: 'Test Location',
        barcode: '1234567890125',
        is_active: true
      }
    ];
    
    // Try to insert products one by one to see which one fails
    for (let i = 0; i < testProducts.length; i++) {
      const product = testProducts[i];
      console.log(`Inserting product ${i + 1}: ${product.name}`);
      
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select();
      
      if (error) {
        console.error(`Error inserting product ${i + 1}:`, error);
      } else {
        console.log(`Successfully inserted product ${i + 1}`);
      }
    }
    
    // Verify the products were added
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      console.log(`Total products in database: ${data.length}`);
      if (data.length > 0) {
        console.log('Sample products:');
        data.slice(0, 3).forEach(product => {
          console.log(`- ${product.name} (${product.sku}): ${product.quantity} units`);
        });
      }
    }
  } catch (err) {
    console.error('Failed to insert test products:', err);
  }
}

insertTestProducts();