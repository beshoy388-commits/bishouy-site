/*
 * BISHOUY.COM — Home Page
 * Dark Editorial Layout: Hero featured article + grid of articles
 * Design: Asymmetric layout with featured article on left, medium cards on right
 */

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import ArticleCard from "@/components/ArticleCard";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: articles, isLoading } = trpc.articles.list.useQuery(undefined, {
    refetchInterval: 30000, // Refresh articles every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0E] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#E8A020]" size={48} />
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F0F0E]">
        <Navbar />
        <div className="container pt-32 text-center">
          <p className="text-[#8A8880] text-lg">No articles available yet.</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Get featured articles (featured = 1)
  const featured = articles.filter(a => a.featured === 1);
  const mainFeatured = featured[0];
  const secondaryFeatured = featured.slice(1, 3);
  const gridArticles = articles.slice(3);

  return (
    <div className="min-h-screen bg-[#0F0F0E]">
      <Navbar />
      <BreakingNewsTicker />

      {/* Hero Section */}
      <section className="pt-32 pb-12 md:pb-16">
        <div className="container">
          {mainFeatured && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              {/* Main featured article — 2 columns */}
              <div className="lg:col-span-2">
                <ArticleCard article={mainFeatured} variant="featured" />
              </div>

              {/* Secondary featured articles — 1 column */}
              <div className="space-y-4">
                {secondaryFeatured.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="horizontal" />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#1C1C1A]">
        <div className="container py-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-[#E8A020] to-transparent" />
            <span className="font-ui text-[10px] text-[#8A8880] uppercase tracking-widest whitespace-nowrap">
              Latest News
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-[#E8A020] to-transparent" />
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridArticles.map((article, idx) => (
              <div key={article.id} className="fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                <ArticleCard article={article} variant="medium" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 border-t border-[#1C1C1A]">
        <div className="container">
          <div className="bg-[#1C1C1A] rounded-sm p-8 md:p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="amber-line" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl text-[#F2F0EB] mb-2">
              Never Miss Breaking News
            </h2>
            <p className="font-ui text-sm text-[#8A8880] mb-6 max-w-md mx-auto">
              Get instant notifications of the most important stories as they happen, delivered to your device.
            </p>
            <button
              onClick={() => {
                const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                if (emailInput) {
                  emailInput.focus();
                  emailInput.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-6 py-3 rounded-sm transition-colors"
            >
              Subscribe to Newsletter
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
