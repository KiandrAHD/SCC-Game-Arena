import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null

function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Supabase tidak terkonfigurasi. ' +
      'Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY sudah diatur di .env'
    )
    return null
  }
  
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  
  return supabase
}

export const supabaseClient = getSupabase()

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey)
}
