/*
 * BISHOUY.COM — Category Page
 * Display articles filtered by category
 */

import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import ArticleCard from "@/components/ArticleCard";
import Footer from "@/components/Footer";
import { getArticlesByCategory, CATEGORIES } from "@/lib/articles";

export default function CategoryPage() {
  const [match, params] = useRoute("/category/:slug");
  const slug = params?.slug as string;
  const category = CATEGORIES.find(c => c.slug === slug);
  const articles = getArticlesByCategory(category?.name || "");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!category) {
    return (
      <div className="min-h-screen bg-[#0F0F0E] flex flex-col items-center justify-center">
        <Navbar />
        <div className="text-center py-20">
          <h1 className="font-display text-4xl text-[#F2F0EB] mb-4">Category Not Found</h1>
          <p className="font-ui text-[#8A8880] mb-6">Sorry, we couldn't find the category you're looking for.</p>
          <Link href="/" className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-6 py-3 rounded-sm transition-colors inline-block">
            Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0E]">
      <Navbar />
      <BreakingNewsTicker />

      {/* Category Header */}
      <section className="pt-32 pb-12">
        <div className="container">
          <Link href="/" className="inline-flex items-center gap-2 text-[#8A8880] hover:text-[#E8A020] transition-colors mb-6 font-ui text-sm">
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="flex items-end gap-4 mb-8">
            <div>
              <span className="category-badge mb-3 inline-block" style={{ backgroundColor: category.color }}>
                {category.name}
              </span>
              <h1 className="font-display text-4xl md:text-5xl text-[#F2F0EB]">
                {category.name}
              </h1>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-[#E8A020] to-transparent hidden md:block" />
          </div>

          <p className="font-ui text-[#8A8880] max-w-2xl">
            {articles.length} article{articles.length !== 1 ? 's' : ''} in this category
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      {articles.length > 0 ? (
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
                {articles.slice(1).map((article) => (
                  <ArticleCard key={article.id} article={article} variant="medium" />
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="py-16">
          <div className="container text-center">
            <p className="font-ui text-[#8A8880] mb-6">No articles found in this category yet.</p>
            <Link href="/" className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-6 py-3 rounded-sm transition-colors inline-block">
              Browse All News
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
