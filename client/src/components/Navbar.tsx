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
  Sun,
  Moon,
  Zap
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
        ? "bg-[#0F0F0E] border-b border-[#222220]"
        : "bg-transparent"
        }`}
    >

      {/* Top bar — hidden on mobile to maximize space */}
      <div className="hidden sm:block border-b border-[#222220] bg-[#0F0F0E] notranslate">
        <div className="container">
          <div className="flex items-center justify-between h-7">
            <span className="font-ui text-[9px] text-[#8A8880] uppercase tracking-[0.2em] hidden sm:block">
              {currentDate || "Loading date..."}
            </span>
            <div className="flex items-center gap-3">
              <span className="font-ui text-[9px] text-[#8A8880] uppercase tracking-[0.2em] hidden sm:block">
                Editorial Network
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
              <Link
                href="/pricing"
                className="text-[#E8A020] hover:text-[#F2F0EB] transition-colors flex items-center gap-2 font-ui text-[10px] uppercase tracking-widest font-900 ml-2"
                title="Premium Membership"
              >
                <Zap size={16} fill="currentColor" />
                Premium
              </Link>
            </div>

            {/* Mobile: Menu Toggle (Left) */}
            <div className="flex lg:hidden items-center flex-1">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[#F2F0EB] hover:text-[#E8A020] transition-colors"
                aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Logo — center (Desktop & Mobile) */}
            <div className="flex-shrink-0 flex justify-center absolute left-1/2 -translate-x-1/2">
              <Link href="/" className="notranslate" aria-label="BISHOUY.COM Home">
                <span className="font-display text-3xl sm:text-3xl md:text-4xl lg:text-5xl text-[#F2F0EB] tracking-tighter hover:text-[#E8A020] transition-all block leading-none">
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
                    className="flex items-center gap-2 group"
                    title="Your Profile"
                  >
                    <div className="flex items-center gap-1.5 text-[#8A8880] group-hover:text-[#E8A020] transition-colors font-ui text-[10px] font-600 uppercase tracking-widest">
                       <UserIcon size={14} />
                       Profile
                    </div>
                    {user?.subscriptionTier === 'founder' && (
                      <span className="bg-[#E8A020] text-[#0F0F0E] px-1.5 py-0.5 rounded-[1px] text-[7px] font-900 tracking-tighter uppercase shadow-[0_0_10px_rgba(232,160,32,0.3)]">
                        Founder
                      </span>
                    )}
                    {user?.subscriptionTier === 'premium' && (
                      <span className="bg-[#1C1C1A] border border-[#E8A020]/30 text-[#E8A020] px-1.5 py-0.5 rounded-[1px] text-[7px] font-900 tracking-tighter uppercase">
                        Premium
                      </span>
                    )}
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
                    <div className="flex items-center gap-3">
                      <Link
                        href="/login"
                        className="flex items-center gap-2 text-[#8A8880] hover:text-[#E8A020] font-ui text-[10px] font-bold uppercase tracking-widest px-2 py-2 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="flex items-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-sm transition-colors"
                      >
                        <UserPlus size={14} />
                        Register
                      </Link>
                    </div>
                  )}
                </>
              )}


            </div>

            <div className="flex lg:hidden items-center justify-end flex-1 gap-6">

              <button
                onClick={handleNotifications}
                className="text-[#8A8880] relative"
              >
                <Bell size={22} />
                {hasUnread && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />}
              </button>
              <button
                onClick={handleSearchClick}
                className="text-[#8A8880] hover:text-[#E8A020] transition-colors"
                aria-label="Open search on mobile"
              >
                <Search size={22} />
              </button>
            </div>
          </div>
        </div>
        <GlobalTicker />

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
                AI Assistant
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
                    className="font-ui text-sm text-[#8A8880] py-3 border-b border-[#1C1C1A] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <UserIcon size={16} />
                      Personal Library
                    </div>
                    <div className="flex gap-2">
                       {user.subscriptionTier === 'founder' && (
                         <span className="bg-[#E8A020] text-[#0F0F0E] px-2 py-0.5 rounded-[1px] text-[8px] font-900 uppercase">Founder</span>
                       )}
                       {user.subscriptionTier === 'premium' && (
                         <span className="bg-[#1C1C1A] border border-[#E8A020]/30 text-[#E8A020] px-2 py-0.5 rounded-[1px] text-[8px] font-900 uppercase">Premium</span>
                       )}
                       <ArrowRight size={14} className="text-[#333330]" />
                    </div>
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="font-ui text-sm text-[#E8A020] py-3 border-b border-[#1C1C1A] flex items-center gap-2"
                    >
                      <Shield size={16} />
                      Dashboard Admin
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
                      Logout
                    </button>
                  </div>
                </div>
              )}
              {!user && (
                <div className="flex flex-col gap-1 mt-6 pt-6 border-t border-[#1C1C1A]">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="font-ui text-sm text-[#F2F0EB] py-3 border-b border-[#1C1C1A] flex items-center justify-between"
                  >
                    Login
                    <LogIn size={14} className="text-[#333330]" />
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="font-ui text-sm text-[#E8A020] py-3 border-b border-[#1C1C1A] flex items-center justify-between"
                  >
                    Register
                    <UserPlus size={14} />
                  </Link>
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
