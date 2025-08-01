import { createClient } from '@supabase/supabase-js'
import { Database } from '@/integrations/supabase/types'

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fallback check to prevent initialization with invalid values
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project-ref.supabase.co') {
  console.error('Supabase credentials are not configured correctly. Please check your .env file.');
}

// Create and export the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});