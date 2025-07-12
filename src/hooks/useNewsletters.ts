import { useState, useEffect } from 'react'
import { saveNewsletter, getNewslettersByUser, updateNewsletter, deleteNewsletter, subscribeToNewsletters } from '@/lib/supabase-utils'
import type { Database } from '@/lib/supabase'

type Newsletter = Database['public']['Tables']['newsletters']['Row']

export function useNewsletters(userId: string | null) {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch newsletters
  const fetchNewsletters = async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const data = await getNewslettersByUser(userId)
      setNewsletters(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch newsletters')
    } finally {
      setLoading(false)
    }
  }

  // Save a new newsletter
  const createNewsletter = async (newsletterData: Omit<Newsletter, 'id' | 'created_at'>) => {
    if (!userId) throw new Error('User not authenticated')

    setLoading(true)
    setError(null)

    try {
      const newNewsletter = await saveNewsletter({
        ...newsletterData,
        user_id: userId,
      })
      
      setNewsletters(prev => [newNewsletter, ...prev])
      return newNewsletter
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save newsletter')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update a newsletter
  const updateNewsletterById = async (id: string, updates: Partial<Newsletter>) => {
    setLoading(true)
    setError(null)

    try {
      const updatedNewsletter = await updateNewsletter(id, updates)
      setNewsletters(prev => 
        prev.map(newsletter => 
          newsletter.id === id ? updatedNewsletter : newsletter
        )
      )
      return updatedNewsletter
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update newsletter')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete a newsletter
  const deleteNewsletterById = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      await deleteNewsletter(id)
      setNewsletters(prev => prev.filter(newsletter => newsletter.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete newsletter')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Real-time subscription
  useEffect(() => {
    if (!userId) return

    const subscription = subscribeToNewsletters(userId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setNewsletters(prev => [payload.new as Newsletter, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        setNewsletters(prev => 
          prev.map(newsletter => 
            newsletter.id === payload.new.id ? payload.new as Newsletter : newsletter
          )
        )
      } else if (payload.eventType === 'DELETE') {
        setNewsletters(prev => 
          prev.filter(newsletter => newsletter.id !== payload.old.id)
        )
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  // Initial fetch
  useEffect(() => {
    fetchNewsletters()
  }, [userId])

  return {
    newsletters,
    loading,
    error,
    createNewsletter,
    updateNewsletter: updateNewsletterById,
    deleteNewsletter: deleteNewsletterById,
    refetch: fetchNewsletters,
  }
} 