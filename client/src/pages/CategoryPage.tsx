/*
 * BISHOUY.COM — Category Page
 * Display articles filtered by category
 */

import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft } from "lucide-react";
import { CATEGORIES, type Article } from "@/lib/articles";
import Navbar from "@/components/Navbar";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import ArticleCard from "@/components/ArticleCard";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Sparkles } from "lucide-react";

export default function CategoryPage() {
  const [match, params] = useRoute("/category/:slug");
  const slug = params?.slug as string;
  const category = CATEGORIES.find(c => c.slug === slug);

  // Fetch articles from DB filtered by category
  const { 
    data, 
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = trpc.articles.listInfinite.useInfiniteQuery(
    { category: category?.name, limit: 10 },
    { 
      enabled: !!category,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  
  const articles = data?.pages.flatMap(page => page.items) || [];
  const countQuery = trpc.articles.getCount.useQuery(
    { category: category?.name },
    { enabled: !!category }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0F0F0E] flex items-center justify-center">
        <SEO title="International Archive" />
        <Loader2 className="animate-spin text-[#E8A020]" size={40} />
      </main>
    );
  }

  if (!category) {
    return (
      <main className="min-h-screen bg-[#0F0F0E] flex flex-col items-center justify-center">
        <Navbar />
        <div className="text-center py-20">
          <h1 className="font-display text-4xl text-[#F2F0EB] mb-4">
            Category Not Found
          </h1>
          <p className="font-ui text-[#8A8880] mb-6">
            Sorry, we couldn't find the category you're looking for.
          </p>
          <Link
            href="/"
            className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-6 py-3 rounded-sm transition-colors inline-block"
          >
            Back to Home
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F0F0E] relative">
      <SEO 
        title={`${category.name} Archives`} 
        description={`Explore our full archive of articles in the ${category.name} category. Quality journalism and analysis from Bishouy.com.`}
        category={category.name}
      />
      <Navbar />

      {/* Category Header — Vanguard Selection */}
      <section className="pt-32 pb-16 md:pb-24 relative overflow-hidden bg-[#0A0A09]">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#E8A020]/40 to-transparent" style={{ backgroundColor: category.color + '33' }} />
          <div className="absolute inset-0 neural-grid opacity-[0.2]" />
        </div>

        <div className="container relative z-10">
          <div className="bg-[#11110F]/60 backdrop-blur-3xl border border-[#1C1C1A] p-10 md:p-16 rounded-[40px] max-w-5xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8A020]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="space-y-10 relative z-10">
              <div className="flex items-center gap-4">
                <span
                  className="px-5 py-2 text-[10px] font-900 uppercase tracking-[0.4em] rounded-full shadow-lg"
                  style={{ backgroundColor: category.color, color: "#000" }}
                >
                  {category.name}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-[#1C1C1A] to-transparent" />
              </div>
              
              <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] text-[#F2F0EB] leading-[0.8] uppercase tracking-tighter break-words max-w-full font-900 inline-block bg-gradient-to-b from-[#F2F0EB] to-[#8A8880] bg-clip-text text-transparent">
                {category.name}
              </h1>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-8 border-t border-[#1C1C1A]">
                <p className="font-ui text-[10px] md:text-xs text-[#8A8880] uppercase tracking-[0.3em] flex items-center gap-4 font-900">
                  SECTION INTEL: <span className="text-[#E8A020] bg-[#E8A020]/5 border border-[#E8A020]/20 px-3 py-1 rounded-full">{countQuery.data || 0} REPORTS</span>
                </p>
                <div className="flex gap-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#E8A020] animate-pulse" />
                   <div className="w-1.5 h-1.5 rounded-full bg-[#1C1C1A]" />
                   <div className="w-1.5 h-1.5 rounded-full bg-[#1C1C1A]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          {/* AI Category Insight — Neural Synthesis */}
          <div className="bg-[#11110F]/60 backdrop-blur-2xl border border-[#E8A020]/20 p-8 md:p-12 rounded-[32px] mb-20 flex flex-col md:flex-row gap-10 items-center md:items-start group transition-all hover:border-[#E8A020]/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
             <div className="p-5 bg-[#E8A020] rounded-full text-[#0F0F0E] shrink-0 shadow-[0_0_30px_rgba(232,160,32,0.4)] group-hover:rotate-12 transition-all">
                <Sparkles size={32} fill="currentColor" />
             </div>
             <div className="relative z-10 text-center md:text-left">
                <div className="inline-flex items-center gap-2 mb-4">
                   <span className="text-[10px] font-900 text-[#E8A020] uppercase tracking-[0.4em] font-ui">Neural Directives</span>
                   <div className="h-px w-8 bg-[#E8A020]/40" />
                </div>
                <h3 className="font-display text-3xl md:text-4xl text-[#F2F0EB] mb-6 uppercase tracking-tighter">THE {category.name} CHRONICLE</h3>
                <p className="text-lg md:text-xl text-[#F2F0EB]/90 leading-relaxed font-ui font-medium">
                    “{category.description || `Our strategic focus for the ${category.name} intelligence node prioritizes emergent cross-border shifts and high-fidelity reporting on established power structures.`}”
                </p>
                <div className="mt-8 flex items-center gap-4 text-[9px] font-900 text-[#8A8880] uppercase tracking-widest">
                   <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#E8A020]" /> ALPHA FEED</span>
                   <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#E8A020]" /> REAL-TIME ANALYSIS</span>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-80 h-80 bg-[#E8A020]/5 blur-[100px] rounded-full animate-pulse pointer-events-none" />
          </div>

          {articles && articles.length > 0 ? (
            <>
              {/* Featured article from this category */}
              {articles[0] && (
                <div className="mb-12">
                  <ArticleCard article={articles[0]} variant="featured" />
                </div>
              )}

            {/* Remaining articles */}
            {articles.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.slice(1).map((article: Article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="medium"
                  />
                ))}
              </div>
            )}
            
            {hasNextPage && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-8 py-3 rounded-sm transition-colors mx-auto disabled:opacity-50 inline-block"
                >
                  {isFetchingNextPage ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
            </>
          ) : (
            <div className="py-16 text-center">
              <p className="font-ui text-[#8A8880] mb-6">
                No articles found in this category yet.
              </p>
              <Link
                href="/"
                className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-6 py-3 rounded-sm transition-colors inline-block"
              >
                Browse All News
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
