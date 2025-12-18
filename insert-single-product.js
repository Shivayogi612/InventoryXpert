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

async function insertSingleProduct() {
  try {
    console.log('Attempting to insert a single test product...');
    
    const testProduct = {
      sku: 'TEST-999',
      name: 'Test Product for Verification',
      description: 'A single test product to verify database insertion',
      category: 'Test',
      brand: 'TestBrand',
      unit: 'piece',
      price: 99.99,
      cost: 50.00,
      quantity: 25,
      reorder_level: 5,
      max_stock_level: 100,
      supplier: 'Test Supplier',
      location: 'Test Location',
      barcode: '9999999999999',
      is_active: true
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert([testProduct])
      .select();
    
    if (error) {
      console.error('Error inserting product:', error);
      console.log('This error is likely due to RLS (Row Level Security) policies.');
      console.log('You need to either:');
      console.log('1. Disable RLS for testing purposes in Supabase');
      console.log('2. Use a service role key instead of the anon key');
      console.log('3. Run the SQL script directly in the Supabase SQL Editor');
    } else {
      console.log('Successfully inserted product:', data);
    }
    
    // Try to fetch products again
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*');
    
    if (fetchError) {
      console.error('Error fetching products:', fetchError);
    } else {
      console.log(`Total products in database: ${products.length}`);
      if (products.length > 0) {
        console.log('Sample products:');
        products.slice(0, 3).forEach(product => {
          console.log(`- ${product.sku}: ${product.name} (${product.quantity} units)`);
        });
      }
    }
  } catch (err) {
    console.error('Failed to insert test product:', err);
  }
}

insertSingleProduct();