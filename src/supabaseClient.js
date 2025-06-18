// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hlyajfpmuauowxbvnxxw.supabase.co'; // Вставьте ваш Project URL сюда
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhseWFqZnBtdWF1b3d4YnZueHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNTcwNjgsImV4cCI6MjA2NTczMzA2OH0.KW_WT0mNeKv49HCQxLK0KMRBPakVk-cPTQfOBw6GbhQ'; // Вставьте ваш anon public ключ сюда

export const supabase = createClient(supabaseUrl, supabaseAnonKey);