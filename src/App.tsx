import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminFilesProvider } from "@/contexts/AdminFilesContext";
import { ResearcherActivityProvider } from "@/contexts/ResearcherActivityContext";

// Public Pages
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UploadFiles from "./pages/admin/UploadFiles";
import AnonymizeFiles from "./pages/admin/AnonymizeFiles";
import ManageFiles from "./pages/admin/ManageFiles";
import AdminSettings from "./pages/admin/AdminSettings";

// Researcher Pages
import ResearcherDashboard from "./pages/researcher/ResearcherDashboard";
import BrowseDataset from "./pages/researcher/BrowseDataset";
import FileDetails from "./pages/researcher/FileDetails";
import About from "./pages/researcher/About";
import ResearcherProfile from "./pages/researcher/ResearcherProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminFilesProvider>
        <ResearcherActivityProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Admin Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/upload" element={<UploadFiles />} />
              <Route path="/admin/anonymize" element={<AnonymizeFiles />} />
              <Route path="/admin/files" element={<ManageFiles />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            {/* Researcher Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/researcher/dashboard" element={<ResearcherDashboard />} />
              <Route path="/researcher/browse" element={<BrowseDataset />} />
              <Route path="/researcher/file/:id" element={<FileDetails />} />
              <Route path="/researcher/about" element={<About />} />
              <Route path="/researcher/profile" element={<ResearcherProfile />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ResearcherActivityProvider>
      </AdminFilesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
