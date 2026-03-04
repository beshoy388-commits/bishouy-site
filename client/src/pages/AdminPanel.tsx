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
import { Loader2, Plus, Edit, Trash2, Eye, LogOut, MessageSquare, Terminal, LayoutDashboard, Megaphone, Send } from "lucide-react";

export default function AdminPanel() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"dashboard" | "articles" | "users" | "comments" | "ads" | "newsletter" | "system">("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (loading) return; // Wait for auth state to load

    if (!isAuthenticated) {
      setLocation("/");
      return;
    }
    if (user?.role !== "admin") {
      toast.error("Access Denied", { description: "You do not have admin privileges" });
      setLocation("/");
    }
  }, [isAuthenticated, user, loading, setLocation]);

  const articlesQuery = trpc.articles.list.useQuery();
  const pendingCommentsQuery = trpc.comments.getPending.useQuery();

  const deleteArticleMutation = trpc.articles.delete.useMutation({
    onSuccess: () => {
      toast.success("Article deleted successfully");
      articlesQuery.refetch();
    },
    onError: (error) => {
      toast.error("Failed to delete article", { description: error.message });
    },
  });

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
          <Loader2 className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-[#8A8880]">Verifying access...</p>
        </div>
      </div>
    );
  }

  const pendingCount = pendingCommentsQuery.data?.length || 0;

  return (
    <div className="min-h-screen bg-[#0F0F0E]">
      {/* Header */}
      <div className="bg-[#1C1C1A] border-b border-[#2A2A28] sticky top-0 z-50">
        <div className="container py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="font-display text-xl md:text-2xl text-[#F2F0EB]">ADMIN PANEL</h1>
            <p className="font-ui text-[10px] md:text-xs text-[#8A8880]">Logged in as: {user?.name || user?.email}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-center">
            <a
              href="/"
              className="flex items-center gap-1.5 text-[#8A8880] hover:text-[#E8A020] transition-colors font-ui text-[10px] md:text-sm uppercase tracking-wider"
            >
              <Eye size={14} />
              <span className="hidden xs:inline">View Site</span>
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-[10px] font-600 uppercase tracking-wider px-3 md:px-4 py-1.5 md:py-2 rounded-sm transition-colors"
            >
              <LogOut size={12} />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs - Scrollable on mobile */}
        <div className="container border-t border-[#2A2A28]">
          <div className="flex gap-1 sm:gap-4 overflow-x-auto custom-scrollbar whitespace-nowrap hide-scroll py-1">
            <button
              onClick={() => { setActiveTab("dashboard"); setShowForm(false); }}
              className={`py-3 px-3 sm:px-4 font-ui text-[10px] sm:text-xs md:text-sm font-600 uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 flex-shrink-0 ${activeTab === "dashboard" ? "text-[#E8A020] border-[#E8A020]" : "text-[#8A8880] border-transparent hover:text-[#F2F0EB]"
                }`}
            >
              <LayoutDashboard size={14} /> <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => { setActiveTab("articles"); setShowForm(false); }}
              className={`py-3 px-3 sm:px-4 font-ui text-[10px] sm:text-xs md:text-sm font-600 uppercase tracking-wider transition-colors border-b-2 flex-shrink-0 ${activeTab === "articles" ? "text-[#E8A020] border-[#E8A020]" : "text-[#8A8880] border-transparent hover:text-[#F2F0EB]"
                }`}
            >
              Articles
            </button>
            <button
              onClick={() => { setActiveTab("comments"); setShowForm(false); }}
              className={`py-3 px-3 sm:px-4 font-ui text-[10px] sm:text-xs md:text-sm font-600 uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 flex-shrink-0 ${activeTab === "comments" ? "text-[#E8A020] border-[#E8A020]" : "text-[#8A8880] border-transparent hover:text-[#F2F0EB]"
                }`}
            >
              <MessageSquare size={14} /> <span className="hidden sm:inline">Comments</span>
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab("ads"); setShowForm(false); }}
              className={`py-3 px-3 sm:px-4 font-ui text-[10px] sm:text-xs md:text-sm font-600 uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 flex-shrink-0 ${activeTab === "ads" ? "text-[#E8A020] border-[#E8A020]" : "text-[#8A8880] border-transparent hover:text-[#F2F0EB]"
                }`}
            >
              <Megaphone size={14} /> <span className="hidden sm:inline">Ads</span>
            </button>
            <button
              onClick={() => { setActiveTab("newsletter"); setShowForm(false); }}
              className={`py-3 px-3 sm:px-4 font-ui text-[10px] sm:text-xs md:text-sm font-600 uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 flex-shrink-0 ${activeTab === "newsletter" ? "text-[#E8A020] border-[#E8A020]" : "text-[#8A8880] border-transparent hover:text-[#F2F0EB]"
                }`}
            >
              <Send size={14} /> <span className="hidden sm:inline">Newsletter</span>
            </button>
            <button
              onClick={() => { setActiveTab("users"); setShowForm(false); }}
              className={`py-3 px-3 sm:px-4 font-ui text-[10px] sm:text-xs md:text-sm font-600 uppercase tracking-wider transition-colors border-b-2 flex-shrink-0 ${activeTab === "users" ? "text-[#E8A020] border-[#E8A020]" : "text-[#8A8880] border-transparent hover:text-[#F2F0EB]"
                }`}
            >
              Users
            </button>
            <button
              onClick={() => { setActiveTab("system"); setShowForm(false); }}
              className={`py-3 px-3 sm:px-4 font-ui text-[10px] sm:text-xs md:text-sm font-600 uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 flex-shrink-0 ${activeTab === "system" ? "text-[#E8A020] border-[#E8A020]" : "text-[#8A8880] border-transparent hover:text-[#F2F0EB]"
                }`}
            >
              <Terminal size={14} /> <span className="hidden sm:inline">System</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* ── DASHBOARD TAB ── */}
        {activeTab === "dashboard" ? (
          <DashboardStats
            onTabChange={(tab) => setActiveTab(tab)}
            onNewArticle={() => setShowForm(true)}
          />
        ) : activeTab === "articles" ? (
          showForm ? (
            <div>
              <div className="mb-6">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="text-[#8A8880] hover:text-[#E8A020] font-ui text-sm"
                >
                  ← Back to Articles
                </button>
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
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="font-headline text-xl md:text-2xl text-[#F2F0EB] mb-1 md:mb-2">Articles Management</h2>
                  <p className="font-ui text-xs text-[#8A8880]">
                    Total articles: {articlesQuery.data?.length || 0}
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center justify-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-[10px] md:text-xs font-600 uppercase tracking-wider px-6 py-2.5 md:py-3 rounded-sm transition-colors w-full sm:w-auto"
                >
                  <Plus size={16} />
                  New Article
                </button>
              </div>

              {articlesQuery.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-[#E8A020]" size={32} />
                </div>
              ) : articlesQuery.data?.length === 0 ? (
                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-8 text-center">
                  <p className="text-[#8A8880] mb-4">No articles yet</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-6 py-2 rounded-sm transition-colors"
                  >
                    Create First Article
                  </button>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {articlesQuery.data?.map((article) => (
                    <Card key={article.id} className="bg-[#1C1C1A] border-[#2A2A28] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="font-ui text-[10px] font-600 text-white uppercase tracking-widest px-2 py-1 rounded-sm"
                              style={{ backgroundColor: article.categoryColor || "#E8A020" }}
                            >
                              {article.category}
                            </span>
                            {article.featured === 1 && (
                              <span className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest">
                                ⭐ Featured
                              </span>
                            )}
                            {article.breaking === 1 && (
                              <span className="font-ui text-[10px] font-600 text-red-500 uppercase tracking-widest">
                                🔴 Breaking
                              </span>
                            )}
                          </div>
                          <h3 className="font-headline text-lg text-[#F2F0EB] mb-1 truncate">
                            {article.title}
                          </h3>
                          <p className="font-ui text-xs text-[#8A8880] mb-2 line-clamp-2">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-4 text-[10px] text-[#555550]">
                            <span>By {article.author}</span>
                            <span>{article.readTime} min read</span>
                            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <a
                            href={`/articolo/${article.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-[#2A2A28] hover:bg-[#333330] text-[#8A8880] hover:text-[#E8A020] rounded-sm transition-colors"
                            title="View on site"
                          >
                            <Eye size={16} />
                          </a>
                          <button
                            onClick={() => {
                              setEditingId(article.id);
                              setShowForm(true);
                            }}
                            className="p-2 bg-[#2A2A28] hover:bg-[#333330] text-[#E8A020] rounded-sm transition-colors"
                            title="Edit article"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(article.id)}
                            disabled={deleteArticleMutation.isPending}
                            className="p-2 bg-[#2A2A28] hover:bg-red-900/30 text-red-500 rounded-sm transition-colors disabled:opacity-50"
                            title="Delete article"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )

          /* ── COMMENTS TAB ── */
        ) : activeTab === "comments" ? (
          <GlobalComments />

          /* ── ADS TAB ── */
        ) : activeTab === "ads" ? (
          <AdsManager />

          /* ── NEWSLETTER TAB ── */
        ) : activeTab === "newsletter" ? (
          <NewsletterManager />

          /* ── USERS TAB ── */
        ) : activeTab === "users" ? (
          <UsersManagement />
        ) : (
          /* ── SYSTEM TAB ── */
          <SystemConsole />
        )}
      </div>
    </div>
  );
}
