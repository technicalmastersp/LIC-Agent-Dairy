import { lazy, Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/hooks/useLanguage";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import PageLoader from "./components/PageLoader";
import ScrollToTop from "./components/ScrollToTop";
import GlobalToastListener from "./components/GlobalToastListener";
import FloatingHelpButton from "./components/FloatingHelpButton";
import OfflineBanner from "./components/OfflineBanner";

// Landing and Login are on the critical path for first paint — they stay
// eager so the very first route a visitor hits doesn't wait on a chunk.
import Landing from "./pages/Landing";
import Login from "./pages/Login";

// Every other page is code-split: App.tsx used to eagerly import all 38
// page components, shipping the entire app in one bundle. Each of these
// now becomes its own chunk, fetched only when its route is visited.
const Home = lazy(() => import("./pages/Home"));
const AddRecord = lazy(() => import("./pages/AddRecord"));
const ImportRecords = lazy(() => import("./pages/ImportRecords"));
const ViewRecords = lazy(() => import("./pages/ViewRecords"));
const CurrentMonthDue = lazy(() => import("./pages/CurrentMonthDue"));
const UpcomingDuePolicies = lazy(() => import("./pages/UpcomingDuePolicies"));
const MissedPayments = lazy(() => import("./pages/MissedPayments"));
const About = lazy(() => import("./pages/About"));
const Profile = lazy(() => import("./pages/Profile"));
const SignUp = lazy(() => import("./pages/SignUp"));
const OurPlans = lazy(() => import("./pages/OurPlans"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LicInfoHub = lazy(() => import("./pages/LicInfoHub"));
const ToolsHub = lazy(() => import("./pages/tools/ToolsHub"));
const AgeCalculator = lazy(() => import("./pages/tools/AgeCalculator"));
const SipCalculator = lazy(() => import("./pages/tools/SipCalculator"));
const IncomeTaxCalculator = lazy(() => import("./pages/tools/IncomeTaxCalculator"));
const HomeLoanEmiCalculator = lazy(() => import("./pages/tools/HomeLoanEmiCalculator"));
const TermInsuranceCalculator = lazy(() => import("./pages/tools/TermInsuranceCalculator"));
const InflationCalculator = lazy(() => import("./pages/tools/InflationCalculator"));
const ReferralProgram = lazy(() => import("./pages/ReferralProgram"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const HelpSupport = lazy(() => import("./pages/HelpSupport"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const MyActivity = lazy(() => import("./pages/MyActivity"));
const SessionManagement = lazy(() => import("./pages/SessionManagement"));
const NotificationPreferences = lazy(() => import("./pages/NotificationPreferences"));

const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminUserDetail = lazy(() => import("./pages/admin/AdminUserDetail"));
const AdminAdmins = lazy(() => import("./pages/admin/AdminAdmins"));
const WithdrawalRequests = lazy(() => import("./pages/admin/WithdrawalRequests"));
const PaymentVerifications = lazy(() => import("./pages/admin/PaymentVerifications"));
const AdminLogs = lazy(() => import("./pages/admin/AdminLogs"));
const AdminSupportTickets = lazy(() => import("./pages/admin/AdminSupportTickets"));
const AdminSuggestions = lazy(() => import("./pages/admin/AdminSuggestions"));
const AdminRevenue = lazy(() => import("./pages/admin/AdminRevenue"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    {/* Outermost provider (aside from ErrorBoundary) — Sonner already
        calls next-themes' useTheme() from inside LanguageProvider below,
        so ThemeProvider must wrap at least that deep. Placed at the very
        top instead so the `dark` class lands on <html> as early as
        possible in the render, avoiding a flash of the wrong theme. It
        has no dependency on QueryClientProvider/LanguageProvider, so the
        ordering relative to them doesn't otherwise matter. */}
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <Toaster />
          <Sonner />
          <GlobalToastListener />
          <OfflineBanner />
          <BrowserRouter>
            <ScrollToTop />
            <FloatingHelpButton />
            {/* A second, more granular boundary around just the routed page
                content: if one page's render throws, the persistent chrome
                above (toasts, offline banner, help button, scroll-restore)
                stays mounted and usable instead of the whole app unmounting. */}
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/" element={<Landing />} />
                  <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                  <Route path="/add-record" element={<ProtectedRoute><AddRecord /></ProtectedRoute>} />
                  <Route path="/import-records" element={<ProtectedRoute><ImportRecords /></ProtectedRoute>} />
                  <Route path="/view-records" element={<ProtectedRoute><ViewRecords /></ProtectedRoute>} />
                  <Route path="/view-due-policies" element={<ProtectedRoute><CurrentMonthDue /></ProtectedRoute>} />
                  <Route path="/view-upcoming-due" element={<ProtectedRoute><UpcomingDuePolicies /></ProtectedRoute>} />
                  <Route path="/view-missed-payments" element={<ProtectedRoute><MissedPayments /></ProtectedRoute>} />
                  <Route path="/about" element={<About />} />
                  <Route path="/help-support" element={<HelpSupport />} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/our-plans" element={<OurPlans />} />
                  <Route path="/lic-info-hub" element={<LicInfoHub />} />
                  <Route path="/tools" element={<ToolsHub />} />
                  <Route path="/tools/age-calculator" element={<AgeCalculator />} />
                  <Route path="/tools/sip-calculator" element={<SipCalculator />} />
                  <Route path="/tools/income-tax-calculator" element={<IncomeTaxCalculator />} />
                  <Route path="/tools/home-loan-emi-calculator" element={<HomeLoanEmiCalculator />} />
                  <Route path="/tools/term-insurance-calculator" element={<TermInsuranceCalculator />} />
                  <Route path="/tools/inflation-calculator" element={<InflationCalculator />} />
                  <Route path="/referral-program" element={<ProtectedRoute><ReferralProgram /></ProtectedRoute>} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                  <Route path="/my-activity" element={<ProtectedRoute><MyActivity /></ProtectedRoute>} />
                  <Route path="/sessions" element={<ProtectedRoute><SessionManagement /></ProtectedRoute>} />
                  <Route path="/notification-preferences" element={<ProtectedRoute><NotificationPreferences /></ProtectedRoute>} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                  <Route path="/admin" element={<ProtectedRoute roles={["admin", "superadmin"]}><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute roles={["admin", "superadmin"]}><AdminUsers /></ProtectedRoute>} />
                  {/* AdminUserDetail previously had no auth/role guard at all — a
                      pre-existing gap, not a behavior this refactor preserves.
                      Gated the same as its parent /admin/users list. */}
                  <Route path="/admin/users/:userId" element={<ProtectedRoute roles={["admin", "superadmin"]}><AdminUserDetail /></ProtectedRoute>} />
                  <Route path="/admin/admins" element={<ProtectedRoute roles={["superadmin"]}><AdminAdmins /></ProtectedRoute>} />
                  <Route path="/admin/withdrawals" element={<ProtectedRoute roles={["admin", "superadmin"]}><WithdrawalRequests /></ProtectedRoute>} />
                  <Route path="/admin/payment-verifications" element={<ProtectedRoute roles={["admin", "superadmin"]}><PaymentVerifications /></ProtectedRoute>} />
                  <Route path="/admin/logs" element={<ProtectedRoute roles={["superadmin"]}><AdminLogs /></ProtectedRoute>} />
                  <Route path="/admin/support" element={<ProtectedRoute roles={["admin", "superadmin"]}><AdminSupportTickets /></ProtectedRoute>} />
                  <Route path="/admin/suggestions" element={<ProtectedRoute roles={["admin", "superadmin"]}><AdminSuggestions /></ProtectedRoute>} />
                  <Route path="/admin/revenue" element={<ProtectedRoute roles={["admin", "superadmin"]}><AdminRevenue /></ProtectedRoute>} />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;