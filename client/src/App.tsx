import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import CookieConsent from "@/components/CookieConsent";
import BackToTop from "@/components/BackToTop";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
const FactCheckingPolicy = lazy(() => import("@/pages/FactCheckingPolicy"));
const AIEthics = lazy(() => import("@/pages/AIEthics"));
const CookiePolicy = lazy(() => import("@/pages/CookiePolicy"));
const Advertise = lazy(() => import("@/pages/Advertise"));

const PageFallback = () => (
  <div className="min-h-screen bg-[#0F0F0E] flex items-center justify-center">
    <Loader2 className="animate-spin text-[#E8A020]" size={40} />
  </div>
);

const AuthCallback = lazy(() => import("@/pages/AuthCallback"));

function Router() {
  const [location] = useLocation();

  return (
    <Suspense fallback={<PageFallback />}>
      <AnimatePresence mode="wait">
        <motion.div
           key={location}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/article/:slug" component={ArticleDetail} />
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
            <Route path="/auth/callback" component={AuthCallback} />
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
            <Route path="/fact-checking" component={FactCheckingPolicy} />
            <Route path="/ai-ethics" component={AIEthics} />
            <Route path="/nexus" component={NeuralNexus} />
            <Route path="/cookie-policy" component={CookiePolicy} />
            <Route path="/advertise" component={Advertise} />
            <Route path="/404" component={NotFound} />
            <Route component={NotFound} />
          </Switch>
        </motion.div>
      </AnimatePresence>
    </Suspense>
  );
}

const Maintenance = lazy(() => import("@/pages/Maintenance"));

function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { data: status } = trpc.system.getStatus.useQuery(undefined, {
    staleTime: 30000, // 30 seconds for faster state updates
  });
  const { user } = useAuth();

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
import { useLocation } from "wouter";
import LiveAnalyticsTracker from "@/components/LiveAnalyticsTracker";
import UserStatusMonitor from "@/components/UserStatusMonitor";

import GoogleAdSense from "@/components/GoogleAdSense";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import NewsletterModal from "@/components/NewsletterModal";
import CommandPalette from "@/components/CommandPalette";
import ScrollToTop from "@/components/ScrollToTop";
import { AudioProvider } from "@/contexts/AudioContext";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import NeuralNotificationCenter from "@/components/NeuralNotificationCenter";

const NeuralNexus = lazy(() => import("@/pages/NeuralNexus"));

function AppContent() {
  const { setIsSearchOpen, isShadowMode } = useUI();
  const [location] = useLocation();
  const isAdminPage = location.startsWith("/admin");
  const isAuthPage = location.startsWith("/login") || location.startsWith("/register") || location.startsWith("/verify");

  useEffect(() => {
    if (isShadowMode) {
      document.documentElement.classList.add('shadow-mode-active');
    } else {
      document.documentElement.classList.remove('shadow-mode-active');
    }
  }, [isShadowMode]);

  return (
    <MaintenanceGuard>
      <ScrollToTop />
      <Toaster />
      <GlobalAudioPlayer />
      <NeuralNotificationCenter />
      <LiveAnalyticsTracker />
      <UserStatusMonitor />
      <GoogleAdSense />
      <GoogleAnalytics />
      {/* 
        Dynamic Layout Container 
        pt-[160px] (10rem) on mobile, pt-[220px] on desktop 
        Optimized to show more content above the fold while preventing header overlap.
        Added pb-32 for mobile for the floating navigation.
      */}
      <div className={!isAdminPage ? `min-h-screen pt-[160px] lg:pt-[195px] ${!isAdminPage ? "pb-32 lg:pb-0" : ""}` : "min-h-screen"}>
        <Router />
      </div>
      <NewsletterModal />
      <CommandPalette />
      <CookieConsent />
      <BackToTop />
      {!isAdminPage && <MobileBottomNav onSearchClick={() => setIsSearchOpen(true)} />}
    </MaintenanceGuard>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <UIProvider>
          <AudioProvider>
            <TooltipProvider>
              <AppContent />
            </TooltipProvider>
          </AudioProvider>
        </UIProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
