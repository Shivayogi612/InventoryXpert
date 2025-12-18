import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

console.log('Environment variables:')
console.log('- VITE_SUPABASE_URL:', supabaseUrl)
console.log('- VITE_SUPABASE_ANON_KEY:', !!supabaseAnonKey)
console.log('- VITE_SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceRoleKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. See .env.example')
}

// Use Service Role Key if available (Temporary fix for local dev since Anon Key is invalid or RLS blocked)
// Standard initialization using Anon Key
const supabaseKey = supabaseAnonKey

console.log('Supabase client initialized with:')
console.log('- URL:', supabaseUrl)
console.log('- Key type: anon')

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})