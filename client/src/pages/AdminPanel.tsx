/*
 * BISHOUY.COM — Admin Panel
 * Secure admin interface for managing articles, users and comments
 * Only accessible to admin users
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import ArticleForm from "@/components/ArticleForm";
import UsersManagement from "./UsersManagement";
import SystemConsole from "@/components/SystemConsole";
import DashboardStats from "@/components/DashboardStats";
import NewsletterManager from "@/components/NewsletterManager";
import AdsManager from "@/components/AdsManager";
import GlobalComments from "@/components/GlobalComments";
import AdminSidebar from "@/components/AdminSidebar";
import SiteSettings from "@/components/SiteSettings";
import SecurityStatus from "@/components/SecurityStatus";
import MediaLibrary from "@/components/MediaLibrary";
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
} from "lucide-react";

export default function AdminPanel() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "articles"
    | "users"
    | "comments"
    | "ads"
    | "newsletter"
    | "system"
    | "settings"
    | "security"
    | "media"
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
      setLocation("/");
      return;
    }
    if (user?.role !== "admin") {
      toast.error("Access Denied", {
        description: "You do not have admin privileges",
      });
      setLocation("/");
    }
  }, [isAuthenticated, user, loading, setLocation]);

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
      case "media":
        return <MediaLibrary />;
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
                    Index: <span className="text-[#F2F0EB] font-bold">{articlesQuery.data?.length || 0}</span>
                  </p>
                  <span className="w-1 h-1 rounded-full bg-[#2A2A28]" />
                  <p className="font-ui text-xs uppercase tracking-widest">
                    Queue: <span className="text-blue-400 font-bold">{articlesQuery.data?.filter(a => a.status === 'draft').length || 0}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1.5 items-end">
                  <button
                    onClick={() => {
                      const promise = triggerAiMutation.mutateAsync();
                      toast.promise(promise, {
                        loading: "Engaging AI Agents...",
                        success: "AI news cycle triggered successfully.",
                        error: "Agent failure. Check system logs.",
                      });
                    }}
                    className="flex items-center justify-center gap-2 bg-[#1C1C1A] border border-[#2A2A28] hover:border-[#E8A020] text-[#E8A020] font-ui text-[10px] md:text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-sm transition-all hover:scale-105 active:scale-95"
                    disabled={triggerAiMutation.isPending}
                  >
                    <Bot size={16} />
                    Trigger AI Sync
                  </button>
                  <span className="text-[8px] text-[#555550] uppercase tracking-tighter">Manually start automated RSS to AI generation</span>
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setShowForm(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-[10px] md:text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#E8A020]/20"
                  >
                    <Plus size={16} />
                    Create Manual Draft
                  </button>
                  <span className="text-[8px] text-[#555550] uppercase tracking-tighter">Open editor for a new human-written article</span>
                </div>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-[#11110F] p-1.5 rounded-lg border border-[#1C1C1A] w-fit">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-5 py-2 rounded-md font-ui text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === "all" ? "bg-[#E8A020] text-[#0F0F0E] shadow-sm" : "text-[#8A8880] hover:text-[#F2F0EB]"}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("published")}
                className={`px-5 py-2 rounded-md font-ui text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === "published" ? "bg-[#1C1C1A] text-green-400 border border-green-400/20" : "text-[#8A8880] hover:text-[#F2F0EB]"}`}
              >
                Published
              </button>
              <button
                onClick={() => setStatusFilter("draft")}
                className={`px-5 py-2 rounded-md font-ui text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === "draft" ? "bg-[#1C1C1A] text-blue-400 border border-blue-400/20" : "text-[#8A8880] hover:text-[#F2F0EB]"}`}
              >
                Drafts
              </button>
            </div>

            {articlesQuery.isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#E8A020]" size={32} />
              </div>
            ) : (
              <div className="grid gap-4">
                {articlesQuery.data
                  ?.filter(a =>
                    statusFilter === "all" ? true : a.status === statusFilter
                  )
                  .map(article => (
                    <Card
                      key={article.id}
                      className={`group bg-[#1C1C1A] border-[#2A2A28] p-5 hover:border-[#E8A020]/20 transition-all ${article.status === "draft" ? "border-l-4 border-l-blue-500" : ""}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span
                              className="font-ui text-[9px] font-900 text-[#0F0F0E] uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm"
                              style={{ backgroundColor: article.categoryColor || "#E8A020" }}
                            >
                              {article.category}
                            </span>
                            {article.status === "draft" && (
                              <span className="font-ui text-[9px] font-800 bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest px-2 py-0.5 rounded-sm">
                                DRAFT
                              </span>
                            )}
                            {article.author === "Redazione AI" && (
                              <span className="font-ui text-[9px] font-800 bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest px-2 py-0.5 rounded-sm flex items-center gap-1">
                                <Bot size={10} /> AI
                              </span>
                            )}
                          </div>
                          <h3 className="font-headline text-lg text-[#F2F0EB] mb-2 group-hover:text-[#E8A020] transition-colors line-clamp-1">
                            {article.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[10px] text-[#555550] uppercase tracking-widest font-bold">
                            <span className="flex items-center gap-1.5"><FileText size={10} /> {article.author}</span>
                            <span className="flex items-center gap-1.5"><Eye size={10} /> {article.viewCount || 0} Views</span>
                            <span className="flex items-center gap-1.5">
                              {new Date(article.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {article.status === "draft" && (
                            <button
                              onClick={() => handlePublish(article.id)}
                              disabled={publishArticleMutation.isPending}
                              className="p-3 bg-[#E8A020] text-[#0F0F0E] hover:scale-105 active:scale-95 rounded-lg transition-all shadow-lg shadow-[#E8A020]/10"
                              title="Publish Now"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingId(article.id);
                              setShowForm(true);
                            }}
                            className="p-3 bg-[#11110F] border border-[#2A2A28] text-[#8A8880] hover:text-[#E8A020] hover:border-[#E8A020] rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="p-3 bg-[#11110F] border border-[#2A2A28] text-[#8A8880] hover:text-red-500 hover:border-red-500/50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                          <a
                            href={`/articolo/${article.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 bg-[#11110F] border border-[#2A2A28] text-[#8A8880] hover:text-[#F2F0EB] rounded-lg transition-all"
                            title="Preview"
                          >
                            <ChevronRight size={18} />
                          </a>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        );
      case "users":
        return <UsersManagement />;
      case "comments":
        return <GlobalComments />;
      case "ads":
        return <AdsManager />;
      case "newsletter":
        return <NewsletterManager />;
      case "settings":
        return <SiteSettings />;
      case "system":
        return <SystemConsole />;
      case "security":
        return <SecurityStatus />;
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
      />

      {/* Main Layout Area */}
      <div
        className={`transition-all duration-300 min-h-screen flex flex-col ${isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
          }`}
      >
        {/* Top Header Barra */}
        <header className="h-20 border-b border-[#1C1C1A] bg-[#0A0A09]/80 backdrop-blur-xl sticky top-0 z-[90] flex items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#8A8880] hover:text-[#F2F0EB]"
            >
              <Menu size={24} />
            </button>
            <h2 className="font-ui text-[10px] font-900 uppercase tracking-[0.4em] text-[#E8A020] hidden sm:block">
              COMMAND CENTER // {activeTab}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 pr-6 border-r border-[#1C1C1A]">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-ui font-800 text-[#F2F0EB] uppercase tracking-widest">{user?.name}</span>
                <span className="text-[9px] font-ui text-[#8A8880] uppercase tracking-tighter">Root Administrator</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E8A020] to-[#D4911C] border border-[#0A0A09]" />
            </div>
            <button
              onClick={() => setActiveTab("security")}
              className={`relative p-2 rounded-full transition-all hover:bg-[#1C1C1A] ${activeTab === 'security' ? 'text-[#E8A020] bg-[#E8A020]/10' : 'text-[#8A8880] hover:text-[#E8A020]'}`}
              title="Security Protocols"
            >
              <ShieldAlert size={20} />
            </button>
          </div>
        </header>

        {/* Dynamic Content Surface */}
        <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>

        <footer className="py-6 px-10 border-t border-[#1C1C1A] flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-ui text-[#333330] uppercase tracking-[0.2em]">
          <p>© 2026 BISHOUY ENTERPRISE CORE // ALL RIGHTS RESERVED</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              SYSTEM STATUS:
              <span className={maintenanceStatus.data?.maintenance ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                {maintenanceStatus.data?.maintenance ? "MAINTENANCE MODE" : "OPERATIONAL"}
              </span>
            </span>
            <span className="text-[#555550]">CORE SECURE: V3.4.0-{Math.random().toString(36).substring(7).toUpperCase()}</span>
          </div>
        </footer>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[95] lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-screen w-72 bg-[#11110F] z-[100] border-r border-[#1C1C1A] animate-slide-in-left">
            <AdminSidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
                setShowForm(false);
              }}
              isCollapsed={false}
              setIsCollapsed={() => { }}
              onLogout={handleLogout}
            />
          </div>
        </>
      )}
    </div>
  );
}
