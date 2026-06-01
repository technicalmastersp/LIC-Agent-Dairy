import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/hooks/useLanguage";
import Home from "./pages/Home";
import AddRecord from "./pages/AddRecord";
import ViewRecords from "./pages/ViewRecords";
import CurrentMonthDue from "./pages/CurrentMonthDue";
import MissedPayments from "./pages/MissedPayments";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import OurPlans from "./pages/OurPlans";
import NotFound from "./pages/NotFound";
import LicInfoHub from "./pages/LicInfoHub";
import ReferralProgram from "./pages/ReferralProgram";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<Home />} />
            <Route path="/add-record" element={<AddRecord />} />
            <Route path="/view-records" element={<ViewRecords />} />
            <Route path="/view-due-policies" element={<CurrentMonthDue />} />
            <Route path="/view-missed-payments" element={<MissedPayments />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/our-plans" element={<OurPlans />} />
            <Route path="/lic-info-hub" element={<LicInfoHub />} />
            <Route path="/referral-program" element={<ReferralProgram />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;