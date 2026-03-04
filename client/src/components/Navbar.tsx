/*
 * BISHOUY.COM — Navbar Component
 * Dark Editorial: centered logo, categories on sides, magazine style
 * Font: DM Sans for navigation, Bebas Neue for logo
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Search, Bell, LogIn, LogOut, User as UserIcon, Sparkles } from "lucide-react";
import { CATEGORIES } from "@/lib/articles";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchClick = () => {
    window.location.href = "/search";
  };
  const handleNotifications = () => toast.info("Notifications Coming Soon", { description: "Push notifications will be available soon." });

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-[#0F0F0E]/95 backdrop-blur-md border-b border-[#222220]"
        : "bg-transparent"
        }`}
    >
      {/* Top bar */}
      <div className="border-b border-[#222220] bg-[#0F0F0E]">
        <div className="container">
          <div className="flex items-center justify-between h-8">
            <span className="font-ui text-[10px] text-[#8A8880] uppercase tracking-widest">
              Monday, March 3, 2026
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
              {CATEGORIES.slice(0, 3).map((cat) => (
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
            <Link href="/" className="flex-shrink-0">
              <h1 className="font-display text-3xl md:text-4xl text-[#F2F0EB] tracking-wider hover:text-[#E8A020] transition-colors">
                BISHOUY
                <span className="text-[#E8A020]">.</span>
              </h1>
            </Link>

            {/* Right nav — desktop */}
            <nav className="hidden lg:flex items-center gap-6 flex-1 justify-end">
              {CATEGORIES.slice(3).map((cat) => (
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
                aria-label="Search"
              >
                <Search size={16} />
              </button>
              <button
                onClick={handleNotifications}
                className="text-[#8A8880] hover:text-[#E8A020] transition-colors"
                aria-label="Notifications"
              >
                <Bell size={16} />
              </button>
              <Link
                href="/ai"
                className="text-[#8A8880] hover:text-[#E8A020] transition-colors flex items-center gap-1.5"
                title="AI Assistant"
              >
                <Sparkles size={16} />
              </Link>
              {user ? (
                <div className="flex items-center gap-3 pl-3 border-l border-[#2A2A28]">
                  <Link
                    href="/profile"
                    className="font-ui text-xs text-[#8A8880] hover:text-[#E8A020] transition-colors uppercase tracking-wider"
                  >
                    {user.name || user.email}
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
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              <Link
                href="/ai"
                className="text-[#8A8880] hover:text-[#E8A020] transition-colors"
                aria-label="AI Assistant"
              >
                <Sparkles size={18} />
              </Link>

              {user ? (
                <Link href="/profile" className="text-[#8A8880] hover:text-[#E8A020] transition-colors">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border border-[#2A2A28]"
                    />
                  ) : (
                    <UserIcon size={24} />
                  )}
                </Link>
              ) : (
                <Link href="/login" className="text-[#8A8880] hover:text-[#E8A020] transition-colors">
                  <LogIn size={24} />
                </Link>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[#F2F0EB] hover:text-[#E8A020] transition-colors ml-1"
                aria-label="Menu"
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category bar — desktop */}
      <div className="hidden lg:block border-t border-[#222220] bg-[#0F0F0E]/90 backdrop-blur-sm">
        <div className="container">
          <div className="flex items-center justify-center gap-8 h-10">
            <Link
              href="/"
              className={`font-ui text-[11px] uppercase tracking-widest transition-colors ${location === "/" ? "text-[#E8A020]" : "text-[#8A8880] hover:text-[#F2F0EB]"
                }`}
            >
              Home
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`font-ui text-[11px] uppercase tracking-widest transition-colors ${location === `/category/${cat.slug}`
                  ? "text-[#E8A020]"
                  : "text-[#8A8880] hover:text-[#F2F0EB]"
                  }`}
              >
                {cat.name}
              </Link>
            ))}
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
              {CATEGORIES.map((cat) => (
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
    </header>
  );
}
