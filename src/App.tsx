import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
