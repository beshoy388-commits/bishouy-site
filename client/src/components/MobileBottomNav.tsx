import { Home, Newspaper, Sparkles, Search, User, Bookmark } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function MobileBottomNav({ onSearchClick }: { onSearchClick: () => void }) {
    const [location] = useLocation();
    const { user } = useAuth();

    const isActive = (path: string) => location === path;

    return (
        <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
            <div className="bg-[#0F0F0E]/80 backdrop-blur-2xl border border-[#2A2A28] rounded-2xl h-20 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.8)] px-1">
                <div className="grid grid-cols-5 items-center h-full w-full">
                    {/* Home */}
                    <Link href="/">
                        <button className={`w-full flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isActive("/") ? "text-[#E8A020]" : "text-[#8A8880]"}`}>
                            <div className={`p-2 rounded-full transition-colors ${isActive("/") ? "bg-[#E8A020]/10" : "bg-transparent"}`}>
                                <Home size={20} strokeWidth={isActive("/") ? 2.5 : 2} />
                            </div>
                            <span className="text-[8px] font-ui font-900 uppercase tracking-widest leading-none">Home</span>
                        </button>
                    </Link>

                    {/* News */}
                    <Link href="/category/world">
                        <button className={`w-full flex flex-col items-center justify-center gap-1 transition-all duration-300 ${location.startsWith("/category") ? "text-[#E8A020]" : "text-[#8A8880]"}`}>
                            <div className={`p-2 rounded-full transition-colors ${location.startsWith("/category") ? "bg-[#E8A020]/10" : "bg-transparent"}`}>
                                <Newspaper size={20} strokeWidth={location.startsWith("/category") ? 2.5 : 2} />
                            </div>
                            <span className="text-[8px] font-ui font-900 uppercase tracking-widest leading-none text-center">News</span>
                        </button>
                    </Link>

                    {/* AI - Central Node */}
                    <div className="flex justify-center relative -top-6">
                        <Link href="/ai">
                            <button className="flex flex-col items-center justify-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(232,160,32,0.4)] transition-all duration-500 transform ${isActive("/ai") ? "bg-[#E8A020] scale-110" : "bg-[#11110F] hover:bg-[#1C1C1A] active:scale-95"} border-[4px] border-[#0F0F0E]`}>
                                    <Sparkles size={26} className={isActive("/ai") ? "text-[#0F0F0E]" : "text-[#E8A020]"} fill={isActive("/ai") ? "currentColor" : "none"} />
                                </div>
                                <span className={`text-[9px] font-ui font-800 uppercase tracking-[0.2em] mt-2 whitespace-nowrap px-2 py-0.5 rounded-sm bg-[#0F0F0E]/40 backdrop-blur-md ${isActive("/ai") ? "text-[#E8A020]" : "text-[#8A8880]"}`}>AI CORE</span>
                            </button>
                        </Link>
                    </div>

                    {/* Search */}
                    <button
                        onClick={onSearchClick}
                        className="w-full flex flex-col items-center justify-center gap-1 text-[#8A8880] active:text-[#E8A020] transition-all duration-300"
                    >
                        <div className="p-2">
                            <Search size={20} strokeWidth={2} />
                        </div>
                        <span className="text-[8px] font-ui font-900 uppercase tracking-widest leading-none">Search</span>
                    </button>

                    {/* Profile/Login */}
                    {user ? (
                        <Link href="/profile">
                            <button className={`w-full flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isActive("/profile") ? "text-[#E8A020]" : "text-[#8A8880]"}`}>
                                {user.avatarUrl ? (
                                    <div className={`w-6 h-6 rounded-full border-2 overflow-hidden ${isActive("/profile") ? "border-[#E8A020]" : "border-[#8A8880]"}`}>
                                        <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
                                    </div>
                                ) : (
                                    <div className={`p-2 rounded-full transition-colors ${isActive("/profile") ? "bg-[#E8A020]/10" : "bg-transparent"}`}>
                                        <User size={20} strokeWidth={isActive("/profile") ? 2.5 : 2} />
                                    </div>
                                )}
                                <span className="text-[8px] font-ui font-900 uppercase tracking-widest leading-none">Profile</span>
                            </button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <button className={`w-full flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isActive("/login") ? "text-[#E8A020]" : "text-[#8A8880]"}`}>
                                <div className={`p-2 rounded-full transition-colors ${isActive("/login") ? "bg-[#E8A020]/10" : "bg-transparent"}`}>
                                    <User size={20} strokeWidth={isActive("/login") ? 2.5 : 2} />
                                </div>
                                <span className="text-[8px] font-ui font-900 uppercase tracking-widest leading-none">Login</span>
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
