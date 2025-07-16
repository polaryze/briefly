import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import IndexNew from "./pages/IndexNew";
import NotFound from "./pages/NotFound";
import NewsletterBuilder from "./pages/NewsletterBuilder";
import AuthCallback from "./pages/AuthCallback";
import SignIn from "./pages/SignIn";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
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
          <Route path="/" element={<Index />} />
          <Route path="/new" element={<IndexNew />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route 
              path="/newsletter-builder" 
              element={
                <ProtectedRoute>
                  <NewsletterBuilder />
                </ProtectedRoute>
              } 
            />
            {/* DEV/DEBUG ROUTE: Remove this in production! */}
            <Route path="/debug-social-apis" element={<DebugSocialAPIs />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
