import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleDetailSkeleton from "@/components/ArticleDetailSkeleton";
import { trpc } from "@/lib/trpc";
import {
  Loader2,
  ArrowLeft,
  Clock,
  User,
  Calendar,
  Send,
  Heart,
  Edit2,
  Trash2,
  X,
  Check,
  Share2,
  Twitter,
  Facebook,
  Link as LinkIcon,
  Bookmark,
} from "lucide-react";
import { Link } from "wouter";
import { getSafeImage, getFallbackImage } from "@/lib/image-utils";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SEO from "@/components/SEO";
import AdPlacement from "@/components/AdPlacement";
import AuthorBio from "@/components/AuthorBio";

export default function ArticleDetail() {
  const [match, params] = useRoute("/article/:slug");
  const slug = params?.slug as string;
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  // Query for article data
  const { data: article, isLoading } = trpc.articles.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  // Query for comments
  const { data: comments, refetch: refetchComments } =
    trpc.comments.getByArticle.useQuery(
      { articleId: article?.id || 0 },
      { enabled: !!article?.id }
    );

  // Query for like count (only if not provided in initial batch)
  const likeCountQuery = trpc.likes.getCount.useQuery(
    { articleId: article?.id || 0 },
    { enabled: !!article?.id && article.likeCount === undefined }
  );

  // Query to check if user has liked (only if not provided in initial batch)
  const userLikedQuery = trpc.likes.hasUserLiked.useQuery(
    { articleId: article?.id || 0 },
    { enabled: !!article?.id && !!user && article.hasLiked === undefined }
  );

  const utils = trpc.useUtils();

  // Mutation to toggle like with Optimistic Updates
  const toggleLikeMutation = trpc.likes.toggle.useMutation({
    onMutate: async () => {
      // 1. Snapshot previous values
      const prevLiked = userLiked;
      const prevCount = likeCount;

      // 2. Update local state immediately
      setUserLiked(!prevLiked);
      const newCount = prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1;
      setLikeCount(newCount);

      // 3. Update trpc logic cache so that the UI stays in its future state
      utils.likes.getCount.setData({ articleId: article!.id }, newCount);
      utils.likes.hasUserLiked.setData({ articleId: article!.id }, !prevLiked);

      if (!prevLiked) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);
      }

      return { prevLiked, prevCount };
    },
    onSuccess: (data: any) => {
      // 4. Update with actual server data (which should be the same)
      setLikeCount(data.likeCount);
      setUserLiked(data.liked);

      // Refresh cache so it's fully grounded in server reality
      utils.likes.getCount.setData({ articleId: article!.id }, data.likeCount);
      utils.likes.hasUserLiked.setData({ articleId: article!.id }, data.liked);
    },
    onError: (error, variables, context: any) => {
      // Rollback on error
      if (context) {
        setUserLiked(context.prevLiked);
        setLikeCount(context.prevCount);
        utils.likes.getCount.setData({ articleId: article!.id }, context.prevCount);
        utils.likes.hasUserLiked.setData({ articleId: article!.id }, context.prevLiked);
      }
      toast.error(error.message || "Failed to sync like");
    },
  });

  // Query for bookmarks
  const hasSavedQuery = trpc.bookmarks.hasSaved.useQuery(
    { articleId: article?.id || 0 },
    { enabled: !!article?.id && !!user }
  );

  const toggleBookmarkMutation = trpc.bookmarks.toggle.useMutation({
    onMutate: async () => {
      const prevSaved = isSaved;
      setIsSaved(!prevSaved);
      utils.bookmarks.hasSaved.setData({ articleId: article!.id }, !prevSaved);
      return { prevSaved };
    },
    onSuccess: saved => {
      setIsSaved(saved);
      utils.bookmarks.hasSaved.setData({ articleId: article!.id }, saved);
      toast.success(
        saved ? "Article saved to bookmarks" : "Article removed from bookmarks"
      );
    },
    onError: (error, variables, context: any) => {
      if (context) {
        setIsSaved(context.prevSaved);
        utils.bookmarks.hasSaved.setData({ articleId: article!.id }, context.prevSaved);
      }
      toast.error(error.message || "Failed to sync bookmarks");
    },
  });

  // Query for site settings (public status)
  const { data: systemStatus } = trpc.system.getStatus.useQuery();
  const allowComments = systemStatus?.allowComments ?? true;

  // Query for related articles
  const { data: relatedArticles } = trpc.articles.getRelated.useQuery(
    { articleId: article?.id || 0, limit: 3 },
    { enabled: !!article?.id }
  );

  // Mutation to create a comment
  const createCommentMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      setCommentText("");
      toast.success("Comment processing initiated.", {
        description: "Your insights are being distributed. They will appear shortly.",
      });
      refetchComments();
    },
    onError: error => {
      toast.error(error.message || "Failed to submit comment");
    },
  });

  // Mutation to edit a comment
  const editCommentMutation = trpc.comments.editOwn.useMutation({
    onSuccess: () => {
      setEditingCommentId(null);
      setEditContent("");
      toast.success("Comment updated");
      refetchComments();
    },
    onError: error => toast.error(error.message),
  });

  // Mutation to delete a comment
  const deleteCommentMutation = trpc.comments.deleteOwn.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted");
      refetchComments();
    },
    onError: error => toast.error(error.message),
  });

  // Effect to scroll to top and calculate read progress
  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      // Calculate scroll progress properly based on document height
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(
          100,
          Math.max(0, (window.scrollY / totalHeight) * 100)
        );
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const rw = (w: number) => isMobile ? Math.min(w, 480) : w;

  // SEO: Dynamic title and Open Graph meta tags per article
  useEffect(() => {
    if (!article) return;

    const siteTitle = "Bishouy.com";
    const pageTitle = article.seoTitle
      ? `${article.seoTitle} | ${siteTitle}`
      : `${article.title} | ${siteTitle}`;
    const description =
      article.seoDescription ||
      article.excerpt ||
      `Read the latest news on ${siteTitle}`;
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

  // Effect to update like count
  useEffect(() => {
    if (article?.likeCount !== undefined) {
      setLikeCount(article.likeCount);
    } else if (likeCountQuery.data !== undefined) {
      setLikeCount(likeCountQuery.data);
    }
  }, [likeCountQuery.data, article?.likeCount]);

  // Effect to update user's like status
  useEffect(() => {
    if (!user) {
      setUserLiked(false);
      return;
    }
    if (article?.hasLiked !== undefined) {
      setUserLiked(article.hasLiked);
    } else if (userLikedQuery.data !== undefined) {
      setUserLiked(userLikedQuery.data);
    }
  }, [userLikedQuery.data, user, article?.hasLiked]);

  // Effect to update user's bookmark status
  useEffect(() => {
    if (!user) {
      setIsSaved(false);
      return;
    }
    if (hasSavedQuery.data !== undefined) {
      setIsSaved(hasSavedQuery.data);
    }
  }, [hasSavedQuery.data, user]);

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

  // Handler per il click sul salvataggio (bookmark)
  const handleBookmarkClick = () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    if (article) {
      toggleBookmarkMutation.mutate({ articleId: article.id });
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

  const handleShare = (platform: string) => {
    if (!article) return;
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article.title);

    const links: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      whatsapp: `https://api.whatsapp.com/send?text=${title} ${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${title}`,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
      return;
    }

    if (links[platform]) {
      window.open(links[platform], "_blank", "width=600,height=400");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0F0F0E]">
        <Navbar />
        <ArticleDetailSkeleton />
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-[#0F0F0E]">
        <SEO title="Article Not Found" noindex={true} />
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-[#F2F0EB] mb-4">
            Article not found
          </h1>
          <Link href="/">
            <button className="text-[#E8A020] hover:text-[#F2F0EB] transition-colors">
              Back to Home
            </button>
          </Link>
        </div>
      </main>
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
  const publishDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : new Date(article.createdAt!).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const renderArticleContent = (content: string) => {
    // Check if content looks like HTML (contains tags)
    const isHtml = /<[a-z][\s\S]*>/i.test(content);

    if (isHtml) {
      return (
        <div
          className="prose prose-invert max-w-none font-serif text-[#D4D0C8] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

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
                imgStyle.position === "left"
                  ? "mr-auto"
                  : imgStyle.position === "right"
                    ? "ml-auto"
                    : imgStyle.position === "full"
                      ? "w-full"
                      : "block mx-auto";

              return (
                <figure
                  className={`my-6 ${imgStyle.position === "left"
                    ? "float-left mr-6 mb-4"
                    : imgStyle.position === "right"
                      ? "float-right ml-6 mb-4"
                      : "clear-both"
                    }`}
                  style={{
                    width:
                      imgStyle.position === "full"
                        ? "100%"
                        : `${imgStyle.width}%`,
                  }}
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
            h1: ({ children }) => (
              <h1 className="font-display text-3xl text-[#F2F0EB] mt-8 mb-4">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="font-display text-2xl text-[#F2F0EB] mt-6 mb-3">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-display text-xl text-[#F2F0EB] mt-4 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-[#D4D0C8] leading-relaxed mb-4">{children}</p>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-[#E8A020] pl-4 my-4 italic text-[#8A8880]">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-[#E8A020] hover:text-[#D4911C] underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 mb-4 text-[#D4D0C8]">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 mb-4 text-[#D4D0C8]">
                {children}
              </ol>
            ),
            code: ({ children, className }) => {
              if (className) {
                return (
                  <code className="block bg-[#0F0F0E] p-4 rounded-sm text-[#E8A020] text-sm overflow-x-auto mb-4">
                    {children}
                  </code>
                );
              }
              return (
                <code className="bg-[#0F0F0E] px-1.5 py-0.5 rounded text-[#E8A020] text-sm">
                  {children}
                </code>
              );
            },
            hr: () => <hr className="border-[#222220] my-8" />,
          }}
        >
          {part}
        </ReactMarkdown>
      );
    });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.target as HTMLImageElement;
    if (img.dataset.triedFallback === "true") return;
    img.dataset.triedFallback = "true";
    img.src = getFallbackImage(article?.category || "news", article?.id || 0, 1400);
  };


  return (
    <main className="min-h-screen bg-[#0F0F0E] relative">
      <SEO
        title={article?.title}
        description={article?.excerpt}
        image={article?.image}
        type="article"
        authorName={article?.author}
        publishedDate={article?.publishedAt || article?.createdAt}
        updatedDate={article?.updatedAt}
        category={article?.category}
      />
      <Navbar />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] z-[100] bg-transparent">
        <div
          className="h-full bg-[#E8A020] transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Hero Image */}
      <section className="relative h-[300px] md:h-[450px] overflow-hidden bg-black">
        <div className="img-hero-frame">
          <div
            className="img-hero-blur-bg"
            style={{ backgroundImage: `url(${getSafeImage(article.image, article.category, article.id, rw(1400))})` }}
          />
          <img
            src={getSafeImage(article.image, article.category, article.id, rw(1400))}
            alt={article.title}
            className="img-hero-main"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              const img = e.target as HTMLImageElement;
              if (img.dataset.triedFallback === "true") return;
              img.dataset.triedFallback = "true";

              const fallbackUrl = getFallbackImage(article.category || "news", article.id, rw(1400));

              img.src = fallbackUrl;

              const parent = img.parentElement?.parentElement; // frame is parent, hero section is grandparent? No, frame contains blur-bg and img
              if (parent) {
                const blurBg = parent.querySelector('.img-hero-blur-bg') as HTMLElement;
                if (blurBg) blurBg.style.backgroundImage = `url(${fallbackUrl})`;
              }
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0E] via-transparent to-transparent pointer-events-none" />
      </section>

      {/* Article Content */}
      <article className="container py-12 md:py-16">
        <div className="overflow-hidden break-words">
          {/* Back Button */}
          <Link href="/">
            <button className="flex items-center gap-2 text-[#8A8880] hover:text-[#E8A020] transition-colors mb-6">
              <ArrowLeft size={18} />
              Back to Home
            </button>
          </Link>

          {/* Category and Breaking Badge */}
          <div className="flex items-center gap-3 mb-6">
            {article.breaking === 1 && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E8A020] animate-pulse" />
                <span className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest">
                  Breaking News
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content Column */}
            <div className="lg:col-span-8">
              <h1 className="font-display text-4xl md:text-5xl font-900 text-[#F2F0EB] leading-tight mb-4">
                <span>{article.title}</span>
              </h1>
              <p className="text-[#8A8880] text-xl mb-8 leading-relaxed italic border-l-4 border-[#E8A020] pl-6 uppercase tracking-tight">
                <span>{article.excerpt}</span>
              </p>


              {/* Quick Actions Mobile */}
              <div className="md:hidden flex flex-wrap items-center gap-3 mb-6 notranslate">
                <button
                  onClick={handleLikeClick}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-sm transition-all duration-300 ${userLiked ? "like-button-active" : "like-button-inactive"
                    } ${toggleLikeMutation.isPending ? "like-button-loading" : ""}`}
                >
                  <Heart
                    size={18}
                    className={`${isAnimating && userLiked ? "animate-heart-burst" : ""}`}
                    fill={userLiked ? "currentColor" : "none"}
                  />
                  <span className="font-ui text-sm font-700 tabular-nums">
                    {likeCount}
                  </span>
                </button>
                <button
                  onClick={handleBookmarkClick}
                  disabled={toggleBookmarkMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-sm transition-all duration-200 disabled:opacity-50"
                  style={{
                    backgroundColor: isSaved ? "#E8A020" : "transparent",
                    color: isSaved ? "#0F0F0E" : "#8A8880",
                    border: isSaved ? "none" : "1px solid #2A2A28",
                  }}
                >
                  <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                  <span className="font-ui text-sm font-600 uppercase tracking-wider">
                    Save
                  </span>
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-sm transition-all duration-200"
                  style={{
                    backgroundColor: "transparent",
                    color: "#8A8880",
                    border: "1px solid #2A2A28",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="currentColor"
                  >
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z" />
                  </svg>
                  <span className="font-ui text-sm font-600 uppercase tracking-wider">
                    X
                  </span>
                </button>
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-sm transition-all duration-200"
                  style={{
                    backgroundColor: "transparent",
                    color: "#8A8880",
                    border: "1px solid #2A2A28",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.408 0 12.046c0 2.121.54 4.192 1.57 6.052L0 24l6.104-1.602a11.845 11.845 0 005.943 1.602h.005c6.631 0 12.043-5.408 12.046-12.047a11.82 11.82 0 00-3.69-8.498z" />
                  </svg>
                  <span className="font-ui text-sm font-600 uppercase tracking-wider">
                    WhatsApp
                  </span>
                </button>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-[#8A8880] text-sm border-t border-b border-[#1C1C1A] py-4 notranslate">
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
                <div className="flex flex-wrap gap-2 mb-8">
                  {tags.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-[#1C1C1A] text-[#8A8880] font-ui text-xs rounded-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Author Bio */}
              <AuthorBio authorName={article.author} />

              {/* Comments Section */}
              <div className="max-w-3xl mx-auto">
                <h3 className="font-headline text-xl font-700 text-[#F2F0EB] mb-6">
                  Comments
                </h3>

                {/* Approved Comments */}
                {comments && comments.length > 0 ? (
                  <div className="space-y-4 mb-8">
                    {comments.map(comment => {
                      const c = comment as any;
                      const displayName = c.userUsername
                        ? `@${c.userUsername}`
                        : c.userName || "Anonymous";
                      const isOwner =
                        user && (user.id === c.userId || user.role === "admin");
                      const isEditing = editingCommentId === c.id;

                      const ProfileWrapper = ({
                        children,
                      }: {
                        children: React.ReactNode;
                      }) => {
                        if (c.userUsername) {
                          return (
                            <Link href={`/u/${c.userUsername}`}>{children}</Link>
                          );
                        }
                        return <>{children}</>;
                      };

                      return (
                        <div
                          key={c.id}
                          className="bg-[#1C1C1A] rounded-sm p-6 relative group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <ProfileWrapper>
                              <div
                                className={`flex items-center gap-3 ${c.userUsername ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
                              >
                                {c.userAvatarUrl ? (
                                  <img
                                    src={c.userAvatarUrl}
                                    alt={displayName}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-[#2A2A28]"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-[#2A2A28] flex items-center justify-center flex-shrink-0">
                                    <span className="text-[#8A8880] text-xs font-bold">
                                      {displayName.charAt(1)?.toUpperCase() ||
                                        displayName.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <p
                                    className={`font-medium text-sm ${c.userUsername ? "text-[#E8A020]" : "text-[#F2F0EB]"}`}
                                  >
                                    {displayName}
                                  </p>
                                  <p className="text-xs text-[#8A8880] flex items-center gap-1.5">
                                    {new Date(c.createdAt).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      }
                                    )}
                                    {c.isEdited === 1 && (
                                      <span className="italic opacity-70">
                                        (edited)
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </ProfileWrapper>

                            {/* Actions for the comment owner or admin */}
                            {isOwner && !isEditing && (
                              <div className="flex items-center gap-2 opacity-70 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setEditingCommentId(c.id);
                                    setEditContent(c.content);
                                  }}
                                  className="text-[#8A8880] hover:text-[#E8A020] transition-colors p-2"
                                  title="Edit comment"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "Are you sure you want to delete this comment?"
                                      )
                                    ) {
                                      deleteCommentMutation.mutate({ id: c.id });
                                    }
                                  }}
                                  className="text-[#8A8880] hover:text-red-500 transition-colors p-2"
                                  title="Delete comment"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="mt-2">
                              <textarea
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
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
                                    if (
                                      editContent.trim() &&
                                      editContent !== c.content
                                    ) {
                                      editCommentMutation.mutate({
                                        id: c.id,
                                        content: editContent,
                                      });
                                    } else {
                                      setEditingCommentId(null);
                                    }
                                  }}
                                  disabled={
                                    !editContent.trim() ||
                                    editCommentMutation.isPending
                                  }
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-ui uppercase font-600 bg-[#2A2A28] text-[#E8A020] hover:bg-[#E8A020] hover:text-[#0F0F0E] rounded-sm transition-colors disabled:opacity-50"
                                >
                                  <Check size={12} /> Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[#D4D0C8] leading-relaxed whitespace-pre-wrap">
                              {c.content}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[#8A8880] mb-8">
                    No comments yet. Be the first to comment!
                  </p>
                )}

                {/* Comment Form */}
                {allowComments ? (
                  user ? (
                    <div className="bg-[#1C1C1A] rounded-sm p-6">
                      <h4 className="font-medium text-[#F2F0EB] mb-4">
                        Leave a Comment
                      </h4>
                      <textarea
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
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
                        {isSubmitting ? "Submitting..." : "Post Comment"}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-[#1C1C1A] rounded-sm p-6 text-center">
                      <p className="text-[#8A8880] mb-4">
                        Sign in to leave a comment
                      </p>
                      <a
                        href={getLoginUrl()}
                        className="inline-flex items-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-4 py-2 rounded-sm transition-colors"
                      >
                        Sign in to Comment
                      </a>
                    </div>
                  )
                ) : (
                  <div className="bg-[#1C1C1A]/50 rounded-sm p-6 text-center border border-dashed border-[#222220]">
                    <p className="text-[#555550] font-ui text-xs uppercase tracking-widest">
                      Comments are disabled for this article
                    </p>
                  </div>
                )}
              </div>

              {/* Related Articles Section */}
              {relatedArticles && relatedArticles.length > 0 && (
                <div className="mt-16 pt-12 border-t border-[#1C1C1A]">
                  <h3 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-8">
                    Read Next
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedArticles.map(article => {
                      const publishDate = article.publishedAt
                        ? new Date(article.publishedAt)
                        : new Date(article.createdAt);

                      return (
                        <Link key={article.id} href={`/article/${article.slug}`}>
                          <div className="group cursor-pointer">
                            <div className="aspect-[16/9] overflow-hidden rounded-sm mb-4 relative bg-[#1C1C1A]">
                              <img
                                src={getSafeImage(article.image, article.category, article.id, 800)}
                                alt={article.title}
                                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                                decoding="async"
                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                  const img = e.target as HTMLImageElement;
                                  if (img.dataset.triedFallback === "true") return;
                                  img.dataset.triedFallback = "true";
                                  img.src = getFallbackImage(article.category || "news", article.id, 800);
                                }}
                              />
                              <div className="absolute top-3 left-3 bg-[#E8A020] text-[#0F0F0E] text-[10px] font-ui font-bold uppercase tracking-widest px-2 py-1 rounded-sm">
                                {article.category}
                              </div>
                            </div>
                            <h4 className="font-display text-lg text-[#F2F0EB] group-hover:text-[#E8A020] transition-colors line-clamp-2 mb-2">
                              {article.title}
                            </h4>
                            <div className="flex items-center gap-4 text-xs text-[#8A8880] font-ui uppercase tracking-widest">
                              <span>{article.author}</span>
                              <span>
                                {publishDate.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {/* Sticky Sidebar */}
            <aside className="hidden lg:block lg:col-span-4 space-y-8 lg:sticky lg:top-32 h-fit mb-12">
              <div className="bg-[#1C1C1A] rounded-sm p-6 border border-[#2A2A28] shadow-2xl">
                <h3 className="font-ui text-[10px] font-600 text-[#8A8880] uppercase tracking-widest mb-6 block border-b border-[#2A2A28] pb-2">
                  Article Actions
                </h3>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleLikeClick}
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-sm transition-all duration-300 ${userLiked ? "like-button-active" : "like-button-inactive"
                      }`}
                  >
                    <Heart
                      size={20}
                      className={`${isAnimating && userLiked ? "animate-heart-burst" : ""}`}
                      fill={userLiked ? "currentColor" : "none"}
                    />
                    <span className="font-ui text-sm font-700 tabular-nums">
                      {likeCount} Likes
                    </span>
                  </button>

                  <button
                    onClick={handleBookmarkClick}
                    disabled={toggleBookmarkMutation.isPending}
                    className="flex items-center justify-center gap-3 px-6 py-4 rounded-sm transition-all duration-200 disabled:opacity-50"
                    style={{
                      backgroundColor: isSaved ? "#E8A020" : "transparent",
                      color: isSaved ? "#0F0F0E" : "#8A8880",
                      border: isSaved ? "none" : "1px solid #2A2A28",
                    }}
                  >
                    <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
                    <span className="font-ui text-sm font-600 uppercase tracking-wider">
                      {isSaved ? "Saved to Library" : "Save for Later"}
                    </span>
                  </button>

                  <div className="pt-6 border-t border-[#2A2A28]">
                    <span className="font-ui text-[10px] text-[#555550] uppercase tracking-widest mb-4 block">
                      Share with your network
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleShare("facebook")} className="p-3 bg-[#0F0F0E] hover:text-[#E8A020] hover:border-[#E8A020] transition-all rounded-sm border border-[#2A2A28]" title="Facebook">
                        <Facebook size={18} />
                      </button>
                      <button onClick={() => handleShare("twitter")} className="p-3 bg-[#0F0F0E] hover:text-[#E8A020] hover:border-[#E8A020] transition-all rounded-sm border border-[#2A2A28]" title="X (Twitter)">
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="currentColor"
                        >
                          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z" />
                        </svg>
                      </button>
                      <button onClick={() => handleShare("whatsapp")} className="p-3 bg-[#0F0F0E] hover:text-[#E8A020] hover:border-[#E8A020] transition-all rounded-sm border border-[#2A2A28]" title="WhatsApp">
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="currentColor"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.408 0 12.046c0 2.121.54 4.192 1.57 6.052L0 24l6.104-1.602a11.845 11.845 0 005.943 1.602h.005c6.631 0 12.043-5.408 12.046-12.047a11.82 11.82 0 00-3.69-8.498z" />
                        </svg>
                      </button>
                      <button onClick={() => handleShare("copy")} className="p-3 bg-[#0F0F0E] hover:text-[#E8A020] hover:border-[#E8A020] transition-all rounded-sm border border-[#2A2A28]" title="Copy Link">
                        <LinkIcon size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Articles in Sidebar */}
              {relatedArticles && relatedArticles.length > 0 && (
                <div className="bg-[#1C1C1A] rounded-sm p-6 border border-[#2A2A28]">
                  <h3 className="font-ui text-[10px] font-600 text-[#8A8880] uppercase tracking-widest mb-6 block border-b border-[#2A2A28] pb-2">
                    Recommended
                  </h3>
                  <div className="space-y-6">
                    {relatedArticles.slice(0, 3).map(article => (
                      <Link key={article.id} href={`/article/${article.slug}`}>
                        <div className="group cursor-pointer">
                          <h4 className="font-headline text-sm text-[#F2F0EB] group-hover:text-[#E8A020] transition-colors line-clamp-2 mb-1">
                            {article.title}
                          </h4>
                          <span className="text-[10px] font-ui text-[#555550] uppercase tracking-widest">
                            {article.category}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Sidebar Ad Placement */}
              <AdPlacement position="sidebar" className="mt-8" />
            </aside>
          </div>
        </div>
      </article>

      {/* Bottom Ad Placement */}
      <div className="container pb-12 overflow-hidden">
        <AdPlacement position="banner_bottom" />
      </div>

      <Footer />
    </main>
  );
}
