import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Clock, User, Calendar, Send, Heart, Edit2, Trash2, X, Check } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ArticleDetail() {
  const [match, params] = useRoute("/articolo/:slug");
  const slug = params?.slug as string;
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  // Query per l'articolo
  const { data: article, isLoading } = trpc.articles.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  // Query per i commenti
  const { data: comments, refetch: refetchComments } = trpc.comments.getByArticle.useQuery(
    { articleId: article?.id || 0 },
    { enabled: !!article?.id }
  );

  // Query per il conteggio dei like
  const likeCountQuery = trpc.likes.getCount.useQuery(
    { articleId: article?.id || 0 },
    { enabled: !!article?.id }
  );

  // Query per verificare se l'utente ha messo like
  const userLikedQuery = trpc.likes.hasUserLiked.useQuery(
    { articleId: article?.id || 0 },
    { enabled: !!article?.id && !!user }
  );

  // Mutation per toggleare il like
  const toggleLikeMutation = trpc.likes.toggle.useMutation({
    onSuccess: (data: any) => {
      setLikeCount(data.likeCount);
      setUserLiked(data.liked);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to like article");
    },
  });

  // Mutation per creare un commento
  const createCommentMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      setCommentText("");
      toast.success("Comment submitted for moderation");
      refetchComments();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit comment");
    },
  });

  // Mutation per modificare un commento
  const editCommentMutation = trpc.comments.editOwn.useMutation({
    onSuccess: () => {
      setEditingCommentId(null);
      setEditContent("");
      toast.success("Comment updated");
      refetchComments();
    },
    onError: (error) => toast.error(error.message),
  });

  // Mutation per eliminare un commento
  const deleteCommentMutation = trpc.comments.deleteOwn.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted");
      refetchComments();
    },
    onError: (error) => toast.error(error.message),
  });

  // Effect per scrollare in alto
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // SEO: Dynamic title and Open Graph meta tags per article
  useEffect(() => {
    if (!article) return;

    const siteTitle = "Bishouy.com";
    const pageTitle = `${article.title} | ${siteTitle}`;
    const description = article.excerpt || `Read the latest news on ${siteTitle}`;
    const image = article.image || "";
    const url = window.location.href;

    // Page title
    document.title = pageTitle;

    // Helper to upsert meta tags
    const setMeta = (attr: string, value: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${value}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, value);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("property", "og:type", "article");
    setMeta("property", "og:title", pageTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", image);
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", pageTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);

    // Canonical link tag
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    // Cleanup: restore on unmount
    return () => {
      document.title = siteTitle;
    };
  }, [article]);


  // Effect per aggiornare il conteggio dei like
  useEffect(() => {
    if (likeCountQuery.data !== undefined) {
      setLikeCount(likeCountQuery.data);
    }
  }, [likeCountQuery.data]);

  // Effect per aggiornare lo stato del like dell'utente
  useEffect(() => {
    if (userLikedQuery.data !== undefined) {
      setUserLiked(userLikedQuery.data);
    }
  }, [userLikedQuery.data]);

  // Handler per il click sul like
  const handleLikeClick = () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    if (article) {
      toggleLikeMutation.mutate({ articleId: article.id });
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !article) return;

    setIsSubmitting(true);
    try {
      await createCommentMutation.mutateAsync({
        articleId: article.id,
        content: commentText,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0E] flex items-center justify-center">
        <Navbar />
        <Loader2 className="animate-spin text-[#E8A020]" size={40} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#0F0F0E]">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-[#F2F0EB] mb-4">Article not found</h1>
          <Link href="/">
            <button className="text-[#E8A020] hover:text-[#F2F0EB] transition-colors">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const parseTags = () => {
    if (!article.tags) return [];
    if (typeof article.tags === "string") {
      try {
        return JSON.parse(article.tags);
      } catch {
        return [];
      }
    }
    return Array.isArray(article.tags) ? article.tags : [];
  };

  const tags = parseTags();
  const publishDate = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : new Date(article.createdAt!).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const renderArticleContent = (content: string) => {
    const parts = content.split(/(<!-- img:[a-z]+:\d+% -->)/g);
    let currentImageStyle: { position: string; width: string } | null = null;

    return parts.map((part, index) => {
      const directiveMatch = part.match(/<!-- img:([a-z]+):(\d+)% -->/);
      if (directiveMatch) {
        currentImageStyle = {
          position: directiveMatch[1],
          width: directiveMatch[2],
        };
        return null;
      }

      const style = currentImageStyle;
      currentImageStyle = null;

      return (
        <ReactMarkdown
          key={index}
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ src, alt }) => {
              const imgStyle = style || { position: "center", width: "100" };
              const alignClass =
                imgStyle.position === "left" ? "mr-auto" :
                  imgStyle.position === "right" ? "ml-auto" :
                    imgStyle.position === "full" ? "w-full" :
                      "mx-auto";

              return (
                <figure
                  className={`my-6 ${imgStyle.position === "left" ? "float-left mr-6 mb-4" :
                    imgStyle.position === "right" ? "float-right ml-6 mb-4" :
                      "clear-both"
                    }`}
                  style={{ width: imgStyle.position === "full" ? "100%" : `${imgStyle.width}%` }}
                >
                  <img
                    src={src}
                    alt={alt || ""}
                    className={`rounded-sm ${alignClass}`}
                    style={{ width: "100%", height: "auto" }}
                  />
                </figure>
              );
            },
            h1: ({ children }) => <h1 className="font-display text-3xl text-[#F2F0EB] mt-8 mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="font-display text-2xl text-[#F2F0EB] mt-6 mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="font-display text-xl text-[#F2F0EB] mt-4 mb-2">{children}</h3>,
            p: ({ children }) => <p className="text-[#D4D0C8] leading-relaxed mb-4">{children}</p>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-[#E8A020] pl-4 my-4 italic text-[#8A8880]">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a href={href} className="text-[#E8A020] hover:text-[#D4911C] underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-4 text-[#D4D0C8]">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-4 text-[#D4D0C8]">{children}</ol>,
            code: ({ children, className }) => {
              if (className) {
                return <code className="block bg-[#0F0F0E] p-4 rounded-sm text-[#E8A020] text-sm overflow-x-auto mb-4">{children}</code>;
              }
              return <code className="bg-[#0F0F0E] px-1.5 py-0.5 rounded text-[#E8A020] text-sm">{children}</code>;
            },
            hr: () => <hr className="border-[#222220] my-8" />,
          }}
        >
          {part}
        </ReactMarkdown>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#0F0F0E]">
      <Navbar />

      {/* Hero Image */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0E] via-[#0F0F0E]/40 to-transparent" />
      </section>

      {/* Article Content */}
      <article className="container py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Link href="/">
            <button className="flex items-center gap-2 text-[#8A8880] hover:text-[#E8A020] transition-colors mb-6">
              <ArrowLeft size={18} />
              Back to Home
            </button>
          </Link>

          {/* Category and Breaking Badge */}
          <div className="flex items-center gap-3 mb-6">
            {article.breaking && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E8A020] animate-pulse" />
                <span className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest">
                  Breaking News
                </span>
              </div>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="font-display text-3xl md:text-4xl font-900 text-[#F2F0EB] leading-tight mb-4">
                {article.title}
              </h1>
              <p className="text-[#8A8880] text-lg mb-6">{article.excerpt}</p>
            </div>
            {/* Like Button */}
            <button
              onClick={handleLikeClick}
              disabled={toggleLikeMutation.isPending}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-sm transition-all duration-200 disabled:opacity-50"
              style={{
                backgroundColor: userLiked ? "#E8A020" : "transparent",
                color: userLiked ? "#0F0F0E" : "#8A8880",
                border: userLiked ? "none" : "1px solid #2A2A28",
              }}
              title={user ? "Like this article" : "Login to like"}
            >
              <Heart
                size={18}
                className={`transition-transform duration-300 ${isAnimating && userLiked ? "scale-125" : "scale-100"
                  }`}
                fill={userLiked ? "currentColor" : "none"}
              />
              <span className="font-ui text-sm font-600 uppercase tracking-wider">
                {likeCount}
              </span>
            </button>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-[#8A8880] text-sm border-t border-b border-[#1C1C1A] py-4">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{publishDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{article.readTime} min read</span>
            </div>
          </div>

          {/* Article Body */}
          <div className="prose prose-invert max-w-none mb-12">
            <div className="font-serif text-[#D4D0C8] leading-relaxed">
              {renderArticleContent(article.content)}
              <div className="clear-both" />
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12 pb-12 border-b border-[#1C1C1A]">
              {tags.map((tag: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-[#1C1C1A] text-[#8A8880] font-ui text-xs rounded-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Comments Section */}
          <div className="max-w-3xl mx-auto">
            <h3 className="font-headline text-xl font-700 text-[#F2F0EB] mb-6">Comments</h3>

            {/* Approved Comments */}
            {comments && comments.length > 0 ? (
              <div className="space-y-4 mb-8">
                {comments.map((comment) => {
                  const c = comment as any;
                  const displayName = c.userUsername
                    ? `@${c.userUsername}`
                    : c.userName || "Anonymous";
                  const isOwner = user && user.id === c.userId;
                  const isEditing = editingCommentId === c.id;

                  const ProfileWrapper = ({ children }: { children: React.ReactNode }) => {
                    if (c.userUsername) {
                      return <Link href={`/u/${c.userUsername}`}>{children}</Link>;
                    }
                    return <>{children}</>;
                  };

                  return (
                    <div key={c.id} className="bg-[#1C1C1A] rounded-sm p-6 relative group">
                      <div className="flex items-start justify-between mb-3">
                        <ProfileWrapper>
                          <div className={`flex items-center gap-3 ${c.userUsername ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}>
                            {c.userAvatarUrl ? (
                              <img
                                src={c.userAvatarUrl}
                                alt={displayName}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-[#2A2A28]"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#2A2A28] flex items-center justify-center flex-shrink-0">
                                <span className="text-[#8A8880] text-xs font-bold">
                                  {displayName.charAt(1)?.toUpperCase() || displayName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className={`font-medium text-sm ${c.userUsername ? 'text-[#E8A020]' : 'text-[#F2F0EB]'}`}>{displayName}</p>
                              <p className="text-xs text-[#8A8880] flex items-center gap-1.5">
                                {new Date(c.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                                {c.isEdited === 1 && (
                                  <span className="italic opacity-70">(edited)</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </ProfileWrapper>

                        {/* Azioni per il proprietario del commento */}
                        {isOwner && !isEditing && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingCommentId(c.id);
                                setEditContent(c.content);
                              }}
                              className="text-[#8A8880] hover:text-[#E8A020] transition-colors p-1"
                              title="Edit comment"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this comment?")) {
                                  deleteCommentMutation.mutate({ id: c.id });
                                }
                              }}
                              className="text-[#8A8880] hover:text-red-500 transition-colors p-1"
                              title="Delete comment"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="mt-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-sm p-3 text-[#D4D0C8] placeholder-[#555550] focus:outline-none focus:border-[#E8A020] resize-none"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditContent("");
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-ui uppercase font-600 text-[#8A8880] hover:text-[#F2F0EB] transition-colors"
                            >
                              <X size={12} /> Cancel
                            </button>
                            <button
                              onClick={() => {
                                if (editContent.trim() && editContent !== c.content) {
                                  editCommentMutation.mutate({ id: c.id, content: editContent });
                                } else {
                                  setEditingCommentId(null);
                                }
                              }}
                              disabled={!editContent.trim() || editCommentMutation.isPending}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-ui uppercase font-600 bg-[#2A2A28] text-[#E8A020] hover:bg-[#E8A020] hover:text-[#0F0F0E] rounded-sm transition-colors disabled:opacity-50"
                            >
                              <Check size={12} /> Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[#D4D0C8] leading-relaxed whitespace-pre-wrap">{c.content}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[#8A8880] mb-8">No comments yet. Be the first to comment!</p>
            )}

            {/* Comment Form */}
            {user ? (
              <div className="bg-[#1C1C1A] rounded-sm p-6">
                <h4 className="font-medium text-[#F2F0EB] mb-4">Leave a Comment</h4>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-sm p-3 text-[#D4D0C8] placeholder-[#555550] focus:outline-none focus:border-[#E8A020] resize-none"
                  rows={4}
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !commentText.trim()}
                  className="mt-4 flex items-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] disabled:opacity-50 text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-4 py-2 rounded-sm transition-colors"
                >
                  <Send size={14} />
                  {isSubmitting ? "Submitting..." : "Submit Comment"}
                </button>
              </div>
            ) : (
              <div className="bg-[#1C1C1A] rounded-sm p-6 text-center">
                <p className="text-[#8A8880] mb-4">Sign in to leave a comment</p>
                <a
                  href={getLoginUrl()}
                  className="inline-flex items-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-4 py-2 rounded-sm transition-colors"
                >
                  Login to Comment
                </a>
              </div>
            )}
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
