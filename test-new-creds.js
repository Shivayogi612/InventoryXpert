
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing data fetch with:');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    try {
        console.log('Attempting to fetch 1 product row...');
        const start = Date.now();

        // FETCH ACTUAL DATA, not just head
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .limit(1);

        console.log('Time taken:', Date.now() - start, 'ms');

        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Success! Data length:', data ? data.length : 0);
            if (data && data.length > 0) {
                console.log('First Item:', data[0].name);
            }
        }
    } catch (err) {
        console.error('Connection failed:', err.message);
    }
}

test();
