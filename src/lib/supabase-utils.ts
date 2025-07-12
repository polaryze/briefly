import { supabase } from './supabase'
import type { Database } from './supabase'

type Newsletter = Database['public']['Tables']['newsletters']['Insert']
type User = Database['public']['Tables']['users']['Insert']

// Newsletter operations
export const saveNewsletter = async (newsletter: Newsletter) => {
  const { data, error } = await supabase
    .from('newsletters')
    .insert(newsletter)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save newsletter: ${error.message}`)
  }

  return data
}

export const getNewslettersByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch newsletters: ${error.message}`)
  }

  return data
}

export const updateNewsletter = async (id: string, updates: Partial<Newsletter>) => {
  const { data, error } = await supabase
    .from('newsletters')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update newsletter: ${error.message}`)
  }

  return data
}

export const deleteNewsletter = async (id: string) => {
  const { error } = await supabase
    .from('newsletters')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete newsletter: ${error.message}`)
  }

  return true
}

// User operations
export const createUser = async (user: User) => {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`)
  }

  return data
}

export const getUserById = async (id: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch user: ${error.message}`)
  }

  return data
}

export const updateUser = async (id: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`)
  }

  return data
}

// Auth operations
export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })

  if (error) {
    throw new Error(`Failed to sign up: ${error.message}`)
  }

  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(`Failed to sign in: ${error.message}`)
  }

  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(`Failed to sign out: ${error.message}`)
  }

  return true
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(`Failed to get current user: ${error.message}`)
  }

  return user
}

// Real-time subscriptions
export const subscribeToNewsletters = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('newsletters')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'newsletters',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()
} 