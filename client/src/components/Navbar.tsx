/*
 * BISHOUY.COM — Navbar Component
 * Dark Editorial: centered logo, categories on sides, magazine style
 * Font: DM Sans for navigation, Bebas Neue for logo
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import {
  Menu,
  X,
  Search,
  Bell,
  LogIn,
  LogOut,
  User as UserIcon,
  Sparkles,
  Shield,
  UserPlus,
  ArrowRight,
  Eye,
  EyeOff,
  Sun,
  Moon
} from "lucide-react";
import { CATEGORIES } from "@/lib/articles";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import NotificationDrawer from "./NotificationDrawer";
import SearchOverlay from "./SearchOverlay";
import { useUI } from "@/contexts/UIContext";
import { useTheme } from "@/contexts/ThemeContext";
import AdPlacement from "./AdPlacement";
import { formatDateString } from "@/lib/time-utils";

import GlobalTicker from "./GlobalTicker";
import BreakingNewsTicker from "./BreakingNewsTicker";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { isSearchOpen, setIsSearchOpen, isShadowMode, setIsShadowMode } = useUI();
  const { theme, toggleTheme } = useTheme();
  const utils = trpc.useUtils();

  const notificationsQuery = trpc.notifications.getLatest.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const lastRead = localStorage.getItem("notifications_last_read");
    const latestCount = notificationsQuery.data?.length || 0;

    if (latestCount > 0) {
      if (!lastRead || parseInt(lastRead) < Date.now() - 3600000) { // If not read in last hour
        setHasUnread(true);
      }
    }
  }, [notificationsQuery.data]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Set formatted dynamic date
    setCurrentDate(formatDateString(new Date()));

    // Search keyboard shortcut (CMD+K / CTRL+K / /)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
      if (((e.metaKey || e.ctrlKey) && e.key === 'k') || (e.key === '/' && !isInput)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setIsSearchOpen]);

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };
  const handleNotifications = () => {
    setIsNotificationsOpen(true);
    setHasUnread(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled || isMenuOpen
        ? "bg-[#0F0F0E]/95 backdrop-blur-md border-b border-[#222220]"
        : "bg-transparent"
        }`}
    >
      <GlobalTicker />
      {/* Top bar — hidden on mobile to maximize space */}
      <div className="hidden sm:block border-b border-[#222220] bg-[#0F0F0E] notranslate">
        <div className="container">
          <div className="flex items-center justify-between h-7">
            <span className="font-ui text-[9px] text-[#8A8880] uppercase tracking-[0.2em] hidden sm:block">
              {currentDate || "Loading date..."}
            </span>
            <div className="flex items-center gap-3">
              <span className="font-ui text-[9px] text-[#8A8880] uppercase tracking-[0.2em] hidden sm:block">
                Global Network
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="bg-[#0F0F0E]/95 backdrop-blur-sm relative z-30 border-b border-[#222220]/50">
        <div className="container">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Desktop: Left Utilities */}
            <div className="hidden lg:flex items-center gap-8 flex-1">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[#8A8880] hover:text-[#F2F0EB] transition-colors flex items-center gap-2 font-ui text-[10px] uppercase tracking-widest font-bold"
              >
                <Menu size={16} />
                Menu
              </button>
              <button
                onClick={handleSearchClick}
                className="text-[#8A8880] hover:text-[#E8A020] transition-colors flex items-center gap-2 font-ui text-[10px] uppercase tracking-widest font-bold"
              >
                <Search size={16} />
                Search
              </button>
              <Link
                href="/ai"
                className="text-[#8A8880] hover:text-[#E8A020] transition-colors flex items-center gap-2 font-ui text-[10px] uppercase tracking-widest font-bold ml-2"
                title="AI Assistant"
              >
                <Sparkles size={16} />
                AI Assistant
              </Link>
            </div>

            {/* Mobile: Menu Toggle (Left) */}
            <div className="flex lg:hidden items-center flex-1">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[#F2F0EB] hover:text-[#E8A020] transition-colors"
                aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Logo — center (Desktop & Mobile) */}
            <div className="flex-shrink-0 flex justify-center absolute left-1/2 -translate-x-1/2">
              <Link href="/" className="notranslate" aria-label="BISHOUY.COM Home">
                <span className="font-display text-xl sm:text-2xl md:text-2xl lg:text-3xl text-[#F2F0EB] tracking-tighter hover:text-[#E8A020] transition-all block leading-none">
                  <span>BISHOUY</span>
                  <span className="text-[#E8A020]">.</span>
                </span>
              </Link>
            </div>

            {/* Right Utilities — desktop */}
            <div className="hidden lg:flex items-center gap-6 flex-1 justify-end">
              <button
                onClick={handleNotifications}
                className="text-[#8A8880] hover:text-[#E8A020] transition-colors relative"
                aria-label="Open notifications"
              >
                <Bell size={18} />
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                )}
              </button>

              {utils.auth.me.getData() || user ? (
                <div className="flex items-center gap-4 pl-4 border-l border-[#2A2A28]">
                  {user?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-1.5 text-[#E8A020] hover:text-[#F2F0EB] transition-colors font-ui text-[10px] font-600 uppercase tracking-widest"
                      title="Admin Panel"
                    >
                      <Shield size={14} />
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 text-[#8A8880] hover:text-[#E8A020] transition-colors font-ui text-[10px] font-600 uppercase tracking-widest"
                    title="Your Profile"
                  >
                    <UserIcon size={14} />
                    Profile
                  </Link>
                  <button
                    onClick={async () => {
                      await logout();
                      window.location.href = "/";
                    }}
                    className="text-[#8A8880] hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <>
                  {!utils.auth.me.getData() && (
                    <Link
                      href="/login"
                      className="flex items-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-sm transition-colors"
                    >
                      <LogIn size={14} />
                      Login
                    </Link>
                  )}
                </>
              )}

              {/* Shadow Mode Toggle — Desktop */}
              <button
                onClick={() => {
                  const newState = !isShadowMode;
                  setIsShadowMode(newState);
                  if (newState) {
                    toast.success("Shadow Analysis Enabled", { 
                      description: "Advanced intelligence verification active.",
                      duration: 3000 
                    });
                  } else {
                    toast.info("Shadow Analysis Disabled", { duration: 2000 });
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-all duration-300 font-ui text-[10px] font-900 uppercase tracking-widest ${isShadowMode ? "text-[#E8A020] bg-[#E8A020]/10 border border-[#E8A020]/30" : "text-[#555550] border border-transparent hover:text-[#8A8880]"}`}
                title={isShadowMode ? "Exit Shadow Analysis" : "Enter Shadow Analysis"}
              >
                {isShadowMode ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{isShadowMode ? "Clearance: Shadow" : "Clearance: Standard"}</span>
              </button>

            </div>

            {/* Mobile: Search (Right) */}
            <div className="flex lg:hidden items-center justify-end flex-1 gap-6">
              <button
                onClick={() => setIsShadowMode(!isShadowMode)}
                className={`p-2 rounded-sm transition-all ${isShadowMode ? "text-[#E8A020] bg-[#E8A020]/10" : "text-[#8A8880]"}`}
              >
                {isShadowMode ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

              <button
                onClick={handleNotifications}
                className="text-[#8A8880] relative"
              >
                <Bell size={18} />
                {hasUnread && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />}
              </button>
              <button
                onClick={handleSearchClick}
                className="text-[#8A8880] hover:text-[#E8A020] transition-colors"
                aria-label="Open search on mobile"
              >
                <Search size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Category bar — tight and premium */}
        <div className="hidden lg:block border-t border-[#222220] py-3 bg-[#0F0F0E]/50">
          <div className="container">
            <nav className="flex items-center justify-center gap-10">
              {CATEGORIES.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="font-ui text-[9px] font-800 text-[#8A8880] hover:text-[#F2F0EB] transition-colors uppercase tracking-[0.25em]"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 h-[calc(100vh-60px)] bg-[#0F0F0E] z-[40] overflow-y-auto border-t border-[#222220]">
          <div className="container py-8 pb-32">
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="font-ui text-sm text-[#F2F0EB] py-3 border-b border-[#1C1C1A] hover:text-[#E8A020] transition-colors flex items-center justify-between"
              >
                Home
                <ArrowRight size={14} className="text-[#333330]" />
              </Link>
              <Link
                href="/ai"
                onClick={() => setIsMenuOpen(false)}
                className="font-ui text-sm text-[#E8A020] py-3 border-b border-[#1C1C1A] flex items-center gap-2"
              >
                <Sparkles size={16} />
                Editorial Intelligence (AI)
              </Link>
              <div className="py-2 mt-2">
                <span className="font-ui text-[10px] text-[#555550] uppercase tracking-widest font-bold">Categories</span>
              </div>
              {CATEGORIES.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="font-ui text-sm text-[#8A8880] py-3 border-b border-[#1C1C1A] hover:text-[#E8A020] transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              {user && (
                <div className="flex flex-col gap-1 mt-6 pt-6 border-t border-[#1C1C1A]">
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="font-ui text-sm text-[#8A8880] py-3 border-b border-[#1C1C1A] flex items-center gap-2"
                  >
                    <UserIcon size={16} />
                    Intelligence Library
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="font-ui text-sm text-[#E8A020] py-3 border-b border-[#1C1C1A] flex items-center gap-2"
                    >
                      <Shield size={16} />
                      System Control
                    </Link>
                  )}
                  <div className="flex items-center justify-between py-4">
                    <span className="font-ui text-xs text-[#555550] uppercase tracking-widest">
                      Session
                    </span>
                    <button
                      onClick={async () => {
                        await logout();
                        setIsMenuOpen(false);
                        window.location.href = "/";
                      }}
                      className="flex items-center gap-2 text-red-500/70 hover:text-red-500 transition-colors font-ui text-[10px] uppercase tracking-widest font-bold"
                    >
                      <LogOut size={14} />
                      Terminate Session
                    </button>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      {!location.startsWith("/admin") && (
        <>
          <AdPlacement
            position="banner_top"
            className="bg-[#0A0A09] py-3 border-b border-[#1C1C1A]"
          />
        </>
      )}
    </header>
  );
}
