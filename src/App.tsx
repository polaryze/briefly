import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

// Auth0 configuration
const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  authorizationParams: {
    redirect_uri: `${window.location.origin}/auth/callback`,
    scope: 'openid profile email https://www.googleapis.com/auth/gmail.send',
  },
  // SPA configuration - no client secret
  cacheLocation: 'localstorage' as const,
  useRefreshTokens: true,
};

// Debug logging
console.log('Auth0 Config:', {
  domain: auth0Config.domain,
  clientId: auth0Config.clientId,
  redirect_uri: auth0Config.authorizationParams.redirect_uri,
  scope: auth0Config.authorizationParams.scope,
  currentOrigin: window.location.origin,
  currentHref: window.location.href,
});

const App = () => (
  <ErrorBoundary>
    <Auth0Provider {...auth0Config}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<PageTransition><IndexNew /></PageTransition>} />
              <Route path="/signin" element={<PageTransition><SignIn /></PageTransition>} />
              <Route path="/auth/callback" element={<PageTransition><AuthCallback /></PageTransition>} />
              <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
              <Route path="/support" element={<PageTransition><Support /></PageTransition>} />
              <Route 
                path="/newsletter-builder" 
                element={
                  <PageTransition>
                    <ProtectedRoute>
                      <NewsletterBuilder />
                    </ProtectedRoute>
                  </PageTransition>
                } 
              />
              {/* DEV/DEBUG ROUTE: Remove this in production! */}
              <Route path="/debug-social-apis" element={<PageTransition><DebugSocialAPIs /></PageTransition>} />

              {/* Newsletter Editor */}
              <Route path="/newsletter-editor" element={<PageTransition><NewsletterEditor /></PageTransition>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Auth0Provider>
  </ErrorBoundary>
);

export default App;
