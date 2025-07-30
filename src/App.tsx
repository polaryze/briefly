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

// Waitlist redirect component
const WaitlistRedirect = () => {
  return <Navigate to="/" replace />;
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
              {/* Main waitlist page */}
              <Route path="/" element={<PageTransition><IndexNew /></PageTransition>} />
              
              {/* Redirect all other routes to waitlist */}
              <Route path="/signin" element={<WaitlistRedirect />} />
              <Route path="/auth/callback" element={<WaitlistRedirect />} />
              <Route path="/pricing" element={<WaitlistRedirect />} />
              <Route path="/support" element={<WaitlistRedirect />} />
              <Route path="/newsletter-builder" element={<WaitlistRedirect />} />
              <Route path="/debug-social-apis" element={<WaitlistRedirect />} />
              <Route path="/newsletter-editor" element={<WaitlistRedirect />} />
              
              {/* Catch all other routes */}
              <Route path="*" element={<WaitlistRedirect />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Auth0Provider>
  </ErrorBoundary>
);

export default App;
