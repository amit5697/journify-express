
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Journal from "./pages/Journal";
import DietPlanner from "./pages/DietPlanner";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";
import GeminiChatbot from "./components/GeminiChatbot";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
  }, []);
  
  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/signin" />;
};

const App = () => {
  // Determine which chatbot context to use based on the current path
  const [chatbotContext, setChatbotContext] = useState("general assistance");
  
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      
      if (path.includes('journal')) {
        setChatbotContext("journaling and self-reflection");
      } else if (path.includes('diet-planner')) {
        setChatbotContext("nutrition and meal planning");
      } else {
        setChatbotContext("general assistance");
      }
    };
    
    // Set initial context
    handleRouteChange();
    
    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/journal" element={
                <ProtectedRoute>
                  <Journal />
                </ProtectedRoute>
              } />
              <Route path="/diet-planner" element={
                <ProtectedRoute>
                  <DietPlanner />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Global chatbot component (except on homepage and signin) */}
            <RouteBasedChatbot context={chatbotContext} />
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

// Component to conditionally render chatbot based on the current route
const RouteBasedChatbot = ({ context }: { context: string }) => {
  const [shouldShow, setShouldShow] = useState(false);
  
  useEffect(() => {
    const path = window.location.pathname;
    // Don't show on homepage or signin page
    setShouldShow(path !== '/' && path !== '/signin');
    
    const handleRouteChange = () => {
      const currentPath = window.location.pathname;
      setShouldShow(currentPath !== '/' && currentPath !== '/signin');
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);
  
  if (!shouldShow) return null;
  
  return <GeminiChatbot context={context} />;
};

export default App;
