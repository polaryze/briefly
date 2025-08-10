import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import IndexNew from "./pages/IndexNew";
import NotFound from "./pages/NotFound";
import NewsletterBuilder from "./pages/NewsletterBuilder";
import Pricing from "./pages/Pricing";
import Support from "./pages/Support";
import ErrorBoundary from "./components/ErrorBoundary";
import PageTransition from "./components/PageTransition";
import NewsletterEditor from './pages/NewsletterEditor';
import Loader from "./components/Loader";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Default route - homepage */}
            <Route path="/" element={<PageTransition><IndexNew /></PageTransition>} />
            
            {/* Home route */}
            <Route path="/home" element={<PageTransition><IndexNew /></PageTransition>} />
            
            {/* Newsletter routes - accessible to everyone */}
            <Route path="/newsletter-builder" element={<PageTransition><NewsletterBuilder /></PageTransition>} />
            <Route path="/newsletter-editor" element={<PageTransition><NewsletterEditor /></PageTransition>} />

            {/* Public routes - accessible to everyone */}
            <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
            <Route path="/support" element={<PageTransition><Support /></PageTransition>} />
            
            {/* Catch all other routes - redirect to homepage */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
