import { useState } from "react";
import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    User,
    Megaphone,
    Send,
    Settings,
    Shield,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Bell
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    onLogout: () => void;
}

export default function AdminSidebar({
    activeTab,
    setActiveTab,
    isCollapsed,
    setIsCollapsed,
    onLogout
}: AdminSidebarProps) {
    const [, setLocation] = useLocation();
    const pendingComments = trpc.comments.getPending.useQuery();
    const pendingCount = pendingComments.data?.length || 0;

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "articles", label: "Articles", icon: FileText },
        { id: "comments", label: "Comments", icon: MessageSquare, badge: pendingCount > 0 ? pendingCount : undefined },
        { id: "users", label: "Users", icon: User },
        { id: "ads", label: "Advertisements", icon: Megaphone },
        { id: "newsletter", label: "Newsletter", icon: Send },
        { id: "settings", label: "Site Settings", icon: Settings },
        { id: "system", label: "System Status", icon: Shield },
    ];

    return (
        <div
            className={`fixed top-0 left-0 h-screen bg-[#11110F] border-r border-[#1C1C1A] transition-all duration-300 z-[100] flex flex-col ${isCollapsed ? "w-20" : "w-64"
                }`}
        >
            {/* Brand */}
            <div className="h-20 flex items-center px-6 border-b border-[#1C1C1A]">
                {!isCollapsed ? (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#E8A020] rounded-sm flex items-center justify-center font-display text-[#0F0F0E] font-bold">B</div>
                        <span className="font-display text-xl text-[#F2F0EB] tracking-tighter">BISHOUY<span className="text-[#E8A020]">.</span></span>
                    </div>
                ) : (
                    <div className="w-8 h-8 bg-[#E8A020] rounded-sm flex items-center justify-center font-display text-[#0F0F0E] font-bold mx-auto">B</div>
                )}
            </div>

            {/* Profile Mini (Admin) */}
            <div className={`p-4 border-b border-[#1C1C1A] ${isCollapsed ? "text-center" : "px-6"}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E8A020]/10 border border-[#E8A020]/30 flex items-center justify-center shrink-0">
                        <Shield size={20} className="text-[#E8A020]" />
                    </div>
                    {!isCollapsed && (
                        <div className="min-w-0">
                            <p className="text-[10px] text-[#8A8880] uppercase tracking-widest font-600">Administrator</p>
                            <p className="text-sm text-[#F2F0EB] font-headline truncate">Control Center</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative ${activeTab === item.id
                            ? "bg-[#E8A020] text-[#0F0F0E]"
                            : "text-[#8A8880] hover:text-[#F2F0EB] hover:bg-[#1C1C1A]"
                            }`}
                    >
                        <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                        {!isCollapsed && (
                            <span className="font-ui text-sm font-600 tracking-wide">{item.label}</span>
                        )}

                        {item.badge !== undefined && (
                            <span className={`absolute ${isCollapsed ? "-top-1 -right-1" : "right-3"} flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${activeTab === item.id ? "bg-[#0F0F0E] text-[#E8A020]" : "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                }`}>
                                {item.badge}
                            </span>
                        )}

                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                            <div className="absolute left-full ml-4 px-2 py-1 bg-[#F2F0EB] text-[#0F0F0E] text-[10px] font-bold uppercase tracking-widest rounded-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[110]">
                                {item.label}
                            </div>
                        )}
                    </button>
                ))}
            </nav>

            {/* Footer Actions */}
            <div className="p-3 border-t border-[#1C1C1A] flex flex-col gap-1">
                <Link href="/">
                    <button className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-[#8A8880] hover:text-[#E8A020] hover:bg-[#1C1C1A] transition-all group relative`}>
                        <ExternalLink size={20} />
                        {!isCollapsed && <span className="font-ui text-sm font-600">View Website</span>}
                        {isCollapsed && (
                            <div className="absolute left-full ml-4 px-2 py-1 bg-[#F2F0EB] text-[#0F0F0E] text-[10px] font-bold uppercase tracking-widest rounded-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[110]">
                                View Website
                            </div>
                        )}
                    </button>
                </Link>
                <button
                    onClick={onLogout}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-500/70 hover:text-red-500 hover:bg-red-500/5 transition-all group relative`}
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="font-ui text-sm font-600">Logout Session</span>}
                    {isCollapsed && (
                        <div className="absolute left-full ml-4 px-2 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[110]">
                            Logout
                        </div>
                    )}
                </button>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-24 w-6 h-6 bg-[#E8A020] text-[#0F0F0E] rounded-full flex items-center justify-center shadow-lg border-2 border-[#11110F] hover:scale-110 transition-transform hidden lg:flex"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
        </div>
    );
}
