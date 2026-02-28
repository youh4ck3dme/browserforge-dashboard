import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BrowserForgeProvider } from "@/contexts/BrowserForgeContext";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import BrowserEditor from "./pages/BrowserEditor";
import FleetManagement from "./pages/FleetManagement";
import SecurityAudit from "./pages/SecurityAudit";
import BuildHistory from "./pages/BuildHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserForgeProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/editor" element={<BrowserEditor />} />
              <Route path="/fleet" element={<FleetManagement />} />
              <Route path="/security" element={<SecurityAudit />} />
              <Route path="/history" element={<BuildHistory />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </BrowserForgeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
