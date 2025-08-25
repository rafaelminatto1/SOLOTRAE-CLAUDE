import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database/supabase';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Cliente Supabase para uso no backend (com service role key)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Cliente Supabase para uso geral (com anon key)
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export default supabaseAdmin;