import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Save, Check, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNewsletters } from '@/hooks/useNewsletters'

interface SaveNewsletterButtonProps {
  newsletterContent: string
  socialLinks: string[]
  timeRange: string
  onSaved?: (newsletterId: string) => void
}

export const SaveNewsletterButton: React.FC<SaveNewsletterButtonProps> = ({
  newsletterContent,
  socialLinks,
  timeRange,
  onSaved
}) => {
  const { user, isAuthenticated } = useAuth()
  const { createNewsletter, loading } = useNewsletters(user?.id || null)
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    try {
      const newsletter = await createNewsletter({
        title: title.trim(),
        content: newsletterContent,
        social_links: socialLinks,
        time_range: timeRange,
        status: 'draft',
        user_id: user!.id
      })

      setSaved(true)
      onSaved?.(newsletter.id)
      
      // Reset form after a delay
      setTimeout(() => {
        setShowSaveForm(false)
        setTitle('')
        setSaved(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to save newsletter:', error)
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground text-center">
          Sign in to save your newsletters
        </p>
      </Card>
    )
  }

  if (saved) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <Check className="w-4 h-4" />
        <span className="text-sm">Newsletter saved!</span>
      </div>
    )
  }

  if (showSaveForm) {
    return (
      <Card className="p-4">
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Newsletter Title
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your newsletter"
              disabled={saving}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={saving || !title.trim()}
              className="flex-1"
            >
              {saving ? 'Saving...' : 'Save Newsletter'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSaveForm(false)}
              disabled={saving}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>
    )
  }

  return (
    <Button
      onClick={() => setShowSaveForm(true)}
      disabled={loading}
      className="w-full"
    >
      <Save className="w-4 h-4 mr-2" />
      Save Newsletter
    </Button>
  )
} 