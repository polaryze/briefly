import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Clerk handles OAuth callbacks automatically
    // Redirect to newsletter builder after successful auth
    navigate('/newsletter-builder')
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
} 