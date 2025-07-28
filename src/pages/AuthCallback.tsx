import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, error, user } = useAuth0()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    console.log('AuthCallback - Auth0 State:', { 
      isAuthenticated, 
      isLoading, 
      error: error?.message,
      user: user?.email,
      hasRedirected 
    });
    
    if (!isLoading && !hasRedirected) {
      if (isAuthenticated && user) {
        console.log('User is authenticated, redirecting to homepage...');
        setHasRedirected(true);
        navigate('/')
      } else if (error) {
        console.log('Authentication error, redirecting to homepage with error...');
        setHasRedirected(true);
        // Instead of redirecting to signin, go to homepage and show error
        navigate('/?auth_error=true')
      } else if (!isAuthenticated) {
        console.log('User is not authenticated, redirecting to homepage...');
        setHasRedirected(true);
        // Instead of redirecting to signin, go to homepage
        navigate('/')
      }
    }
  }, [isAuthenticated, isLoading, navigate, error, user, hasRedirected])

  // Add more detailed logging
  useEffect(() => {
    console.log('AuthCallback - URL:', window.location.href);
    console.log('AuthCallback - Pathname:', window.location.pathname);
    console.log('AuthCallback - Search:', window.location.search);
  }, []);

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
          Loading: {isLoading ? 'Yes' : 'No'} | Authenticated: {isAuthenticated ? 'Yes' : 'No'} | User: {user?.email || 'None'}
        </div>
      </div>
    </div>
  )
} 