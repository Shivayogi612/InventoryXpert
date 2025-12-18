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

async function checkProducts() {
  try {
    console.log('Checking products in database...');
    
    // Try to count products
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error counting products:', countError);
    } else {
      console.log(`Total products in database: ${count}`);
    }
    
    // Try to fetch some products
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      console.log(`Found ${data.length} products:`);
      data.forEach(product => {
        console.log(`- ${product.sku}: ${product.name} (${product.quantity} units)`);
      });
    }
    
    // Check suppliers
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('*');
    
    if (suppliersError) {
      console.error('Error fetching suppliers:', suppliersError);
    } else {
      console.log(`Found ${suppliers.length} suppliers:`);
      suppliers.forEach(supplier => {
        console.log(`- ${supplier.name}`);
      });
    }
  } catch (err) {
    console.error('Failed to check products:', err);
  }
}

checkProducts();