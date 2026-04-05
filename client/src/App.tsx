import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UIProvider, useUI } from "./contexts/UIContext";
import { AudioProvider } from "./contexts/AudioContext";
import { useAuth } from "./_core/hooks/useAuth";
import { trpc } from "./lib/trpc";

import CookieConsent from "@/components/CookieConsent";
import BackToTop from "@/components/BackToTop";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Home and common components remain eager for instant first load
import Home from "@/pages/Home";
import MobileBottomNav from "@/components/MobileBottomNav";
import LiveAnalyticsTracker from "@/components/LiveAnalyticsTracker";
import UserStatusMonitor from "@/components/UserStatusMonitor";
import GoogleAdSense from "@/components/GoogleAdSense";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import NewsletterModal from "@/components/NewsletterModal";
import CommandPalette from "@/components/CommandPalette";
import ScrollToTop from "@/components/ScrollToTop";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import NeuralNotificationCenter from "@/components/NeuralNotificationCenter";

// Pages are lazy-loaded to reduce initial bundle size
const ArticleDetail = lazy(() => import("@/pages/ArticleDetail"));
const Pricing = lazy(() => import("@/pages/Pricing"));
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
const LegalNotice = lazy(() => import("@/pages/LegalNotice"));
const Unsubscribe = lazy(() => import("@/pages/Unsubscribe"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Maintenance = lazy(() => import("@/pages/Maintenance"));
const NeuralNexus = lazy(() => import("@/pages/NeuralNexus"));

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
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));

const PageFallback = () => (
  <div className="min-h-screen bg-[#0F0F0E] flex flex-col">
    {/* Skeleton Header to prevent black structural flash */}
    <div className="h-[90px] lg:h-[135px] border-b border-[#222220] bg-[#0F0F0E] w-full shrink-0 relative z-[100]" />
    <div className="flex-1 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[#E8A020] blur-3xl opacity-5 animate-pulse w-64 h-64 mx-auto my-auto rounded-full" />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <Loader2 className="animate-spin text-[#E8A020]" size={32} />
          <span className="text-[#8A8880] font-ui text-[10px] font-900 uppercase tracking-[0.2em]">Synchronizing</span>
        </div>
    </div>
  </div>
);

function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageFallback />}>
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
            <Route path="/pricing" component={Pricing} />
            <Route path="/profile" component={UserProfile} />
            <Route path="/u/:username" component={PublicProfile} />
            <Route path="/privacy-policy" component={PrivacyPolicy} />
            <Route path="/terms-of-service" component={TermsOfService} />
            <Route path="/legal-notice" component={LegalNotice} />
            <Route path="/admin" component={AdminPanel} />
            <Route path="/admin/:rest*" component={AdminPanel} />
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
            <Route path="/logout" component={() => {
              window.location.href = "/";
              return null;
            }} />
            <Route component={NotFound} />
          </Switch>
        </motion.div>
      </Suspense>
    </AnimatePresence>
  );
}

function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { data: status } = trpc.system.getStatus.useQuery(undefined, {
    staleTime: 30000,
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

function AppContent() {
  const { setIsSearchOpen, isShadowMode } = useUI();
  const [location] = useLocation();
  const isAdminPage = location.startsWith("/admin");

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
      <div className={!isAdminPage ? `min-h-screen pt-[140px] lg:pt-[195px] ${!isAdminPage ? "pb-32 lg:pb-0" : ""}` : "min-h-screen"}>
        <Router />
      </div>
      <NewsletterModal />
      <CommandPalette />
      <CookieConsent />
      <BackToTop />
      {!isAdminPage && <MobileBottomNav onSearchClick={() => setIsSearchOpen(true)} />}
      <div className="noise-overlay" />
    </MaintenanceGuard>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable={false}>
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
