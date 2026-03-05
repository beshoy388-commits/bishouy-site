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

  // Fetch like count
  const likeCountQuery = trpc.likes.getCount.useQuery({
    articleId: article.id,
  });
  const userLikedQuery = trpc.likes.hasUserLiked.useQuery(
    { articleId: article.id },
    { enabled: !!user }
  );

  const toggleLikeMutation = trpc.likes.toggle.useMutation({
    onSuccess: (data: any) => {
      setLikeCount(data.likeCount);
      setUserLiked(data.liked);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    },
  });

  useEffect(() => {
    if (likeCountQuery.data !== undefined) {
      setLikeCount(likeCountQuery.data);
    }
  }, [likeCountQuery.data]);

  useEffect(() => {
    if (userLikedQuery.data !== undefined) {
      setUserLiked(userLikedQuery.data);
    }
  }, [userLikedQuery.data]);

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
      disabled={toggleLikeMutation.isPending}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-all duration-200 disabled:opacity-50"
      style={{
        backgroundColor: userLiked ? "#E8A020" : "transparent",
        color: userLiked ? "#0F0F0E" : "#8A8880",
        border: userLiked ? "none" : "1px solid #2A2A28",
      }}
    >
      <Heart
        size={14}
        className={`transition-transform duration-300 ${isAnimating && userLiked ? "scale-125" : "scale-100"
          }`}
        fill={userLiked ? "currentColor" : "none"}
      />
      <span className="font-ui text-[11px] font-600 uppercase tracking-wider">
        {likeCount}
      </span>
    </button>
  );

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.target as HTMLImageElement;
    const category = article.category || "news";
    const lock = article.id || 1;

    if (img.src.includes('pollinations.ai')) {
      // Fallback to themed LoremFlickr with deterministic lock
      img.src = `https://loremflickr.com/1200/800/${encodeURIComponent(category)}/all?lock=${lock}`;
    } else if (img.src.includes('loremflickr.com')) {
      // Final fallback to high-quality Unsplash
      img.src = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
    }
  };

  if (variant === "featured") {
    return (
      <Link href={`/articolo/${article.slug}`}>
        <article className="article-card group relative h-full min-h-[480px] overflow-hidden rounded-sm cursor-pointer">
          {/* Background image */}
          <div className="img-zoom absolute inset-0">
            <img
              src={article.image}
              alt={article.title}
              className="img-smart-fit"
              loading="lazy"
              onError={handleImageError}
            />
          </div>
          {/* ... (rest of the featured content remains the same) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0E] via-[#0F0F0E]/60 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            {article.breaking === 1 && (
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#E8A020] animate-pulse" />
                <span className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest">
                  Breaking News
                </span>
              </div>
            )}
            <span className="category-badge mb-3 inline-block">
              {article.category}
            </span>
            <h2 className="font-headline text-2xl md:text-3xl font-900 text-[#F2F0EB] leading-tight mb-3 title-hover">
              {article.title}
            </h2>
            <p className="font-ui text-sm text-[#8A8880] line-clamp-2 mb-4 hidden md:block">
              {article.excerpt}
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
      <Link href={`/articolo/${article.slug}`}>
        <article className="article-card group flex gap-4 cursor-pointer">
          <div className="img-zoom flex-shrink-0 w-24 h-20 rounded-sm overflow-hidden text-[#0F0F0E]">
            <img
              src={article.image}
              alt={article.title}
              className="img-smart-fit"
              loading="lazy"
              onError={handleImageError}
            />
          </div>
          <div className="flex-1 min-w-0">
            <span
              className="category-badge mb-1.5 inline-block"
              style={{ backgroundColor: article.categoryColor || "#E8A020" }}
            >
              {article.category}
            </span>
            <h3 className="font-headline text-sm font-700 text-[#F2F0EB] leading-snug line-clamp-2 title-hover mb-2">
              {article.title}
            </h3>
            <div className="flex items-center justify-between">
              <span className="font-ui text-[11px] text-[#8A8880]">
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
      <Link href={`/articolo/${article.slug}`}>
        <article className="article-card group cursor-pointer border-b border-[#1C1C1A] pb-4">
          <span
            className="category-badge mb-2 inline-block"
            style={{ backgroundColor: article.categoryColor || "#E8A020" }}
          >
            {article.category}
          </span>
          <h3 className="font-headline text-sm font-700 text-[#F2F0EB] leading-snug line-clamp-2 title-hover mb-2">
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
    <Link href={`/articolo/${article.slug}`}>
      <article className="article-card group cursor-pointer bg-[#1C1C1A] rounded-sm overflow-hidden h-full flex flex-col">
        <div className="img-zoom aspect-video overflow-hidden relative">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={handleImageError}
          />
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
          <h3 className="font-headline text-base font-700 text-[#F2F0EB] leading-snug line-clamp-2 title-hover mb-2">
            {article.title}
          </h3>
          <p className="font-ui text-xs text-[#8A8880] line-clamp-2 mb-4 flex-1">
            {article.excerpt}
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
