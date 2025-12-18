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

async function setupDatabase() {
  try {
    console.log('Setting up database with sample products...');
    
    // First, let's try to sign up a test user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'test@inventoryxpert.com',
      password: 'inventory123'
    });
    
    if (signUpError && signUpError.message !== 'User already registered') {
      console.error('Error signing up:', signUpError);
    } else {
      console.log('User signed up or already exists');
    }
    
    // Then sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@inventoryxpert.com',
      password: 'inventory123'
    });
    
    if (signInError) {
      console.error('Error signing in:', signInError);
      return;
    }
    
    console.log('Successfully signed in');
    
    // Now try to insert products
    const sampleProducts = [
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
      }
    ];
    
    const { data, error } = await supabase
      .from('products')
      .insert(sampleProducts)
      .select();
    
    if (error) {
      console.error('Error inserting products:', error);
    } else {
      console.log(`Successfully inserted ${data.length} products`);
      console.log(data);
    }
    
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
    console.error('Failed to setup database:', err);
  }
}

setupDatabase();