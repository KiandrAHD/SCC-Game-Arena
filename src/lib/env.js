export const env = {
  get supabaseUrl() {
    return import.meta.env.VITE_SUPABASE_URL || ''
  },
  get supabaseAnonKey() {
    return import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  },
  get isDevelopment() {
    return import.meta.env.DEV
  },
  get isProduction() {
    return import.meta.env.PROD
  },
}

export function validateEnv() {
  const missing = []
  
  if (!env.supabaseUrl) {
    missing.push('VITE_SUPABASE_URL')
  }
  
  if (!env.supabaseAnonKey) {
    missing.push('VITE_SUPABASE_ANON_KEY')
  }
  
  if (missing.length > 0) {
    console.warn(
      `Environment variables belum diatur: ${missing.join(', ')}. ` +
      'Fitur backend tidak akan berfungsi. Salin .env.example ke .env dan isi nilainya.'
    )
    return false
  }
  
  return true
}
