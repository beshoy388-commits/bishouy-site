/*
 * BISHOUY.COM — Home Page
 * Dark Editorial Layout: Hero featured article + grid of articles
 * Design: Asymmetric layout with featured article on left, medium cards on right
 */

import { useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import ArticleCard from "@/components/ArticleCard";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import SEO from "@/components/SEO";
import ArticleCardSkeleton from "@/components/ArticleCardSkeleton";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: articles, isLoading } = trpc.articles.list.useQuery(undefined, {
    refetchInterval: 30000, // Refresh articles every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0E]">
        <SEO title="Loading Latest News..." />
        <Navbar />
        <div className="container pt-32">
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
        <div className="container pt-32 text-center">
          <p className="text-[#8A8880] text-lg">No articles available yet.</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Get featured articles (featured = 1)
  const featuredArticles = articles.filter(a => a.featured === 1);
  const mainFeatured = featuredArticles[0] || articles[0];

  // Editor's Picks: Other featured articles first, then latest non-featured
  const secondaryFeatured = [
    ...featuredArticles.filter(a => a.id !== mainFeatured.id),
    ...articles.filter(a => a.id !== mainFeatured.id && a.featured !== 1)
  ].slice(0, 3);

  // The rest of the articles for the latest grid
  const gridArticles = articles
    .filter(
      a =>
        a.id !== mainFeatured.id &&
        !secondaryFeatured.some(sf => sf.id === a.id)
    )
    .slice(0, 12);

  return (
    <main className="min-h-screen bg-[#0F0F0E]">
      <SEO />
      <Navbar />
      <BreakingNewsTicker />

      {/* Hero Section */}
      <section className="pt-32 pb-12">
        <div className="container">
          {mainFeatured && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Main featured article — 2 columns */}
              <div className="lg:col-span-2">
                <h1 className="font-display text-2xl text-[#F2F0EB] uppercase tracking-[0.2em] mb-8 flex items-center gap-4">
                  Today's Featured
                  <div className="flex-1 h-px bg-gradient-to-r from-[#2A2A28] to-transparent" />
                </h1>
                <ArticleCard article={mainFeatured} variant="featured" />
              </div>

              {/* Secondary column — 3 horizontal cards */}
              <div className="space-y-6">
                <div className="border-l-2 border-[#E8A020] pl-4 mb-4">
                  <h2 className="font-display text-sm text-[#F2F0EB] uppercase tracking-widest">
                    Editor's Picks
                  </h2>
                </div>
                {secondaryFeatured.map(article => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="horizontal"
                  />
                ))}
              </div>
            </div>
          )}
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

      {/* Latest Articles Grid */}
      <section className="py-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gridArticles.map((article, idx) => (
              <div
                key={article.id}
                className="fade-in-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <ArticleCard article={article} variant="medium" />
              </div>
            ))}
          </div>

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
