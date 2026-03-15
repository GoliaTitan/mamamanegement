import { createClient } from '@supabase/supabase-js'

// IMPORTANT: Replace with actual process.env or direct values when available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const isConfigured = !supabaseUrl.includes('placeholder-url') && !supabaseAnonKey.includes('placeholder-key');
