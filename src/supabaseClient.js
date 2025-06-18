// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Используем уникальные плейсхолдеры
const supabaseUrl = '__VITE_SUPABASE_URL__';
const supabaseAnonKey = '__VITE_SUPABASE_ANON_KEY__';

// Убираем проверку, так как она будет срабатывать во время сборки
// if (!supabaseUrl || !supabaseAnonKey) { ... }

export const supabase = createClient(supabaseUrl, supabaseAnonKey);