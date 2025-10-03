import "./App.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PhoneNumber from "./pages/PhoneNumber";
import Auth from "./pages/Auth";
import UpdatesFaq from "./pages/UpdatesFaq";
import { OTPVerification } from "@/components/auth/OTPVerification";
import ApiDocs from "./pages/ApiDocs";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import ProfilePage from "./pages/ProfilePage";
import Privacy from "./pages/Privacy";
import Termandconditions from "./pages/Termandconditions";
import SkillScore from "./pages/SkillScore";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Protected Routes - Require Authentication */}
            <Route
              path="/index"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/phone-verification"
              element={
                <ProtectedRoute>
                  <PhoneNumber />
                </ProtectedRoute>
              }
            />
            <Route
              path="/otp-verification"
              element={
                <ProtectedRoute>
                  <OTPVerification />
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <Jobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job/:id"
              element={
                <ProtectedRoute>
                  <JobDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/skill-score/:skillId"
              element={
                <ProtectedRoute>
                  <SkillScore />
                </ProtectedRoute>
              }
            />

            <Route
              path="/updates-faq"
              element={
                <ProtectedRoute>
                  <UpdatesFaq />
                </ProtectedRoute>
              }
            />
            <Route
              path="/api-docs"
              element={
                <ProtectedRoute>
                  <ApiDocs />
                </ProtectedRoute>
              }
            />

            {/* Public Routes - No Authentication Required */}
            <Route path="/" element={<Auth />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Termandconditions />} />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

