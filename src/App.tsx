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
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/index" element={<Index />} />
          <Route path="/" element={<Auth />} />
          <Route path="/phone-verification" element={<PhoneNumber />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/updates-faq" element={<UpdatesFaq />} />
          <Route path="/api-docs" element={<ApiDocs />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
