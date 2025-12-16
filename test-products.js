import { createClient } from '@supabase/supabase-js';

// Load environment variables
import { config } from 'dotenv';
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

async function testProducts() {
  try {
    console.log('Fetching products...');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    
    console.log(`Found ${data.length} products:`);
    console.log(data);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testProducts();