import { Home, Newspaper, Sparkles, Search, User, Bookmark } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function MobileBottomNav({ onSearchClick }: { onSearchClick: () => void }) {
    const [location] = useLocation();
    const { user } = useAuth();

    const isActive = (path: string) => location === path;

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0F0F0E]/80 backdrop-blur-xl border-t border-[#2A2A28] px-2 pb-safe">
            <div className="flex items-center justify-around h-16">
                <Link href="/">
                    <button className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${isActive("/") ? "text-[#E8A020]" : "text-[#8A8880]"}`}>
                        <Home size={20} strokeWidth={isActive("/") ? 2.5 : 2} />
                        <span className="text-[10px] font-ui font-700 uppercase tracking-tighter">Home</span>
                    </button>
                </Link>

                {/* Categories Link or Newspaper icon */}
                <Link href="/category/cronaca">
                    <button className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${location.startsWith("/category") ? "text-[#E8A020]" : "text-[#8A8880]"}`}>
                        <Newspaper size={20} strokeWidth={location.startsWith("/category") ? 2.5 : 2} />
                        <span className="text-[10px] font-ui font-700 uppercase tracking-tighter">News</span>
                    </button>
                </Link>

                <Link href="/news-ai">
                    <button className="flex flex-col items-center justify-center -mt-6">
                        <div className="w-12 h-12 rounded-full bg-[#E8A020] flex items-center justify-center shadow-lg shadow-[#E8A020]/20 border-4 border-[#0F0F0E]">
                            <Sparkles size={20} className="text-[#0F0F0E]" fill="currentColor" />
                        </div>
                        <span className="text-[10px] font-ui font-800 text-[#E8A020] uppercase tracking-tighter mt-1">AI</span>
                    </button>
                </Link>

                <button
                    onClick={onSearchClick}
                    className="flex flex-col items-center justify-center gap-1 w-full h-full text-[#8A8880] active:text-[#E8A020] transition-colors"
                >
                    <Search size={20} />
                    <span className="text-[10px] font-ui font-700 uppercase tracking-tighter">Search</span>
                </button>

                {user ? (
                    <Link href="/profile">
                        <button className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${isActive("/profile") ? "text-[#E8A020]" : "text-[#8A8880]"}`}>
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} className="w-5 h-5 rounded-full border border-current" alt="" />
                            ) : (
                                <User size={20} strokeWidth={isActive("/profile") ? 2.5 : 2} />
                            )}
                            <span className="text-[10px] font-ui font-700 uppercase tracking-tighter">Profile</span>
                        </button>
                    </Link>
                ) : (
                    <Link href="/login">
                        <button className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${isActive("/login") ? "text-[#E8A020]" : "text-[#8A8880]"}`}>
                            <User size={20} strokeWidth={isActive("/login") ? 2.5 : 2} />
                            <span className="text-[10px] font-ui font-700 uppercase tracking-tighter">Login</span>
                        </button>
                    </Link>
                )}
            </div>
        </div>
    );
}
