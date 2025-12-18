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

async function testReadProducts() {
  try {
    console.log('Testing read access to products table...');
    
    // Try to read products
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error reading products:', error);
    } else {
      console.log(`Successfully read ${data.length} products`);
      console.log(data);
    }
    
    // Try to count products
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact' });
    
    if (countError) {
      console.error('Error counting products:', countError);
    } else {
      console.log(`Total products in database: ${count}`);
    }
  } catch (err) {
    console.error('Failed to test read access:', err);
  }
}

testReadProducts();