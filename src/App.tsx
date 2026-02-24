/**
 * The main application component.
 * This component sets up the main routing for the application and includes global providers like QueryClientProvider and TooltipProvider.
 */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Canteen from "./pages/Canteen";
import Announcements from "./pages/Announcements";
import Clubs from "./pages/Clubs";
import ShuttleBus from "./pages/ShuttleBus";
import AdminLogin from "./pages/AdminLogin";
import InternationalPrograms from "./pages/InternationalPrograms";
import AdminPanel from "./pages/AdminPanel";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/canteen" element={<Canteen />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/clubs" element={<Clubs />} />
              <Route path="/shuttle-bus" element={<ShuttleBus />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/international-programs" element={<InternationalPrograms />} />
              <Route
                path="/admin-panel"
                element={<ProtectedRoute><AdminPanel /></ProtectedRoute>}
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
