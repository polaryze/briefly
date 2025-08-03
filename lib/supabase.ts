import { createClient } from '@supabase/supabase-js'

// Environment variables for both local and production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables not configured')
  console.error('   VITE_SUPABASE_URL:', !!import.meta.env.VITE_SUPABASE_URL)
  console.error('   VITE_SUPABASE_ANON_KEY:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
  console.error('   SUPABASE_URL:', !!process.env.SUPABASE_URL)
  console.error('   SUPABASE_ANON_KEY:', !!process.env.SUPABASE_ANON_KEY)
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    persistSession: false, // Don't persist auth sessions
    autoRefreshToken: false // Disable auto refresh for server-side usage
  },
  db: {
    schema: 'public'
  }
})

// Server-side only client (for admin operations)
export const createServerSupabaseClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not configured for server operations')
    return null
  }

  return createClient(supabaseUrl!, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    db: {
      schema: 'public'
    }
  })
} 