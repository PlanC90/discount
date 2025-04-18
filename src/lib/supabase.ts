import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL is not defined in .env");
}

if (!supabaseKey) {
  throw new Error("VITE_SUPABASE_ANON_KEY is not defined in .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
