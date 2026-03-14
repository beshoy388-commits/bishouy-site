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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0E] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#E8A020]" size={40} />
      </div>
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
    <main className="min-h-screen bg-[#0F0F0E] relative pt-36">
      <SEO 
        title={`${category.name} Archives`} 
        description={`Explore our full archive of articles in the ${category.name} category. Quality journalism and analysis from Bishouy.com.`}
        category={category.name}
      />
      <Navbar />

      {/* Category Header */}
      <section className="pb-12 md:pb-24 relative overflow-hidden bg-[#0A0A09]">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#E8A020]/20 to-transparent" style={{ backgroundColor: category.color + '22' }} />
        </div>

        <div className="container relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#8A8880] hover:text-[#E8A020] transition-colors mb-10 font-ui text-[10px] uppercase tracking-[0.2em] font-bold"
          >
            <ArrowLeft size={16} />
            BACK TO THE SOURCE
          </Link>

          <div className="bg-[#11110F]/60 backdrop-blur-xl border border-[#1C1C1A] p-8 md:p-12 rounded-lg max-w-4xl shadow-2xl">
            <div className="space-y-8">
              <span
                className="px-5 py-2 text-[10px] font-ui font-900 uppercase tracking-[0.4em] rounded-sm inline-block shadow-lg"
                style={{ backgroundColor: category.color, color: "#000" }}
              >
                {category.name}
              </span>
              <h1 className="font-display text-6xl md:text-9xl text-[#F2F0EB] leading-[0.85] uppercase tracking-tighter">
                {category.name}
              </h1>
              <div className="h-px w-24 bg-[#E8A020] my-8" />
              <p className="font-ui text-[10px] md:text-xs text-[#8A8880] uppercase tracking-[0.3em] flex items-center gap-4 font-bold">
                TOTAL ARCHIVE DEPTH: <span className="text-[#F2F0EB] bg-[#1C1C1A] px-2 py-0.5 rounded">{articles?.length || 0}</span> ARTICLES
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      {articles && articles.length > 0 ? (
        <section className="py-12 md:py-16">
          <div className="container">
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
          </div>
        </section>
      ) : (
        <section className="py-16">
          <div className="container text-center">
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
        </section>
      )}

      <Footer />
    </main>
  );
}
