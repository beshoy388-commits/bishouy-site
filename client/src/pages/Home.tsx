/*
 * BISHOUY.COM — Home Page
 * Dark Editorial Layout: Hero featured article + grid of articles
 * Design: Asymmetric layout with featured article on left, medium cards on right
 */

import { useEffect, lazy, Suspense } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import ArticleCard from "@/components/ArticleCard";
import NeuralMouseBackground from "@/components/NeuralMouseBackground";
import type { Article } from "@/lib/articles";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import SEO from "@/components/SEO";
import ArticleCardSkeleton from "@/components/ArticleCardSkeleton";
import { useAuth } from "@/_core/hooks/useAuth";
// Removed SocialPulse import to enhance home page performance

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { 
    data, 
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = trpc.articles.listInfinite.useInfiniteQuery(
    { limit: 12 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  
  const articles = data?.pages.flatMap(page => page.items) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0E]">
        <SEO title="Loading Latest News..." />
        <Navbar />
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <ArticleCardSkeleton variant="featured" />
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <ArticleCardSkeleton key={i} variant="horizontal" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F0F0E]">
        <SEO title="No Articles" />
        <Navbar />
        <div className="container text-center">
          <p className="text-[#8A8880] text-lg">No articles available yet.</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Get featured articles (featured = 1)
  const featuredArticles = articles.filter((a: Article) => a.featured === 1);
  const mainFeatured = featuredArticles[0] || articles[0];

  // Editor's Picks: Other featured articles first, then latest non-featured
  const secondaryFeatured = [
    ...featuredArticles.filter((a: Article) => a.id !== mainFeatured.id),
    ...articles.filter((a: Article) => a.id !== mainFeatured.id && a.featured !== 1)
  ].slice(0, 3);

  // The rest of the articles for the latest grid
  const gridArticles = articles
    .filter(
      (a: Article) =>
        a.id !== mainFeatured.id &&
        !secondaryFeatured.some((sf: Article) => sf.id === a.id)
    )
    // Removed slice so all dynamically loaded articles show up

  return (
    <main className="min-h-screen bg-[#0F0F0E] relative">
      <SEO />
      <Navbar />

      {/* Hero Section */}
      <section className="py-6 md:py-8 lg:py-8 bg-[#0A0A09]">
        <div className="container relative z-10 transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 md:gap-12">
            <div className="lg:col-span-2 space-y-8 mb-10 lg:mb-0">
               <div className="flex items-center gap-3">
                  <div className="h-[2px] w-12 bg-[#E8A020]" />
                  <span className="font-ui text-[10px] font-900 text-[#E8A020] uppercase tracking-[0.4em]">Featured Story</span>
               </div>
               <ArticleCard article={mainFeatured} variant="featured" />
            </div>
            <div className="space-y-8 mt-10 lg:mt-0">
               <div className="flex items-center justify-between border-b border-[#1C1C1A] pb-4">
                  <h3 className="font-display text-2xl md:text-3xl text-[#F2F0EB] uppercase tracking-tighter">Editor's Picks</h3>
                  <Link href="/category/world" className="text-[11px] font-900 text-[#E8A020] hover:text-[#D4911C] uppercase tracking-[0.2em] transition-colors font-ui">See All</Link>
               </div>
               <div className="space-y-8 mt-4">
                  {secondaryFeatured.map((article: any) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="horizontal"
                    />
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="container py-4">
        <div className="flex items-center gap-4">
          <span className="font-display text-lg text-[#F2F0EB] whitespace-nowrap">
            LATEST STORIES
          </span>
          <div className="flex-1 h-px bg-[#1C1C1A]" />
        </div>
      </div>

      {/* Latest Articles Grid — Expanded to full width for maximum clarity */}
      <section className="py-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {gridArticles.map((article: Article, idx: number) => (
              <div
                key={article.id}
                className="fade-in-up"
                style={{ animationDelay: `${idx * 50}ms` }}
                ref={idx === gridArticles.length - 1 ? (node) => {
                  if (!node || !hasNextPage || isFetchingNextPage) return;
                  const observer = new IntersectionObserver(
                    (entries) => {
                      if (entries[0].isIntersecting) {
                        fetchNextPage();
                        observer.disconnect();
                      }
                    },
                    { threshold: 0.1 }
                  );
                  observer.observe(node);
                } : undefined}
              >
                <ArticleCard article={article} variant="medium" />
              </div>
            ))}
          </div>
          
          {(hasNextPage || isFetchingNextPage) && (
            <div className="mt-12 text-center py-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 border border-[#2A2A28] rounded-full bg-[#11110F]">
                <div className="w-1.5 h-1.5 bg-[#E8A020] rounded-full animate-ping" />
                <span className="font-ui text-[10px] font-900 text-[#8A8880] uppercase tracking-[0.3em]">
                  {isFetchingNextPage ? "Loading Stories..." : "Scroll for more stories"}
                </span>
              </div>
            </div>
          )}

          <div className="mt-16 text-center">
            <div className="inline-block p-[1px] bg-gradient-to-r from-transparent via-[#E8A020] to-transparent w-full max-w-2xl" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!loading && !isAuthenticated && (
        <section className="py-12 md:py-16 border-t border-[#1C1C1A]">
          <div className="container">
            <div className="bg-[#1C1C1A] rounded-sm p-8 md:p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="amber-line" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl text-[#F2F0EB] mb-2">
                Stay Informed, Stay Ahead
              </h2>
              <p className="font-ui text-sm text-[#8A8880] mb-6 max-w-md mx-auto">
                Expert analysis and breaking news from bishouy.com's global
                editorial team.
              </p>
              <Link href="/register">
                <button className="bg-[#E8A020] hover:bg-[#D4911C] hover:scale-[1.03] hover:shadow-lg hover:shadow-[#E8A020]/20 text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-6 py-3 rounded-sm transition-all active:scale-95">
                  Create Free Account
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
