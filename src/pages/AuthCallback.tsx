import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, error } = useAuth0()

  useEffect(() => {
    console.log('AuthCallback - Auth0 State:', { isAuthenticated, isLoading, error });
    
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('User is authenticated, redirecting to homepage...');
        // Redirect to homepage after successful auth
        navigate('/')
      } else {
        console.log('User is not authenticated, redirecting to signin...');
        // Redirect to sign in if authentication failed
        navigate('/signin')
      }
    }
  }, [isAuthenticated, isLoading, navigate, error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error.message}
          </div>
        )}
        <div className="mt-2 text-sm text-gray-500">
          Loading: {isLoading ? 'Yes' : 'No'} | Authenticated: {isAuthenticated ? 'Yes' : 'No'}
        </div>
      </div>
    </div>
  )
} 