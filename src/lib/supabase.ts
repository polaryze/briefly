import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (you can generate these from your Supabase dashboard)
export interface Database {
  public: {
    Tables: {
      newsletters: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          content: string
          social_links: string[]
          time_range: string
          status: 'draft' | 'published'
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          content: string
          social_links: string[]
          time_range: string
          status?: 'draft' | 'published'
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          content?: string
          social_links?: string[]
          time_range?: string
          status?: 'draft' | 'published'
        }
      }
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string
          avatar_url?: string
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          name: string
          avatar_url?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string
          avatar_url?: string
        }
      }
    }
  }
} 