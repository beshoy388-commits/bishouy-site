import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import ArticleDetail from "@/pages/ArticleDetail";
import CategoryPage from "@/pages/CategoryPage";
import Search from "@/pages/Search";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import AdminPanel from "@/pages/AdminPanel";
import UserProfile from "@/pages/UserProfile";
import PublicProfile from "@/pages/PublicProfile";
import AIAssistant from "@/pages/AIAssistant";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import VerifyEmail from "@/pages/VerifyEmail";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import CookieConsent from "@/components/CookieConsent";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/articolo/:slug"} component={ArticleDetail} />
      <Route path={"/category/:slug"} component={CategoryPage} />
      <Route path={"/search"} component={Search} />
      <Route path={"/profile"} component={UserProfile} />
      <Route path={"/u/:username"} component={PublicProfile} />
      <Route path={"/privacy-policy"} component={PrivacyPolicy} />
      <Route path={"/terms-of-service"} component={TermsOfService} />
      <Route path={"/admin"} component={AdminPanel} />
      <Route path={"/ai"} component={AIAssistant} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/verify"} component={VerifyEmail} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/reset-password"} component={ResetPassword} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <CookieConsent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
