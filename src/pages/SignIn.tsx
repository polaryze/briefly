import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignInPage() {
  const { loginWithRedirect, isAuthenticated, isLoading, error, user } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    // Debug logging
  
    
    // If already authenticated, redirect to homepage
    if (isAuthenticated && user) {

      navigate('/');
      return;
    }
    
    // Only auto-trigger login if we're not in a callback state
    if (!isAuthenticated && !isLoading && !window.location.pathname.includes('/auth/callback')) {
      
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, error, loginWithRedirect, user, navigate]);

  const handleLogin = async () => {
    try {

      await loginWithRedirect();
    } catch (err) {
      
    }
  };

  // If already authenticated, show loading
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Redirecting to homepage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Sign In to Briefly</h1>
        <p className="text-gray-600 mb-6">Connecting you to Auth0...</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error.message}
          </div>
        )}
        
        <Button 
          onClick={handleLogin}
          disabled={isLoading}
          className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg disabled:opacity-50"
        >
          {isLoading ? 'Signing In...' : 'Sign In with Auth0'}
        </Button>
        
        {isLoading && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Redirecting to Auth0...</p>
          </div>
        )}
      </div>
    </div>
  );
} 