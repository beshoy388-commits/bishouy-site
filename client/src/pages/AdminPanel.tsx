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
import { Loader2, Plus, Edit, Trash2, Eye, LogOut, Check, X, MessageSquare, Clock, Terminal } from "lucide-react";

export default function AdminPanel() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"articles" | "users" | "comments" | "system">("articles");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
      return;
    }
    if (user?.role !== "admin") {
      toast.error("Access Denied", { description: "You do not have admin privileges" });
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

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

  const approveCommentMutation = trpc.comments.approve.useMutation({
    onSuccess: () => {
      toast.success("Commento approvato e pubblicato");
      pendingCommentsQuery.refetch();
    },
    onError: (error) => {
      toast.error("Errore nell'approvazione", { description: error.message });
    },
  });

  const rejectCommentMutation = trpc.comments.reject.useMutation({
    onSuccess: () => {
      toast.success("Commento rifiutato");
      pendingCommentsQuery.refetch();
    },
    onError: (error) => {
      toast.error("Errore nel rifiuto", { description: error.message });
    },
  });

  const deleteCommentMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      toast.success("Commento eliminato");
      pendingCommentsQuery.refetch();
    },
    onError: (error) => {
      toast.error("Errore nell'eliminazione", { description: error.message });
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

  const handleApproveComment = (id: number) => {
    approveCommentMutation.mutate({ id });
  };

  const handleRejectComment = (id: number) => {
    rejectCommentMutation.mutate({ id });
  };

  const handleDeleteComment = (id: number) => {
    if (confirm("Eliminare definitivamente questo commento?")) {
      deleteCommentMutation.mutate({ id });
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
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-[#F2F0EB]">ADMIN PANEL</h1>
            <p className="font-ui text-xs text-[#8A8880]">Logged in as: {user?.name || user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-2 text-[#8A8880] hover:text-[#E8A020] transition-colors font-ui text-sm"
            >
              <Eye size={16} />
              View Site
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-4 py-2 rounded-sm transition-colors"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="container border-t border-[#2A2A28] flex gap-8">
          <button
            onClick={() => {
              setActiveTab("articles");
              setShowForm(false);
            }}
            className={`py-3 px-4 font-ui text-sm font-600 uppercase tracking-wider transition-colors border-b-2 ${activeTab === "articles"
                ? "text-[#E8A020] border-[#E8A020]"
                : "text-[#8A8880] border-transparent hover:text-[#F2F0EB]"
              }`}
          >
            Articles
          </button>
          <button
            onClick={() => {
              setActiveTab("comments");
              setShowForm(false);
            }}
            className={`py-3 px-4 font-ui text-sm font-600 uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${activeTab === "comments"
                ? "text-[#E8A020] border-[#E8A020]"
                : "text-[#8A8880] border-transparent hover:text-[#F2F0EB]"
              }`}
          >
            <MessageSquare size={14} />
            Comments
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("users");
              setShowForm(false);
            }}
            className={`py-3 px-4 font-ui text-sm font-600 uppercase tracking-wider transition-colors border-b-2 ${activeTab === "users"
                ? "text-[#E8A020] border-[#E8A020]"
                : "text-[#8A8880] border-transparent hover:text-[#F2F0EB]"
              }`}
          >
            Users
          </button>
          <button
            onClick={() => {
              setActiveTab("system");
              setShowForm(false);
            }}
            className={`py-3 px-4 font-ui text-sm font-600 uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${activeTab === "system"
                ? "text-[#E8A020] border-[#E8A020]"
                : "text-[#8A8880] border-transparent hover:text-[#F2F0EB]"
              }`}
          >
            <Terminal size={14} />
            System
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* ── ARTICLES TAB ── */}
        {activeTab === "articles" ? (
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
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-headline text-2xl text-[#F2F0EB] mb-2">Articles Management</h2>
                  <p className="font-ui text-sm text-[#8A8880]">
                    Total articles: {articlesQuery.data?.length || 0}
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-6 py-3 rounded-sm transition-colors"
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
          <div>
            <div className="mb-8">
              <h2 className="font-headline text-2xl text-[#F2F0EB] mb-2">Comments Moderation</h2>
              <p className="font-ui text-sm text-[#8A8880]">
                {pendingCount > 0
                  ? `${pendingCount} comment${pendingCount > 1 ? "s" : ""} awaiting approval`
                  : "No pending comments"}
              </p>
            </div>

            {pendingCommentsQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-[#E8A020]" size={32} />
              </div>
            ) : pendingCount === 0 ? (
              <Card className="bg-[#1C1C1A] border-[#2A2A28] p-12 text-center">
                <MessageSquare className="mx-auto mb-4 text-[#555550]" size={40} />
                <p className="text-[#8A8880] font-ui text-sm">No comments pending moderation</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingCommentsQuery.data?.map((comment) => {
                  const c = comment as any;
                  const displayName = c.userUsername ? `@${c.userUsername}` : c.userName || "Anonymous";
                  return (
                    <Card key={comment.id} className="bg-[#1C1C1A] border-[#2A2A28] p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Meta */}
                          <div className="flex items-center gap-3 mb-3">
                            <span className="flex items-center gap-1 font-ui text-[10px] text-[#E8A020] uppercase tracking-widest bg-[#E8A020]/10 px-2 py-1 rounded-sm">
                              <Clock size={10} />
                              Pending
                            </span>
                            <span className="font-ui text-[10px] text-[#8A8880] font-medium">
                              {displayName}
                            </span>
                            <span className="font-ui text-[10px] text-[#555550]">
                              Article #{comment.articleId}
                            </span>
                            <span className="font-ui text-[10px] text-[#555550]">
                              {new Date(comment.createdAt).toLocaleDateString("it-IT", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {/* Content */}
                          <p className="text-[#D4D0C8] leading-relaxed text-sm">{comment.content}</p>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleApproveComment(comment.id)}
                            disabled={approveCommentMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-2 bg-green-900/30 hover:bg-green-900/60 text-green-400 font-ui text-xs uppercase tracking-wider rounded-sm transition-colors disabled:opacity-50"
                            title="Approva e pubblica"
                          >
                            <Check size={14} />
                            Approva
                          </button>
                          <button
                            onClick={() => handleRejectComment(comment.id)}
                            disabled={rejectCommentMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-2 bg-yellow-900/30 hover:bg-yellow-900/60 text-yellow-400 font-ui text-xs uppercase tracking-wider rounded-sm transition-colors disabled:opacity-50"
                            title="Rifiuta"
                          >
                            <X size={14} />
                            Rifiuta
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deleteCommentMutation.isPending}
                            className="p-2 bg-[#2A2A28] hover:bg-red-900/30 text-red-500 rounded-sm transition-colors disabled:opacity-50"
                            title="Elimina definitivamente"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

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
