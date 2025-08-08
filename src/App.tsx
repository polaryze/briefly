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
import BypassRoute from "./components/BypassRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import PageTransition from "./components/PageTransition";

import NewsletterEditor from './pages/NewsletterEditor';
import AdminDashboard from './pages/AdminDashboard';
import Loader from "./components/Loader";

const queryClient = new QueryClient();

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
              {/* Default route - homepage */}
              <Route path="/" element={<PageTransition><IndexNew /></PageTransition>} />
              
              {/* Admin route - accessible without bypass */}
              <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
              
              {/* Home route */}
              <Route path="/home" element={<PageTransition><IndexNew /></PageTransition>} />
              
              {/* Protected routes - require authentication or admin bypass */}
              <Route 
                path="/newsletter-builder" 
                element={
                  <BypassRoute fallbackPath="/">
                    <ProtectedRoute>
                      <PageTransition>
                        <NewsletterBuilder />
                      </PageTransition>
                    </ProtectedRoute>
                  </BypassRoute>
                } 
              />
              <Route 
                path="/newsletter-editor" 
                element={
                  <BypassRoute fallbackPath="/">
                    <ProtectedRoute>
                      <PageTransition>
                        <NewsletterEditor />
                      </PageTransition>
                    </ProtectedRoute>
                  </BypassRoute>
                } 
              />

              {/* Public routes - accessible to everyone */}
              <Route path="/signin" element={<PageTransition><SignIn /></PageTransition>} />
              <Route path="/auth/callback" element={<PageTransition><AuthCallback /></PageTransition>} />
              <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
              <Route path="/support" element={<PageTransition><Support /></PageTransition>} />
              
              {/* Catch all other routes - redirect to waitlist */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Auth0Provider>
  </ErrorBoundary>
);

export default App;
