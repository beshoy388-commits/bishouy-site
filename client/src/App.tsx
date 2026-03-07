import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import CookieConsent from "@/components/CookieConsent";
import BackToTop from "@/components/BackToTop";
import { Loader2 } from "lucide-react";

// Home and common components remain eager for instant first load
import Home from "@/pages/Home";

// Pages are lazy-loaded to reduce initial bundle size (addressing "unused JavaScript")
const ArticleDetail = lazy(() => import("@/pages/ArticleDetail"));
const CategoryPage = lazy(() => import("@/pages/CategoryPage"));
const Search = lazy(() => import("@/pages/Search"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const PublicProfile = lazy(() => import("@/pages/PublicProfile"));
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));
const AIAssistant = lazy(() => import("@/pages/AIAssistant"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const Unsubscribe = lazy(() => import("@/pages/Unsubscribe"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// About Pages
const AboutUs = lazy(() => import("@/pages/AboutUs"));
const EditorialTeam = lazy(() => import("@/pages/EditorialTeam"));
const MissionValues = lazy(() => import("@/pages/MissionValues"));
const Contact = lazy(() => import("@/pages/Contact"));
const Careers = lazy(() => import("@/pages/Careers"));
const CodeOfEthics = lazy(() => import("@/pages/CodeOfEthics"));

const PageFallback = () => (
  <div className="min-h-screen bg-[#0F0F0E] flex items-center justify-center">
    <Loader2 className="animate-spin text-[#E8A020]" size={40} />
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/articolo/:slug" component={ArticleDetail} />
        <Route path="/category/:slug" component={CategoryPage} />
        <Route path="/search" component={Search} />
        <Route path="/profile" component={UserProfile} />
        <Route path="/u/:username" component={PublicProfile} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/ai" component={AIAssistant} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/verify" component={VerifyEmail} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/unsubscribe" component={Unsubscribe} />
        <Route path="/about" component={AboutUs} />
        <Route path="/editorial-team" component={EditorialTeam} />
        <Route path="/mission-values" component={MissionValues} />
        <Route path="/contact" component={Contact} />
        <Route path="/careers" component={Careers} />
        <Route path="/code-of-ethics" component={CodeOfEthics} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

const Maintenance = lazy(() => import("@/pages/Maintenance"));

function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { data: status, isLoading } = trpc.system.getStatus.useQuery(undefined, {
    refetchInterval: 60000,
  });
  const { user } = useAuth();

  if (isLoading) return <PageFallback />;
  if (status?.maintenance && user?.role !== "admin") {
    return (
      <Suspense fallback={<PageFallback />}>
        <Maintenance />
      </Suspense>
    );
  }

  return <>{children}</>;
}

import { UIProvider, useUI } from "./contexts/UIContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import { trpc } from "./lib/trpc";
import { useAuth } from "./_core/hooks/useAuth";

function AppContent() {
  const { setIsSearchOpen } = useUI();
  return (
    <MaintenanceGuard>
      <Toaster />
      <Router />
      <CookieConsent />
      <BackToTop />
      <MobileBottomNav onSearchClick={() => setIsSearchOpen(true)} />
    </MaintenanceGuard>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <UIProvider>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </UIProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
