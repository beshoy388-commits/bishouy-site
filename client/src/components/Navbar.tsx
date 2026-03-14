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
} from "lucide-react";
import { CATEGORIES } from "@/lib/articles";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import NotificationDrawer from "./NotificationDrawer";
import SearchOverlay from "./SearchOverlay";
import { useUI } from "@/contexts/UIContext";
import AdPlacement from "./AdPlacement";
import { formatDateString } from "@/lib/time-utils";

import BreakingNewsTicker from "./BreakingNewsTicker";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { isSearchOpen, setIsSearchOpen } = useUI();

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

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };
  const handleNotifications = () => {
    setIsNotificationsOpen(true);
    setHasUnread(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMenuOpen
        ? "bg-[#0F0F0E]/95 backdrop-blur-md border-b border-[#222220]"
        : "bg-transparent"
        }`}
    >
      {/* Top bar */}
      <div className="border-b border-[#222220] bg-[#0F0F0E] notranslate">
        <div className="container">
          <div className="flex items-center justify-between h-8">
            <span className="font-ui text-[10px] text-[#8A8880] uppercase tracking-widest">
              {currentDate || "Loading date..."}
            </span>
            <div className="flex items-center gap-4">
              <span className="font-ui text-[10px] text-[#8A8880] uppercase tracking-widest hidden sm:block">
                Live News Updates
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#E8A020] animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="bg-[#0F0F0E]/95 backdrop-blur-sm">
        <div className="container">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left nav — desktop */}
            <nav className="hidden lg:flex items-center gap-6 flex-1">
              {CATEGORIES.slice(0, 3).map(cat => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="font-ui text-xs font-500 text-[#8A8880] hover:text-[#F2F0EB] transition-colors uppercase tracking-wider"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Logo — center */}
            <Link href="/" className="flex-shrink-0 notranslate" aria-label="BISHOUY.COM Home">
              <span className="font-display text-3xl md:text-4xl text-[#F2F0EB] tracking-wider hover:text-[#E8A020] transition-colors block">
                <span>BISHOUY</span>
                <span className="text-[#E8A020]">.</span>
              </span>
            </Link>

            {/* Right nav — desktop */}
            <nav className="hidden lg:flex items-center gap-6 flex-1 justify-end">
              {CATEGORIES.slice(3).map(cat => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="font-ui text-xs font-500 text-[#8A8880] hover:text-[#F2F0EB] transition-colors uppercase tracking-wider"
                >
                  {cat.name}
                </Link>
              ))}
              <button
                onClick={handleSearchClick}
                className="text-[#8A8880] hover:text-[#E8A020] transition-colors"
                aria-label="Open search"
              >
                <Search size={16} />
              </button>
              <button
                onClick={handleNotifications}
                className="text-[#8A8880] hover:text-[#E8A020] transition-colors relative"
                aria-label="Open notifications"
              >
                <Bell size={16} />
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                )}
              </button>
              <Link
                href="/ai"
                className="text-[#8A8880] hover:text-[#E8A020] transition-colors flex items-center gap-1.5"
                title="AI Assistant"
                aria-label="Go to AI Assistant"
              >
                <Sparkles size={16} />
              </Link>
              {user ? (
                <div className="flex items-center gap-4 pl-4 border-l border-[#2A2A28]">
                  {user.role === "admin" && (
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
                <Link
                  href="/login"
                  className="flex items-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-3 py-2 rounded-sm transition-colors"
                >
                  <LogIn size={14} />
                  Login
                </Link>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center gap-3">
              <button
                onClick={handleSearchClick}
                className="text-[#8A8880] hover:text-[#E8A020] transition-colors"
                aria-label="Open search on mobile"
              >
                <Search size={18} />
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[#F2F0EB] hover:text-[#E8A020] transition-colors ml-1"
                aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-[#0F0F0E] border-t border-[#222220]">
          <div className="container py-4">
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="font-ui text-sm text-[#F2F0EB] py-3 border-b border-[#1C1C1A] hover:text-[#E8A020] transition-colors"
              >
                Home
              </Link>
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
                <div className="flex items-center justify-between py-3 border-t border-[#1C1C1A] mt-3">
                  <span className="font-ui text-xs text-[#555550] uppercase tracking-widest">
                    Account
                  </span>
                  <button
                    onClick={async () => {
                      await logout();
                      setIsMenuOpen(false);
                      window.location.href = "/";
                    }}
                    className="flex items-center gap-2 text-red-500/70 hover:text-red-500 transition-colors font-ui text-[10px] uppercase tracking-widest"
                  >
                    <LogOut size={12} />
                    Logout
                  </button>
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
          <div className="bg-[#0A0A09] pt-2 pb-4">
            <div className="container">
              <AdPlacement position="banner_top" />
            </div>
          </div>
          <BreakingNewsTicker />
        </>
      )}
    </header>
  );
}
