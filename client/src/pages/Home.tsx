/*
 * BISHOUY.COM — Home Page
 * Dark Editorial Layout: Hero featured article + grid of articles
 * Design: Asymmetric layout with featured article on left, medium cards on right
 */

import { useEffect, lazy, Suspense } from "react";
import { Link } from "wouter";
import { Sparkles } from "lucide-react";
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
        <SEO title="International News & Analysis" />
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

      {/* Hero Section — Modern Neural Elevation */}
      <section className="relative pt-0 pb-12 md:py-16 bg-[#0A0A09] overflow-hidden">
        {/* Atmosphere */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] neural-grid" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#E8A020]/5 rounded-full blur-[160px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="container relative z-10 transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            <div className="lg:col-span-2 space-y-8 mb-10 lg:mb-0">
               <div className="flex items-center gap-3">
                  <div className="h-[2px] w-12 bg-[#E8A020]" />
                  <span className="font-display text-[14px] font-900 text-[#E8A020] uppercase tracking-[0.3em]">Featured Intelligence</span>
               </div>
               <ArticleCard article={mainFeatured} variant="featured" />
            </div>
            <div className="space-y-8 mt-6 lg:mt-0">
               <div className="flex items-center justify-between border-b border-[#1C1C1A] pb-4">
                  <h3 className="font-display text-2xl md:text-3xl text-[#F2F0EB] uppercase tracking-tighter font-bold">Editor's Picks</h3>
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
      <div className="container py-8 overflow-hidden">
        <div className="flex items-center gap-6 opacity-30">
          <span className="font-display text-sm text-[#F2F0EB] uppercase tracking-[0.4em] whitespace-nowrap">
            REAL-TIME INTEL FEED
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-[#2A2A28] to-transparent" />
        </div>
      </div>

      {/* Latest Articles Grid — Expanded to full width for maximum clarity */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
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
            <div className="mt-16 text-center py-20">
                <button 
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="inline-flex items-center gap-4 px-10 py-5 border border-[#1C1C1A] hover:border-[#E8A020]/40 transition-all rounded-full bg-[#11110F] cursor-pointer group disabled:opacity-50 shadow-2xl"
                >
                  <div className={`w-2 h-2 bg-[#E8A020] rounded-full ${isFetchingNextPage ? 'animate-ping' : 'group-hover:scale-125 transition-transform'}`} />
                  <span className="font-ui text-[11px] font-900 text-[#8A8880] group-hover:text-[#F2F0EB] transition-colors uppercase tracking-[0.4em]">
                    {isFetchingNextPage ? "Analyzing Data Streams..." : "Decrypt More Content"}
                  </span>
                </button>
            </div>
          )}

          <div className="mt-20 text-center">
            <div className="inline-block p-[0.5px] bg-gradient-to-r from-transparent via-[#E8A020]/20 to-transparent w-full max-w-4xl" />
          </div>
        </div>
      </section>

      {/* CTA Section - Vanguard Style */}
      {!loading && !isAuthenticated && (
        <section className="py-24 md:py-32 relative overflow-hidden">
          {/* Atmosphere */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] neural-grid" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E8A020]/5 rounded-full blur-[140px] pointer-events-none" />

          <div className="container relative z-10">
            <div className="bg-gradient-to-br from-[#11110F] to-[#0A0A09] border border-[#1C1C1A] rounded-2xl p-10 md:p-20 text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8A020]/10 border border-[#E8A020]/20 mb-8 mx-auto">
                <Sparkles size={12} className="text-[#E8A020]" />
                <span className="text-[10px] font-900 text-[#E8A020] uppercase tracking-[0.2em]">Intelligence Access</span>
              </div>
              <h2 className="font-display text-4xl md:text-6xl text-[#F2F0EB] mb-6 leading-none tracking-tighter uppercase font-bold">
                ENLIST IN THE <br className="hidden md:block"/> <span className="text-[#E8A020]">VANGUARD</span>
              </h2>
              <p className="font-ui text-sm md:text-md text-[#8A8880] mb-12 max-w-xl mx-auto uppercase tracking-[0.2em] leading-relaxed">
                Unlock deep-tier regional analysis and neural briefings by joining our global network today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/register">
                  <button className="w-full sm:w-auto bg-[#E8A020] hover:bg-[#D4911C] hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(232,160,32,0.3)] text-[#0F0F0E] font-ui text-[11px] font-900 uppercase tracking-widest px-12 py-5 rounded-sm transition-all active:scale-95 shadow-2xl">
                    Create Identity
                  </button>
                </Link>
                <Link href="/login">
                  <button className="w-full sm:w-auto border border-[#2A2A28] hover:border-[#E8A020] text-[#8A8880] hover:text-[#F2F0EB] font-ui text-[11px] font-900 uppercase tracking-widest px-12 py-5 rounded-sm transition-all active:scale-95">
                    Sign In
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
