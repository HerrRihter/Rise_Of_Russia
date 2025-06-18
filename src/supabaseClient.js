import { createClient } from '@supabase/supabase-js'

// Получаем переменные из окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Проверка, что переменные загрузились
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are not defined. Make sure you have a .env file set up.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);