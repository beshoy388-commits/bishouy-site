import { Home, Newspaper, Sparkles, Search, User, Bookmark } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function MobileBottomNav({ onSearchClick }: { onSearchClick: () => void }) {
    const [location] = useLocation();
    const { user } = useAuth();

    const isActive = (path: string) => location === path;

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0F0F0E]/90 backdrop-blur-xl border-t border-[#2A2A28] px-1 pb-safe shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between h-16 w-full">
                <Link href="/">
                    <button className={`flex-1 flex flex-col items-center justify-center min-w-[64px] h-full transition-all duration-300 ${isActive("/") ? "text-[#E8A020]" : "text-[#8A8880]"}`}>
                        <Home size={20} strokeWidth={isActive("/") ? 2.5 : 2} />
                        <span className="text-[9px] font-ui font-700 uppercase tracking-tighter mt-1">Home</span>
                    </button>
                </Link>

                <Link href="/category/world">
                    <button className={`flex-1 flex flex-col items-center justify-center min-w-[64px] h-full transition-all duration-300 ${location.startsWith("/category") ? "text-[#E8A020]" : "text-[#8A8880]"}`}>
                        <Newspaper size={20} strokeWidth={location.startsWith("/category") ? 2.5 : 2} />
                        <span className="text-[9px] font-ui font-700 uppercase tracking-tighter mt-1">News</span>
                    </button>
                </Link>

                <Link href="/ai">
                    <button className="flex-1 flex flex-col items-center justify-center min-w-[64px] -mt-5">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isActive("/ai") ? "bg-[#E8A020] shadow-[#E8A020]/30" : "bg-[#2A2A28] shadow-black/50 hover:bg-[#3A3A38]"} border-[3px] border-[#0F0F0E]`}>
                            <Sparkles size={18} className={isActive("/ai") ? "text-[#0F0F0E]" : "text-[#F2F0EB]"} fill="currentColor" />
                        </div>
                        <span className={`text-[9px] font-ui font-800 uppercase tracking-tighter mt-1 ${isActive("/ai") ? "text-[#E8A020]" : "text-[#8A8880]"}`}>AI</span>
                    </button>
                </Link>

                <button
                    onClick={onSearchClick}
                    className="flex-1 flex flex-col items-center justify-center min-w-[64px] h-full text-[#8A8880] active:text-[#E8A020] transition-all duration-300"
                >
                    <Search size={20} />
                    <span className="text-[9px] font-ui font-700 uppercase tracking-tighter mt-1">Search</span>
                </button>

                {user ? (
                    <Link href="/profile">
                        <button className={`flex-1 flex flex-col items-center justify-center min-w-[64px] h-full transition-all duration-300 ${isActive("/profile") ? "text-[#E8A020]" : "text-[#8A8880]"}`}>
                            {user.avatarUrl ? (
                                <div className={`w-5 h-5 rounded-full border overflow-hidden ${isActive("/profile") ? "border-[#E8A020]" : "border-[#8A8880]"}`}>
                                    <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
                                </div>
                            ) : (
                                <User size={20} strokeWidth={isActive("/profile") ? 2.5 : 2} />
                            )}
                            <span className="text-[9px] font-ui font-700 uppercase tracking-tighter mt-1">Profile</span>
                        </button>
                    </Link>
                ) : (
                    <Link href="/login">
                        <button className={`flex-1 flex flex-col items-center justify-center min-w-[64px] h-full transition-all duration-300 ${isActive("/login") ? "text-[#E8A020]" : "text-[#8A8880]"}`}>
                            <User size={20} strokeWidth={isActive("/login") ? 2.5 : 2} />
                            <span className="text-[9px] font-ui font-700 uppercase tracking-tighter mt-1">Login</span>
                        </button>
                    </Link>
                )}
            </div>
        </div>
    );
}
