/*
 * BISHOUY.COM — Admin Panel
 * Secure admin interface for managing articles, users and comments
 * Only accessible to admin users
 */

import { useEffect, useState, lazy, Suspense } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

// Lazy loading the heavy admin modules
const ArticleForm = lazy(() => import("@/components/ArticleForm"));
const UsersManagement = lazy(() => import("./UsersManagement"));
const DashboardStats = lazy(() => import("@/components/DashboardStats"));
const NewsletterManager = lazy(() => import("@/components/NewsletterManager"));
const GlobalComments = lazy(() => import("@/components/GlobalComments"));
const SiteSettings = lazy(() => import("@/components/SiteSettings"));
const SystemTerminal = lazy(() => import("@/components/SystemTerminal"));

import AdminSidebar from "@/components/AdminSidebar";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Eye,
  Bot,
  FileText,
  CheckCircle,
  Menu,
  ChevronRight,
  ShieldAlert,
  Terminal,
  User,
  TrendingUp,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";


export default function AdminPanel() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "articles"
    | "users"
    | "comments"
    | "newsletter"
    | "settings"
    | "security"
    | "system"
    | "analytics"
    | "ads"
    | "media"
    | "pulse"
    | "live"
    | "moderation"
  >("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    if (user?.role !== "admin") {
      toast.error("Access Denied", {
        description: "You do not have admin privileges",
      });
      window.location.href = "/";
    }
  }, [isAuthenticated, user, loading]);

  const articlesQuery = trpc.articles.listAdmin.useQuery();
  const maintenanceStatus = trpc.system.getStatus.useQuery();
  const triggerAiMutation = trpc.ai.triggerNewsGeneration.useMutation();

  const deleteArticleMutation = trpc.articles.delete.useMutation({
    onSuccess: () => {
      toast.success("Article deleted successfully");
      articlesQuery.refetch();
    },
    onError: error => {
      toast.error("Failed to delete article", { description: error.message });
    },
  });

  const publishArticleMutation = trpc.articles.update.useMutation({
    onSuccess: () => {
      toast.success("Article published successfully!");
      articlesQuery.refetch();
    },
    onError: error => {
      toast.error("Failed to publish article", { description: error.message });
    },
  });

  const handlePublish = (id: number) => {
    publishArticleMutation.mutate({ id, status: "published" });
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this article?")) {
      deleteArticleMutation.mutate({ id });
    }
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0F0F0E] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#E8A020] mx-auto mb-4" size={32} />
          <p className="text-[#8A8880] font-ui uppercase tracking-widest text-[10px]">Authorizing Access...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardStats
            onTabChange={tab => setActiveTab(tab)}
            onNewArticle={() => {
              setActiveTab("articles");
              setShowForm(true);
            }}
          />
        );
      case "articles":
        if (showForm) {
          return (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="group flex items-center gap-2 text-[#8A8880] hover:text-[#E8A020] transition-colors font-ui text-xs uppercase tracking-widest"
                >
                  <span className="w-8 h-8 rounded-full bg-[#1C1C1A] border border-[#2A2A28] flex items-center justify-center group-hover:border-[#E8A020] transition-all">←</span>
                  Back to List
                </button>
                <div className="h-px flex-1 bg-gradient-to-r from-[#2A2A28] to-transparent ml-6" />
              </div>
              <ArticleForm
                articleId={editingId || undefined}
                onSuccess={() => {
                  setShowForm(false);
                  setEditingId(null);
                  articlesQuery.refetch();
                }}
              />
            </div>
          );
        }
        return (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="font-headline text-3xl text-[#F2F0EB] mb-2 uppercase tracking-tight">
                  Publisher HQ
                </h2>
                <div className="flex items-center gap-4 text-[#8A8880]">
                  <p className="font-ui text-xs uppercase tracking-widest">
                    Index: <span className="text-[#F2F0EB] font-700">{articlesQuery.data?.length || 0}</span>
                  </p>
                  <span className="w-1 h-1 rounded-full bg-[#2A2A28]" />
                  <p className="font-ui text-xs uppercase tracking-widest">
                    Queue: <span className="text-blue-400 font-700">{articlesQuery.data?.filter(a => a.status === 'draft').length || 0}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1.5 items-end">
                  <button
                    onClick={() => {
                      triggerAiMutation.mutate(undefined, {
                        onSuccess: (data) => {
                          if (data.success) {
                            toast.success(data.message || "Article generated successfully.");
                            articlesQuery.refetch();
                          } else {
                            toast.error(data.message || "Generation failed.");
                          }
                        },
                        onError: (error) => {
                          toast.error("AI Technical Error", {
                            description: "The AI server timed out or did not respond. Please try again in 1 minute."
                          });
                        }
                      });
                    }}
                    className="flex items-center justify-center gap-2 bg-[#1C1C1A] border border-[#2A2A28] hover:border-[#E8A020] text-[#E8A020] font-ui text-[10px] md:text-xs font-700 uppercase tracking-widest px-5 py-3 rounded-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    disabled={triggerAiMutation.isPending}
                  >
                    {triggerAiMutation.isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Generating Intelligence (30s)...
                      </>
                    ) : (
                      <>
                        <Bot size={16} />
                        Trigger Neural Synthesis (AI)
                      </>
                    )}
                  </button>
                  <span className="text-[8px] text-[#555550] uppercase tracking-tighter">Initiate news synthesis and automated content generation</span>
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setShowForm(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-[10px] md:text-xs font-700 uppercase tracking-widest px-8 py-3 rounded-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#E8A020]/20"
                  >
                    <Plus size={16} />
                    Create Manual Draft
                  </button>
                  <span className="text-[8px] text-[#555550] uppercase tracking-tighter">Open editor for a new human-written article</span>
                </div>
              </div>
            </div>

            {/* Hardware-inspired Status Toggle */}
            <div className="flex items-center gap-1 mb-10 bg-[#0F0F0E] p-1 border border-[#1C1C1A] w-fit relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8A020]/10 to-transparent" />
              {[
                { id: "all", label: "Global Index", color: "text-[#F2F0EB]" },
                { id: "published", label: "Broadcast Active", color: "text-green-500" },
                { id: "draft", label: "Pending Intel", color: "text-blue-500" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-6 py-2.5 relative transition-all duration-300 font-ui text-[9px] font-900 uppercase tracking-[0.2em] ${statusFilter === tab.id ? "text-[#0F0F0E]" : "text-[#555550] hover:text-[#8A8880]"}`}
                >
                  <span className="relative z-10">{tab.label}</span>
                  {statusFilter === tab.id && (
                    <motion.div 
                      layoutId="tab-bg"
                      className="absolute inset-0 bg-[#E8A020]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>


            {articlesQuery.isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#E8A020]" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {articlesQuery.data
                  ?.filter(a =>
                    statusFilter === "all" ? true : a.status === statusFilter
                  )
                  .map(article => (
                    <div 
                      key={article.id}
                      className={`group bg-[#11110F] border border-[#1C1C1A] p-6 hover:border-[#E8A020]/30 transition-all relative overflow-hidden ${article.status === 'draft' ? "border-l-2 border-l-blue-500/50" : "border-l-2 border-l-[#E8A020]/50"}`}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-2">
                             <span className="text-[8px] font-900 px-2 py-0.5 border border-[#1C1C1A] text-[#8A8880] uppercase tracking-widest">
                                ID: {article.id.toString().padStart(4, '0')}
                             </span>
                             {article.author === "Redazione AI" ? (
                               <span className="flex items-center gap-1.5 text-[8px] font-900 px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest">
                                 <Bot size={10} /> Neural Auth
                               </span>
                             ) : (
                               <span className="flex items-center gap-1.5 text-[8px] font-900 px-2 py-0.5 bg-[#E8A020]/10 text-[#E8A020] border border-[#E8A020]/20 uppercase tracking-widest">
                                 <User size={10} /> Human Auth
                               </span>
                             )}
                           </div>
                           <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2">
                                <TrendingUp size={10} className="text-green-500/50" />
                                <span className="text-[10px] font-900 text-[#555550] uppercase tracking-widest font-ui">{article.viewCount || 0} IMPULSE</span>
                             </div>
                           </div>
                        </div>

                        <div className="flex-1 mb-6">
                           <div className="flex items-center gap-2 mb-2">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: article.categoryColor || '#E8A020' }} />
                              <span className="text-[9px] font-900 text-[#555550] uppercase tracking-widest font-ui">{article.category}</span>
                           </div>
                           <h3 className="font-headline text-xl text-[#F2F0EB] group-hover:text-[#E8A020] transition-colors line-clamp-2 leading-tight uppercase tracking-tight">
                              {article.title}
                           </h3>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-[#1C1C1A] mt-auto">
                           <div className="text-[9px] font-900 text-[#333330] uppercase tracking-widest font-ui">
                              Deployed: {new Date(article.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                           </div>
                           
                           <div className="flex items-center gap-1">
                              {article.status === "draft" && (
                                <button
                                  onClick={() => handlePublish(article.id)}
                                  disabled={publishArticleMutation.isPending}
                                  className="w-10 h-10 flex items-center justify-center bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-[#0F0F0E] border border-green-500/20 transition-all rounded-sm"
                                  title="Deploy to Broadcast"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditingId(article.id);
                                  setShowForm(true);
                                }}
                                className="w-10 h-10 flex items-center justify-center bg-[#1C1C1A] text-[#8A8880] hover:text-[#E8A020] border border-[#1C1C1A] hover:border-[#E8A020]/30 transition-all rounded-sm"
                                title="Modify Node"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(article.id)}
                                className="w-10 h-10 flex items-center justify-center bg-[#1C1C1A] text-[#8A8880] hover:text-red-500 border border-[#1C1C1A] hover:border-red-500/30 transition-all rounded-sm"
                                title="Terminate Asset"
                              >
                                <Trash2 size={16} />
                              </button>
                              <a
                                href={`/article/${article.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center bg-[#1C1C1A] text-[#8A8880] hover:text-[#F2F0EB] border border-[#1C1C1A] transition-all rounded-sm"
                                title="Preview Uplink"
                              >
                                <ChevronRight size={16} />
                              </a>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

            )}
          </div>
        );
      case "users":
        return <UsersManagement />;
      case "comments":
        return <GlobalComments />;
      case "newsletter":
        return <NewsletterManager />;
      case "settings":
        return <SiteSettings />;
      case "security":
        return <SystemTerminal />;
      default:
        return <div>Tab not implemented</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A09] text-[#F2F0EB] selection:bg-[#E8A020] selection:text-[#0F0F0E]">
      {/* Sidebar - Desktop */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
          setShowForm(false);
          setEditingId(null);
        }}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onLogout={handleLogout}
        className="hidden lg:flex z-[100]"
      />

      {/* Main Layout Area */}
      <div
        className={`transition-all duration-300 min-h-screen flex flex-col ${isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
          }`}
      >
        {/* Top Header Barra — Tactical HUD */}
        <header className="h-20 lg:h-24 border-b border-[#1C1C1A] bg-[#0A0A09]/80 backdrop-blur-2xl sticky top-0 z-[110] flex items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 text-[#555550] hover:text-[#E8A020] transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#E8A020] animate-pulse" />
                 <h2 className="font-ui text-[10px] font-900 uppercase tracking-[0.5em] text-[#F2F0EB]">
                    Core Command Terminal
                 </h2>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-[8px] font-800 text-[#555550] uppercase tracking-widest font-ui">Nodal Path:</span>
                 <span className="text-[9px] font-900 text-[#E8A020] uppercase tracking-[0.2em] font-ui flex items-center gap-2">
                    {activeTab} <ChevronRight size={10} strokeWidth={3} /> {showForm ? (editingId ? "Edit" : "Create") : "Index"}
                 </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-10">
            {/* System Telemetry — Desktop only */}
            <div className="hidden xl:flex items-center gap-10 pr-10 border-r border-[#1C1C1A]/50">
                <div className="text-right">
                    <p className="text-[8px] font-900 text-[#555550] uppercase tracking-widest mb-1">Signal Integrity</p>
                    <span className="text-[10px] font-900 text-[#22c55e] uppercase tracking-tighter">99.9% LOCKED</span>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-900 text-[#555550] uppercase tracking-widest mb-1">Neural Latency</p>
                    <span className="text-[10px] font-900 text-[#E8A020] uppercase tracking-tighter">42ms RESPONSE</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end mr-4">
                    <span className="text-[10px] font-ui font-900 text-[#F2F0EB] uppercase tracking-[0.2em]">{user?.name}</span>
                    <span className="text-[9px] font-ui text-[#E8A020] uppercase tracking-[0.1em] font-800">Clearance: Root</span>
                </div>
                <button
                onClick={() => setActiveTab("security")}
                className={`relative p-3 rounded-sm border border-transparent transition-all ${activeTab === 'security' ? 'text-[#E8A020] bg-[#E8A020]/5 border-[#E8A020]/20' : 'text-[#333330] hover:text-[#8A8880] hover:bg-[#1C1C1A]'}`}
                title="Security Protocol Layer"
                >
                <ShieldAlert size={18} />
                </button>
            </div>
          </div>
        </header>


        {/* Dynamic Content Surface */}
        <main className="flex-1 p-4 lg:p-12 max-w-7xl mx-auto w-full">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
              <Loader2 size={32} className="animate-spin text-[#E8A020]" />
              <p className="text-[10px] font-900 uppercase tracking-[0.4em] font-ui">Loading Hub Core...</p>
            </div>
          }>
            {renderContent()}
          </Suspense>
        </main>

        <footer className="py-6 px-10 border-t border-[#1C1C1A] flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-ui text-[#333330] uppercase tracking-[0.2em]">
          <p>© 2026 BISHOUY ENTERPRISE CORE // ALL RIGHTS RESERVED</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              SYSTEM STATUS:
              <span className={maintenanceStatus.data?.maintenance ? "text-red-500 font-700" : "text-green-500 font-700"}>
                {maintenanceStatus.data?.maintenance ? "MAINTENANCE MODE" : "OPERATIONAL"}
              </span>
            </span>
            <span className="text-[#555550]">CORE SECURE: V3.4.0-{Math.random().toString(36).substring(7).toUpperCase()}</span>
          </div>
        </footer>
      </div>

      {/* Mobile Sidebar - Slide in */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
          setShowForm(false);
          setEditingId(null);
        }}
        isCollapsed={false}
        setIsCollapsed={() => { }}
        onLogout={handleLogout}
        className={`lg:hidden w-[280px] z-[110] shadow-2xl transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      />

      {/* Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[105] lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
