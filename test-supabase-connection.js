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

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection by querying the products table
    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
    } else {
      console.log('Supabase connection successful!');
      console.log('Products count:', count);
      console.log('Sample data (if any):', data);
    }
    
    // Test authentication status
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.log('Not authenticated (this is normal for anon key)');
    } else {
      console.log('Current user:', userData.user?.email || 'Anonymous');
    }
  } catch (err) {
    console.error('Failed to test connection:', err);
  }
}

testConnection();