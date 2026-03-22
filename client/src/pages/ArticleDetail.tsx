import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useRoute } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAudio } from "@/contexts/AudioContext";
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
  Play,
  Square,
  Headphones,
  Zap,
  Activity,
  Maximize2,
  Minimize2,
  FileText,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { getSafeImage, getFallbackImage } from "@/lib/image-utils";
import { useAuth } from "@/_core/hooks/useAuth";
import NeuralSidebarWidget from "@/components/NeuralSidebarWidget";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { formatDateString } from "@/lib/time-utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
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
  const { isPlaying, currentArticleId, togglePlay, stop } = useAudio();

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  // Consolidating all editorial power into a single view (no more Brevity Mode duplication)
  const [isAudioLoading, setIsAudioLoading] = useState(false);

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

  const isMobile = useIsMobile();
  const rw = (w: number) => isMobile ? Math.min(w, 480) : w;


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
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
      return;
    }

    if (links[platform]) {
      window.open(links[platform], "_blank", "noopener,noreferrer,width=600,height=400");
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
    // Strip leading Markdown H1 if it matches or follows the title to avoid duplication
    let strippedContent = content.replace(/^#\s+.*(\r?\n)+/, "");
    
    // Fix Wiki-style headers (== Header ==) into standard Markdown (## Header)
    // even if they have text on the same line or multiple sets of ==
    strippedContent = strippedContent.replace(/==+\s*(.*?)\s*==+/g, "\n\n## $1\n\n");

    // Authenticity Filter: Remove autogenerated imagery (LoremFlickr/Pollinations) securely
    // This regex matches the optional image directive, whitespace, the markdown image containing the bad URL, and optional italics caption
    strippedContent = strippedContent.replace(/(?:<!-- img:[a-z]+:\d+% -->\s*)?!\[[^\]]*\]\([^)]*(?:loremflickr\.com|pollinations\.ai)[^)]*\)(?:\s*\*[^*]+\*)?/gi, "");

    // Split content by image directives <!-- img:position:width% -->
    const parts = strippedContent.split(/(<!-- img:[a-z]+:\d+% -->)/g);
    let currentImageStyle: { position: string; width: string } | null = null;

    const filteredParts = parts;

    // Point 19: Keep track of images rendered to avoid duplicates (2-3 reps)
    const shownImages = new Set<string>();
    if (article?.image) {
       shownImages.add(getSafeImage(article.image, article.category || "news", article.id || 0));
    }

    return filteredParts.map((part, index) => {
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
          rehypePlugins={[rehypeRaw]}
          components={{
            img: ({ src, alt }) => {
              const resolvedSrc = getSafeImage(src, article?.category || "news", article?.id || 0);

              // Point 19: Prevent redundancy. Any image already shown (Hero or earlier body) is skipped.
              if (shownImages.has(resolvedSrc)) return null;
              shownImages.add(resolvedSrc);

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
                    src={resolvedSrc}
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
              <p className="text-[#D4D0C8] font-body text-lg md:text-xl leading-relaxed mb-8">{children}</p>
            ),
            blockquote: ({ children }) => (
              <blockquote className="premium-blockquote">
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

  if (isLoading) return <ArticleDetailSkeleton />;
  if (!article) return <ArticleDetailSkeleton />;

  const isAudioPlaying = isPlaying && currentArticleId === article?.id;

  const handleAudioToggle = () => {
    if (!article) return;
    togglePlay(article.id, article.title, article.excerpt);
  };

  return (
    <main className="min-h-screen bg-[#0F0F0E] selection:bg-[#E8A020]/30 selection:text-[#E8A020] relative">
      <SEO
        title={article.title}
        description={article.excerpt}
        image={article.image}
        type="article"
        authorName={article.author}
        publishedDate={article.publishedAt || article.createdAt}
        updatedDate={article.updatedAt}
        category={article.category}
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
      <article className="container pt-6 md:pt-10 pb-12 md:pb-16 overflow-x-hidden">
        <div className="overflow-hidden break-words">
          {/* Back Button */}
          <Link href={`/category/${article.category.toLowerCase().replace(/\s+/g, '-')}`}>
            <button className="flex items-center gap-2 text-[#8A8880] hover:text-[#E8A020] transition-colors mb-6 font-ui text-[11px] uppercase tracking-widest font-bold">
              <ArrowLeft size={16} />
              Back to {article.category}
            </button>
          </Link>

          {/* Category and Breaking Badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-[#E8A020]/5 px-2 py-1 rounded-sm border border-[#E8A020]/20">
              <Zap size={10} className="text-[#E8A020]" />
              <span className="font-ui text-[9px] font-900 text-[#E8A020] uppercase tracking-widest">
                Verified Intel
              </span>
            </div>
            {article.breaking === 1 && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E8A020] animate-pulse" />
                <span className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest">
                  Breaking
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content Column */}
            <div className="lg:col-span-8">
              <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-900 text-[#F2F0EB] leading-tight mb-6">
                <span>{article.title}</span>
              </h1>
               <div className="text-[#8A8880] text-lg md:text-xl mb-8 leading-relaxed border-l-4 border-[#E8A020] pl-6 tracking-tight prose prose-invert max-w-none">
                <ReactMarkdown>{article.excerpt}</ReactMarkdown>
              </div>


              {/* Quick Actions Mobile - Compact Editorial Bar */}
              <div className="md:hidden grid grid-cols-4 gap-2 mb-8 notranslate">
                <button
                  onClick={handleLikeClick}
                  className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-sm transition-all shadow-sm ${userLiked ? "bg-[#E8A020] text-[#0F0F0E]" : "bg-[#11110F] text-[#8A8880] border border-[#222220]"}`}
                >
                  <Heart
                    size={16}
                    className={`${isAnimating && userLiked ? "animate-heart-burst" : ""}`}
                    fill={userLiked ? "currentColor" : "none"}
                  />
                  <span className="font-ui text-[9px] font-900 uppercase tracking-widest leading-none">
                    {likeCount}
                  </span>
                </button>
                <button
                  onClick={handleBookmarkClick}
                  disabled={toggleBookmarkMutation.isPending}
                  className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-sm transition-all shadow-sm ${isSaved ? "bg-[#E8A020] text-[#0F0F0E]" : "bg-[#11110F] text-[#8A8880] border border-[#222220]"}`}
                >
                  <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                  <span className="font-ui text-[9px] font-900 uppercase tracking-widest leading-none">
                    {isSaved ? "Saved" : "Save"}
                  </span>
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="flex flex-col items-center justify-center gap-1.5 py-4 bg-[#11110F] text-[#8A8880] border border-[#222220] rounded-sm transition-all"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z" />
                  </svg>
                  <span className="font-ui text-[9px] font-900 uppercase tracking-widest leading-none">Share</span>
                </button>
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="flex flex-col items-center justify-center gap-1.5 py-4 bg-[#11110F] text-[#8A8880] border border-[#222220] rounded-sm transition-all"
                >
                  <MessageCircle size={16} />
                  <span className="font-ui text-[9px] font-900 uppercase tracking-widest leading-none">WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className="flex flex-col items-center justify-center gap-1.5 py-4 bg-[#11110F] text-[#8A8880] border border-[#222220] rounded-sm transition-all"
                >
                  <LinkIcon size={16} />
                  <span className="font-ui text-[9px] font-900 uppercase tracking-widest leading-none">Link</span>
                </button>
              </div>

              {/* Neural Audio Briefing */}
              <div className="mb-8 flex items-center justify-between p-6 bg-[#11110F] border border-[#1C1C1A] rounded-sm group overflow-hidden relative shadow-lg">
                <div className="relative z-10">
                  <span className="text-[10px] font-900 text-[#E8A020] uppercase tracking-[0.3em] block mb-2 font-ui">AI Audio Briefing Active</span>
                  <h4 className="font-display text-lg text-[#F2F0EB]">Listen to this story</h4>
                  <p className="text-[10px] text-[#8A8880] mt-1 font-ui uppercase tracking-widest">Powered by AI voice</p>
                </div>
                <button 
                  onClick={handleAudioToggle}
                  className="relative z-10 flex items-center gap-3 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] px-6 py-3 rounded-full font-ui text-[11px] font-900 uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 group/btn"
                >
                  {isAudioPlaying ? (
                    <div className="flex gap-[2px] items-end h-3">
                         <div className="w-1.5 bg-[#0F0F0E] animate-[bounce_0.6s_infinite] h-full" />
                         <div className="w-1.5 bg-[#0F0F0E] animate-[bounce_0.8s_infinite] h-2" />
                         <div className="w-1.5 bg-[#0F0F0E] animate-[bounce_0.5s_infinite] h-3" />
                         <div className="w-1.5 bg-[#0F0F0E] animate-[bounce_0.7s_infinite] h-1" />
                    </div>
                  ) : <Play size={14} fill="currentColor" />}
                  {isAudioPlaying ? "Stop Briefing" : "Play Briefing"}
                </button>
                {/* Abstract Visual Feedback */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <div className="w-full h-full neural-grid" />
                </div>
              </div>

              {/* Intelligence Nexus — Inspired by Semafor/Axios */}
              <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-[#11110F] border-l-2 border-[#E8A020] p-8 rounded-sm shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Zap size={80} className="text-[#E8A020]" />
                  </div>
                  <h3 className="font-ui text-[10px] font-900 text-[#E8A020] uppercase tracking-[0.4em] mb-4">Key Takeaways</h3>
                  <div className="space-y-4">
                    {/* Render AI summary if present */}
                    {article.summary ? (
                       (() => {
                         try {
                           const points = JSON.parse(article.summary);
                           if (!Array.isArray(points)) throw new Error("Not array");
                           return points.map((point: string, idx: number) => (
                             <div key={idx} className="flex gap-4 items-start">
                               <div className="w-1.5 h-1.5 rounded-full bg-[#E8A020] mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(232,160,32,0.6)]" />
                               <div className="text-[#D4D0C8] text-sm leading-relaxed prose prose-sm prose-invert max-w-none">
                                  <ReactMarkdown>{point}</ReactMarkdown>
                                </div>
                             </div>
                           ));
                         } catch (e) {
                           return (
                             <div className="flex gap-4 items-start">
                               <div className="w-1.5 h-1.5 rounded-full bg-[#E8A020] mt-1.5 flex-shrink-0" />
                               <div className="text-[#D4D0C8] text-sm leading-relaxed opacity-80 prose prose-sm prose-invert max-w-none">
                                   <ReactMarkdown>{article.excerpt}</ReactMarkdown>
                                </div>
                             </div>
                           )
                         }
                       })()
                    ) : (
                      <div className="flex gap-4 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E8A020] mt-1.5 flex-shrink-0" />
                        <div className="text-[#D4D0C8] text-sm leading-relaxed opacity-80 prose prose-sm prose-invert max-w-none">
                           <ReactMarkdown>{article.excerpt}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                    

                  </div>
                </div>
                
                <div className="bg-[#11110F] border border-[#1C1C1A] p-8 rounded-sm flex flex-col justify-between group hover:border-[#E8A020]/30 transition-colors shadow-xl">
                    <div>
                        <h4 className="font-ui text-[10px] font-900 text-[#E8A020] uppercase tracking-[0.3em] mb-6">Story Insights</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-[#1C1C1A] pb-3">
                                <span className="text-[10px] text-[#8A8880] uppercase tracking-widest font-ui">Tone</span>
                                <span className="text-[10px] text-[#F2F0EB] font-bold">NEUTRAL</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-[#1C1C1A] pb-3">
                                <span className="text-[10px] text-[#8A8880] uppercase tracking-widest font-ui">Trust Score</span>
                                <span className="text-[10px] text-[#F2F0EB] font-bold">{article.factCheck || "98.4%"}</span>
                            </div>
                            <div className="flex justify-between items-center pb-1">
                                <span className="text-[10px] text-[#8A8880] uppercase tracking-widest font-ui">Importance</span>
                                <span className="text-[10px] text-[#F2F0EB] font-bold">MODERATE</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-4 border-t border-[#1C1C1A] flex items-center gap-2">
                        <Activity size={12} className="text-[#E8A020] animate-pulse" />
                        <span className="text-[9px] text-[#8A8880] uppercase tracking-widest font-900 whitespace-nowrap">Analysis Active</span>
                    </div>
                </div>
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
              <div className="prose prose-invert max-w-none mb-12 article-body-content">
                <div className="font-body text-[#D4D0C8] leading-relaxed">
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

              {/* Related Articles Section - Moved above comments for better visibility */}
              {relatedArticles && relatedArticles.length > 0 && (
                <div className="mt-16 pt-12 border-t border-[#1C1C1A]">
                  <div className="amber-line mb-4" />
                  <h3 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-8">
                    Read Next
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {relatedArticles.map((article: any) => {
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
                            <h4 className="font-display text-lg text-[#F2F0EB] group-hover:text-[#E8A020] transition-colors line-clamp-2 mb-2 font-900 leading-tight">
                              {article.title}
                            </h4>
                            <div className="flex items-center gap-4 text-[10px] text-[#555550] font-ui uppercase tracking-widest">
                              <span className="font-900 text-[#8A8880]">{article.author}</span>
                              <div className="w-1 h-1 rounded-full bg-[#222220] hidden" />
                              <span>
                                {formatDateString(article.publishedAt || article.createdAt)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="max-w-3xl mx-auto">
                <h3 className="font-headline text-xl font-bold text-[#F2F0EB] mb-6">
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
                                    className={`font-500 text-sm flex items-center gap-2 ${c.userUsername ? "text-[#E8A020]" : "text-[#F2F0EB]"}`}
                                  >
                                    {displayName}
                                    {c.userId && c.userId < 100 && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] bg-[#E8A020]/10 border border-[#E8A020]/30 text-[#E8A020] text-[8px] font-900 uppercase tracking-widest leading-none">
                                        Founding Member
                                      </span>
                                    )}
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
                      <h4 className="font-500 text-[#F2F0EB] mb-4">
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
                    <div className="bg-[#1C1C1A] rounded-sm p-8 text-center border border-[#E8A020]/20 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#E8A020]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <h4 className="font-display text-xl text-[#F2F0EB] mb-3 relative z-10">BECOME A MEMBER</h4>
                      <p className="text-[#8A8880] text-sm mb-6 max-w-md mx-auto relative z-10">
                        Sign in to share your analysis, build your personal <strong className="text-[#E8A020]">Intelligence Library</strong>, and unlock exclusive AI-powered features.
                      </p>
                      <Link
                        href={getLoginUrl()}
                        className="inline-flex items-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] hover:scale-105 active:scale-95 text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-widest px-8 py-3 rounded-sm transition-all shadow-lg shadow-[#E8A020]/10"
                      >
                        Join the Conversation
                      </Link>
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
                    <span className="font-ui text-sm font-bold tabular-nums">
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
                    <span className="font-ui text-[11px] font-bold uppercase tracking-widest text-center leading-tight">
                      {isSaved ? "In Your Library" : "Intelligence Library"}
                    </span>
                  </button>

                  <div className="pt-6 border-t border-[#2A2A28]">
                    <span className="font-ui text-[10px] text-[#555550] uppercase tracking-widest mb-4 block">
                      Share with your network
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleShare("linkedin")} className="p-3 bg-[#0F0F0E] hover:text-[#E8A020] hover:border-[#E8A020] transition-all rounded-sm border border-[#2A2A28]" title="LinkedIn">
                        <Linkedin size={18} />
                      </button>
                      <button onClick={() => handleShare("whatsapp")} className="p-3 bg-[#0F0F0E] hover:text-[#E8A020] hover:border-[#E8A020] transition-all rounded-sm border border-[#2A2A28]" title="WhatsApp">
                        <MessageCircle size={18} />
                      </button>
                      <button onClick={() => handleShare("facebook")} className="p-3 bg-[#0F0F0E] hover:text-[#E8A020] hover:border-[#E8A020] transition-all rounded-sm border border-[#2A2A28]" title="Facebook">
                        <Facebook size={18} />
                      </button>
                      <button onClick={() => handleShare("twitter")} className="p-3 bg-[#0F0F0E] hover:text-[#E8A020] hover:border-[#E8A020] transition-all rounded-sm border border-[#2A2A28]" title="X (Twitter)">
                        <Twitter size={18} />
                      </button>
                      <button onClick={() => handleShare("copy")} className="p-3 bg-[#0F0F0E] hover:text-[#E8A020] hover:border-[#E8A020] transition-all rounded-sm border border-[#2A2A28] col-span-2 flex items-center justify-center gap-2 font-ui text-[10px] uppercase tracking-widest" title="Copy Link">
                        <LinkIcon size={14} />
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Indicator - Sidebar */}
              <div className="mb-12">
                <NeuralSidebarWidget category={article.category} />
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
