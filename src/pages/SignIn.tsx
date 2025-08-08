import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, ArrowRight } from 'lucide-react';

export default function SignInPage() {
  const { loginWithRedirect, isAuthenticated, isLoading, error, user } = useAuth0();
  const navigate = useNavigate();
  
  // Check if Auth0 is properly configured
  const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const isAuth0Configured = auth0Domain && auth0ClientId;
  
  // Debug logging for production
  console.log('🔐 Auth0 Debug Info:', {
    domain: auth0Domain ? '✅ Set' : '❌ Missing',
    clientId: auth0ClientId ? '✅ Set' : '❌ Missing',
    fullDomain: auth0Domain,
    fullClientId: auth0ClientId?.substring(0, 10) + '...' // Show first 10 chars only
  });

  useEffect(() => {
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
      // Handle error silently
    }
  };

  // Show configuration error if Auth0 is not set up
  if (!isAuth0Configured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/80 backdrop-blur-sm border border-red-200 rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Auth0 Setup Required</h1>
              <p className="text-gray-600">Authentication is not configured yet.</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Missing Configuration:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• {auth0Domain ? '✅' : '❌'} VITE_AUTH0_DOMAIN</li>
                  <li>• {auth0ClientId ? '✅' : '❌'} VITE_AUTH0_CLIENT_ID</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Setup Instructions:</h3>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Create an Auth0 account at auth0.com</li>
                  <li>2. Create a Single Page Application</li>
                  <li>3. Add environment variables to .env</li>
                  <li>4. See AUTH0_SETUP_GUIDE.md for details</li>
                </ol>
              </div>
              
              <Button 
                onClick={() => window.open('https://auth0.com/signup', '_blank')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Create Auth0 Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If already authenticated, show loading
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-tl from-green-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Redirecting to homepage...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-tl from-green-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 rounded-full blur-3xl"></div>
        
        {/* Floating elements */}
        <div className="absolute top-32 left-1/4 w-2 h-2 bg-blue-500/40 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-500/30 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-green-500/40 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-blue-500/50 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 text-center">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 max-w-md w-full mx-4">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome to Briefly</h1>
            </div>
            <p className="text-gray-600">Sign in to start creating beautiful newsletters</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Error: {error.message}</span>
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            <div className="flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In with Auth0</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </div>
          </Button>
          
          {isLoading && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 text-blue-700">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                <span className="text-sm">Redirecting to Auth0...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 