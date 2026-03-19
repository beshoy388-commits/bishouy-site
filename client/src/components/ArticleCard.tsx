/*
 * BISHOUY.COM — ArticleCard Component
 * Dark editorial card with amber accent, image zoom, title hover underline
 * Variants: featured (large), medium, small
 */

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Clock, User, Heart } from "lucide-react";
import type { Article } from "@/lib/articles";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

import { getSafeImage, getFallbackImage } from "@/lib/image-utils";

interface ArticleCardProps {
  article: Article;
  variant?: "featured" | "medium" | "small" | "horizontal";
  showLikes?: boolean;
}

export default function ArticleCard({
  article,
  variant = "medium",
  showLikes = true,
}: ArticleCardProps) {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch like count only if not provided by parent (server-side optimization)
  const likeCountQuery = trpc.likes.getCount.useQuery(
    { articleId: article.id },
    { enabled: article.likeCount === undefined }
  );
  const userLikedQuery = trpc.likes.hasUserLiked.useQuery(
    { articleId: article.id },
    { enabled: !!user && article.hasLiked === undefined }
  );

  const utils = trpc.useUtils();

  // Mutation to toggle like with Optimistic Updates
  const toggleLikeMutation = trpc.likes.toggle.useMutation({
    onMutate: async () => {
      // 1. Snapshot previous values
      const prevLiked = userLiked;
      const prevCount = likeCount;

      // 2. Update local state immediately for instant UI
      setUserLiked(!prevLiked);
      const newCount = prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1;
      setLikeCount(newCount);

      // 3. Update TRPC cache optimistically to prevent "gray-flicker"
      utils.likes.getCount.setData({ articleId: article.id }, newCount);
      utils.likes.hasUserLiked.setData({ articleId: article.id }, !prevLiked);

      if (!prevLiked) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);
      }

      return { prevLiked, prevCount };
    },
    onSuccess: (data: any) => {
      // Synchronize with server response
      setLikeCount(data.likeCount);
      setUserLiked(data.liked);

      // Also ensure cache is up to date
      utils.likes.getCount.setData({ articleId: article.id }, data.likeCount);
      utils.likes.hasUserLiked.setData({ articleId: article.id }, data.liked);
    },
    onError: (error, variables, context: any) => {
      // Rollback on error
      if (context) {
        setUserLiked(context.prevLiked);
        setLikeCount(context.prevCount);
        utils.likes.getCount.setData({ articleId: article.id }, context.prevCount);
        utils.likes.hasUserLiked.setData({ articleId: article.id }, context.prevLiked);
      }
    },
  });

  useEffect(() => {
    // Priority 1: Data from server-side batch (article object)
    if (article.likeCount !== undefined) {
      setLikeCount(article.likeCount);
    }
    // Priority 2: Data from separate follow-up query if needed
    else if (likeCountQuery.data !== undefined) {
      setLikeCount(likeCountQuery.data);
    }
  }, [likeCountQuery.data, article.likeCount]);

  useEffect(() => {
    if (!user) {
      setUserLiked(false);
      return;
    }

    // Priority 1: Data from server-side batch (article object)
    if (article.hasLiked !== undefined) {
      setUserLiked(article.hasLiked);
    }
    // Priority 2: Data from separate follow-up query if needed
    else if (userLikedQuery.data !== undefined) {
      setUserLiked(userLikedQuery.data);
    }
  }, [userLikedQuery.data, user, article.hasLiked]);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = getLoginUrl();
      return;
    }

    toggleLikeMutation.mutate({ articleId: article.id });
  };

  const LikeButton = () => (
    <button
      onClick={handleLikeClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-all duration-300 ${userLiked ? "like-button-active" : "like-button-inactive"
        }`}
    >
      <Heart
        size={14}
        className={`${isAnimating && userLiked ? "animate-heart-burst" : ""}`}
        fill={userLiked ? "currentColor" : "none"}
      />
      <span className="font-ui text-[11px] font-bold tabular-nums">
        {likeCount}
      </span>
    </button>
  );

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const rw = (w: number) => isMobile ? Math.min(w, 480) : w;

  const [pulses, setPulses] = useState<{ x: number; y: number; id: number }[]>([]);

  const handlePulse = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newPulse = { x, y, id: Date.now() };
    setPulses(prev => [...prev, newPulse]);
    setTimeout(() => {
      setPulses(prev => prev.filter(p => p.id !== newPulse.id));
    }, 600);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.target as HTMLImageElement;
    if (img.dataset.triedFallback === "true") return;
    img.dataset.triedFallback = "true";
    img.src = getFallbackImage(article.category || "news", article.id);
  };

  if (variant === "featured") {
    return (
      <Link href={`/article/${article.slug}`}>
        <article 
          onClick={handlePulse}
          className="article-card group relative h-full min-h-[480px] overflow-hidden rounded-sm cursor-pointer"
        >
          {pulses.map(p => (
            <div 
              key={p.id}
              className="neural-click-pulse z-[100]"
              style={{ left: p.x, top: p.y }}
            />
          ))}
          {/* Background image */}
          <div className="img-zoom absolute inset-0">
            <img
              src={getSafeImage(article.image, article.category, article.id, rw(1200))}
              alt={article.title}
              className="img-smart-fit"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onError={handleImageError}
            />
            <div className="neural-scan-line" />
          </div>
          {/* ... (rest of the featured content remains the same) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0E] via-[#0F0F0E]/60 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            {article.breaking === 1 && (
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#E8A020] animate-pulse" />
                <span className="font-ui text-[10px] font-semibold text-[#E8A020] uppercase tracking-widest">
                  Breaking News
                </span>
              </div>
            )}
            <span className="category-badge mb-3 inline-block">
              {article.category}
            </span>
            <h2 className="font-headline text-2xl md:text-3xl font-black text-[#F2F0EB] leading-tight mb-3 title-hover">
              <span>{article.title}</span>
            </h2>
            <p className="font-ui text-sm text-[#8A8880] line-clamp-2 mb-4 hidden md:block">
              <span>{article.excerpt}</span>
            </p>
            <div className="flex items-center gap-4 text-[#8A8880] mb-4">
              <span className="flex items-center gap-1.5 font-ui text-xs">
                <User size={11} />
                {article.author}
              </span>
              <span className="flex items-center gap-1.5 font-ui text-xs">
                <Clock size={11} />
                {article.readTime} min
              </span>
              <span className="font-ui text-xs ml-auto">
                {(article as any).date}
              </span>
            </div>

            {article.tags && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#1C1C1A]/50">
                {(() => {
                  try {
                    const tags = JSON.parse(article.tags as string);
                    return Array.isArray(tags)
                      ? tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[9px] font-ui uppercase tracking-tighter text-[#E8A020]/70"
                        >
                          #{tag}
                        </span>
                      ))
                      : null;
                  } catch {
                    return null;
                  }
                })()}
              </div>
            )}
          </div>

          {showLikes && (
            <div
              className="absolute top-4 right-4 z-20"
              onClick={handleLikeClick}
            >
              <LikeButton />
            </div>
          )}
        </article>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link href={`/article/${article.slug}`}>
        <article 
          onClick={handlePulse}
          className="article-card group flex gap-4 cursor-pointer p-2 md:p-0 rounded-sm bg-[#11110F] md:bg-transparent border border-[#1C1C1A] md:border-none relative overflow-hidden"
        >
          {pulses.map(p => (
            <div 
              key={p.id}
              className="neural-click-pulse z-[100]"
              style={{ left: p.x, top: p.y }}
            />
          ))}
          <div className="img-zoom flex-shrink-0 w-28 h-24 md:w-24 md:h-20 rounded-sm overflow-hidden text-[#0F0F0E]">
            <img
              src={getSafeImage(article.image, article.category, article.id, rw(400))}
              alt={article.title}
              className="img-smart-fit"
              loading="lazy"
              decoding="async"
              onError={handleImageError}
            />
            <div className="neural-scan-line" />
          </div>
          <div className="flex-1 min-w-0 pr-2 py-1 flex flex-col justify-between">
            <div>
              <span
                className="category-badge mb-1.5 inline-block text-[8px]"
                style={{ backgroundColor: article.categoryColor || "#E8A020" }}
              >
                {article.category}
              </span>
              <h3 className="font-headline text-[13px] md:text-sm font-bold text-[#F2F0EB] leading-tight line-clamp-2 md:line-clamp-2 title-hover">
                <span>{article.title}</span>
              </h3>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="font-ui text-[9px] md:text-[11px] text-[#555550] uppercase tracking-tighter">
                {(article as any).date}
              </span>
              {showLikes && <LikeButton />}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "small") {
    return (
      <Link href={`/article/${article.slug}`}>
        <article 
          onClick={handlePulse}
          className="article-card group cursor-pointer border-b border-[#1C1C1A] pb-4 relative overflow-hidden"
        >
          {pulses.map(p => (
            <div 
              key={p.id}
              className="neural-click-pulse z-[100]"
              style={{ left: p.x, top: p.y }}
            />
          ))}
          <span
            className="category-badge mb-2 inline-block"
            style={{ backgroundColor: article.categoryColor || "#E8A020" }}
          >
            {article.category}
          </span>
          <h3 className="font-headline text-sm font-bold text-[#F2F0EB] leading-snug line-clamp-2 title-hover mb-2">
            {article.title}
          </h3>
          <div className="flex items-center gap-3 text-[#8A8880]">
            <span className="font-ui text-[11px]">{(article as any).date}</span>
            <span className="flex items-center gap-1 font-ui text-[11px]">
              <Clock size={10} />
              {article.readTime} min
            </span>
            {showLikes && (
              <div className="ml-auto" onClick={handleLikeClick}>
                <LikeButton />
              </div>
            )}
          </div>
        </article>
      </Link>
    );
  }

  // Default: medium card
  return (
    <Link href={`/article/${article.slug}`}>
      <article 
        onClick={handlePulse}
        className="article-card group cursor-pointer bg-[#1C1C1A] rounded-sm overflow-hidden h-full flex flex-col relative"
      >
        {pulses.map(p => (
          <div 
            key={p.id}
            className="neural-click-pulse z-[100]"
            style={{ left: p.x, top: p.y }}
          />
        ))}
        <div className="img-zoom aspect-video overflow-hidden relative">
          <img
            src={getSafeImage(article.image, article.category, article.id, rw(800))}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={handleImageError}
          />
          <div className="neural-scan-line" />
          {showLikes && (
            <div
              className="absolute top-2 right-2 z-20"
              onClick={handleLikeClick}
            >
              <LikeButton />
            </div>
          )}
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <span
            className="category-badge mb-3 inline-block"
            style={{ backgroundColor: article.categoryColor || "#E8A020" }}
          >
            {article.category}
          </span>
          <h3 className="font-headline text-base font-bold text-[#F2F0EB] leading-snug line-clamp-2 title-hover mb-2">
            <span>{article.title}</span>
          </h3>
          <p className="font-ui text-xs text-[#8A8880] line-clamp-2 mb-4 flex-1">
            <span>{article.excerpt}</span>
          </p>
          <div className="flex items-center gap-3 text-[#8A8880]">
            <span className="font-ui text-[11px]">{article.author}</span>
            <span className="font-ui text-[11px] ml-auto flex items-center gap-1">
              <Clock size={10} />
              {article.readTime} min
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
