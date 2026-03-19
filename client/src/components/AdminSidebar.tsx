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
    Bell,
    Image as ImageIcon,
    Zap,
    Activity,
    Terminal,
    Cpu,
    CpuIcon,
    Radio
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    onLogout: () => void;
    className?: string;
}

export default function AdminSidebar({
    activeTab,
    setActiveTab,
    isCollapsed,
    setIsCollapsed,
    onLogout,
    className = ""
}: AdminSidebarProps) {
    const [, setLocation] = useLocation();
    const pendingComments = trpc.comments.getPending.useQuery();
    const pendingCount = pendingComments.data?.length || 0;

    const flaggedPosts = trpc.social.adminList.useQuery({ status: 'flagged' });
    const flaggedCount = flaggedPosts.data?.length || 0;

    const groups = [
        {
            label: "Intelligence Hub",
            items: [
                { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                { id: "articles", label: "Articles", icon: FileText },
            ]
        },
        {
            label: "Editorial Ops",
            items: [
                { id: "comments", label: "Comments", icon: MessageSquare, badge: pendingCount > 0 ? pendingCount : undefined },
                { id: "newsletter", label: "Newsletter", icon: Send },
            ]
        },
        {
            label: "System Control",
            items: [
                { id: "users", label: "Users", icon: User },
                { id: "security", label: "Terminal", icon: Terminal },
                { id: "settings", label: "Settings", icon: Settings },
            ]
        }
    ];

    return (
        <div
            className={`fixed top-0 left-0 h-screen bg-[#0A0A09] border-r border-[#1C1C1A] transition-all duration-500 z-[120] flex flex-col ${isCollapsed ? "w-20" : "w-64"} ${className}`}
        >
            {/* High-Fidelity Brand Header */}
            <div className="h-24 flex items-center px-6 border-b border-[#1C1C1A] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8A020]/20 to-transparent animate-pulse" />
                {!isCollapsed ? (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border border-[#E8A020]/40 flex items-center justify-center relative group">
                            <div className="absolute inset-0 bg-[#E8A020]/10 animate-pulse group-hover:bg-[#E8A020]/20 transition-colors" />
                            <Cpu size={20} className="text-[#E8A020] relative z-10" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display text-xl text-[#F2F0EB] tracking-tighter leading-none">BISHOUY<span className="text-[#E8A020]">.</span></span>
                            <span className="text-[8px] font-900 text-[#555550] uppercase tracking-[0.3em] mt-1 font-ui">Command Core</span>
                        </div>
                    </div>
                ) : (
                    <div className="w-10 h-10 border border-[#E8A020]/40 flex items-center justify-center relative mx-auto group">
                        <div className="absolute inset-0 bg-[#E8A020]/5 group-hover:bg-[#E8A020]/20 transition-colors" />
                        <Cpu size={20} className="text-[#E8A020] relative z-10" />
                    </div>
                )}
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 py-8 px-4 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
                {groups.map((group, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                        {!isCollapsed && (
                            <div className="px-3 mb-2 flex items-center justify-between">
                                <span className="text-[9px] font-900 text-[#333330] uppercase tracking-[0.3em] font-ui">{group.label}</span>
                                <div className="h-[1px] flex-1 ml-4 bg-[#1C1C1A]" />
                            </div>
                        )}
                        <div className="flex flex-col gap-1">
                            {group.items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center gap-3 px-3 py-3 relative group transition-all duration-300 ${activeTab === item.id
                                        ? "text-[#F2F0EB]"
                                        : "text-[#555550] hover:text-[#8A8880]"
                                        }`}
                                >
                                    {/* Active Highlight */}
                                    {activeTab === item.id && (
                                        <motion.div 
                                            layoutId="active-indicator"
                                            className="absolute left-0 w-1 h-6 bg-[#E8A020] rounded-r-full"
                                        />
                                    )}
                                    
                                    <div className={`transition-colors duration-300 ${activeTab === item.id ? "text-[#E8A020]" : "group-hover:text-[#F2F0EB]"}`}>
                                        <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 1.5} />
                                    </div>

                                    {!isCollapsed && (
                                        <span className={`font-ui text-[11px] font-800 uppercase tracking-widest transition-opacity duration-300 ${activeTab === item.id ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}>
                                            {item.label}
                                        </span>
                                    )}

                                    {item.badge !== undefined && (
                                        <span className={`absolute ${isCollapsed ? "top-1 right-1" : "right-3"} flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-900 rounded-sm`}>
                                            {item.badge}
                                        </span>
                                    )}

                                    {/* Tooltip for collapsed state */}
                                    {isCollapsed && (
                                        <div className="absolute left-full ml-4 px-3 py-2 bg-[#F2F0EB] text-[#0F0F0E] text-[10px] font-900 uppercase tracking-widest border-l-4 border-[#E8A020] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-[130] shadow-2xl">
                                            {item.label}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Tactical Footer */}
            <div className="p-4 bg-[#0F0F0E] border-t border-[#1C1C1A] flex flex-col gap-2">
                <button
                    onClick={onLogout}
                    className={`flex items-center gap-3 px-3 py-3 relative group transition-all text-[#555550] hover:text-red-500 overflow-hidden`}
                >
                    <LogOut size={18} />
                    {!isCollapsed && (
                        <span className="font-ui text-[11px] font-900 uppercase tracking-widest">Terminate Session</span>
                    )}
                    <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-colors" />
                </button>
                
                <Link href="/">
                    <button className={`flex items-center gap-3 px-3 py-3 relative group transition-all text-[#555550] hover:text-[#E8A020]`}>
                        <ExternalLink size={18} />
                        {!isCollapsed && (
                            <span className="font-ui text-[11px] font-900 uppercase tracking-widest">Public Uplink</span>
                        )}
                    </button>
                </Link>
            </div>

            {/* Tactical Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-32 w-6 h-6 bg-[#11110F] border border-[#E8A020]/40 text-[#E8A020] rounded-sm flex items-center justify-center z-[130] hover:bg-[#E8A020] hover:text-[#0F0F0E] transition-all hidden lg:flex shadow-2xl"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
        </div>
    );
}
