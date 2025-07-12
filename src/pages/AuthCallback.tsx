import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { GmailService } from '@/lib/gmail-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }

        if (data.session) {
          // Check if this is a Gmail OAuth callback
          const urlParams = new URLSearchParams(window.location.search)
          const code = urlParams.get('code')
          const scope = urlParams.get('scope')

          if (code && scope && scope.includes('gmail')) {
            // This is a Gmail OAuth callback
            setMessage('Connecting your Gmail account...')
            
            // Exchange code for tokens
            const response = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: `${window.location.origin}/auth/callback`,
              }),
            })

            const tokenData = await response.json()
            
            if (!response.ok) {
              throw new Error(tokenData.error_description || 'Failed to get access token')
            }

            // Save Gmail credentials
            await GmailService.saveGmailCredentials({
              access_token: tokenData.access_token,
              refresh_token: tokenData.refresh_token,
              scope: tokenData.scope,
              token_type: tokenData.token_type,
              expiry_date: Date.now() + (tokenData.expires_in * 1000),
            })

            setStatus('success')
            setMessage('Gmail account connected successfully!')
            
            // Redirect to newsletter builder after a short delay
            setTimeout(() => {
              navigate('/newsletter-builder')
            }, 2000)
          } else {
            // Regular Supabase auth callback
            setStatus('success')
            setMessage('Authentication successful!')
            
            setTimeout(() => {
              navigate('/newsletter-builder')
            }, 2000)
          }
        } else {
          throw new Error('No session found')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Authentication failed')
        
        setTimeout(() => {
          navigate('/')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
            {status === 'loading' ? 'Processing...' : 
             status === 'success' ? 'Success!' : 'Error'}
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Please wait while we complete the authentication...
              </p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Redirecting you to the newsletter builder...
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Redirecting you to the home page...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 