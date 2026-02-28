import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import TaskerDashboard from "./pages/TaskerDashboard";
import HelperDashboard from "./pages/HelperDashboard";
import HelperProfile from "./pages/HelperProfile";
import PostTask from "./pages/PostTask";
import TaskBrowse from "./pages/TaskBrowse";
import TaskDetail from "./pages/TaskDetail";
import AadhaarVerification from "./pages/AadhaarVerification";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/tasker/dashboard" element={<TaskerDashboard />} />
            <Route path="/tasker/post-task" element={<PostTask />} />
            <Route path="/helper/dashboard" element={<HelperDashboard />} />
            <Route path="/helper/profile" element={<HelperProfile />} />
            <Route path="/tasks" element={<TaskBrowse />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="/verification/aadhaar" element={<AadhaarVerification />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
