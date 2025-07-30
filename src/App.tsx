import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Auth0Provider } from '@auth0/auth0-react';
import IndexNew from "./pages/IndexNew";
import NotFound from "./pages/NotFound";
import NewsletterBuilder from "./pages/NewsletterBuilder";
import AuthCallback from "./pages/AuthCallback";
import SignIn from "./pages/SignIn";
import Pricing from "./pages/Pricing";
import Support from "./pages/Support";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import PageTransition from "./components/PageTransition";
import DebugSocialAPIs from './pages/DebugSocialAPIs';
import NewsletterEditor from './pages/NewsletterEditor';
import Loader from "./components/Loader";

const queryClient = new QueryClient();

// Waitlist redirect component - redirects all non-authenticated users to home
const WaitlistRedirect = () => {
  return <Navigate to="/" replace />;
};

// Secure redirect component - only allows authenticated users
const SecureRedirect = () => {
  return <Navigate to="/signin" replace />;
};

const App = () => (
  <ErrorBoundary>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN || ''}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID || ''}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/auth/callback`,
        scope: 'openid profile email',
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes - accessible to everyone */}
              <Route path="/" element={<PageTransition><IndexNew /></PageTransition>} />
              <Route path="/signin" element={<PageTransition><SignIn /></PageTransition>} />
              <Route path="/auth/callback" element={<PageTransition><AuthCallback /></PageTransition>} />
              <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
              <Route path="/support" element={<PageTransition><Support /></PageTransition>} />
              
              {/* Protected routes - require authentication */}
              <Route 
                path="/newsletter-builder" 
                element={
                  <ProtectedRoute>
                    <PageTransition>
                      <NewsletterBuilder />
                    </PageTransition>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/newsletter-editor" 
                element={
                  <ProtectedRoute>
                    <PageTransition>
                      <NewsletterEditor />
                    </PageTransition>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/debug-social-apis" 
                element={
                  <ProtectedRoute>
                    <PageTransition>
                      <DebugSocialAPIs />
                    </PageTransition>
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all other routes - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Auth0Provider>
  </ErrorBoundary>
);

export default App;
