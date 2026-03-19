import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import { trpc } from "@/lib/trpc";
import { Loader2, Search as SearchIcon, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Search() {
  const [match, params] = useRoute("/search");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Extract query from URL params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get("q") || "";
    setSearchQuery(q);
    setDebouncedQuery(q);
  }, []);

  // Query for search results
  const searchQuery_trpc = trpc.articles.search.useQuery(
    { query: debouncedQuery } as any,
    { enabled: debouncedQuery.length > 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState(
        {},
        "",
        `/search?q=${encodeURIComponent(searchQuery)}`
      );
    }
  };

  const results = searchQuery_trpc.data || [];
  const isLoading = searchQuery_trpc.isLoading;
  const hasSearched = debouncedQuery.length > 0;

  return (
    <div className="min-h-screen bg-[#0F0F0E] flex flex-col">
      <Navbar />

      {/* Search Bar Section */}
      <section className="bg-[#0F0F0E] border-b border-[#1C1C1A] py-8 md:py-12">
        <div className="container">
          <Link href="/">
            <button className="flex items-center gap-2 text-[#8A8880] hover:text-[#E8A020] transition-colors mb-6">
              <ArrowLeft size={18} />
              Back to Home
            </button>
          </Link>

          <div className="max-w-2xl mx-auto">
            <h1 className="font-display text-3xl md:text-4xl font-900 text-[#F2F0EB] mb-6">
              Search Articles
            </h1>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by title, content, or tags..."
                  className="w-full bg-[#1C1C1A] border border-[#2A2A28] rounded-sm px-4 py-3 text-[#D4D0C8] placeholder-[#555550] focus:outline-none focus:border-[#E8A020] transition-colors"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-6 py-3 rounded-sm transition-colors"
              >
                <SearchIcon size={16} />
                Search
              </button>
            </form>

            {hasSearched && (
              <p className="text-[#8A8880] text-sm mt-4">
                {isLoading ? (
                  "Searching..."
                ) : results.length > 0 ? (
                  <>
                    Found{" "}
                    <span className="text-[#E8A020] font-600">
                      {results.length}
                    </span>{" "}
                    result{results.length !== 1 ? "s" : ""}
                  </>
                ) : (
                  <>
                    No results found for "
                    <span className="text-[#E8A020]">{debouncedQuery}</span>"
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="flex-1 container py-12 md:py-16">
        {!hasSearched ? (
          <div className="max-w-2xl mx-auto text-center py-12">
            <SearchIcon size={48} className="mx-auto mb-4 text-[#555550]" />
            <p className="text-[#8A8880] text-lg">
              Enter a search term to find articles
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#E8A020]" size={40} />
          </div>
        ) : results.length > 0 ? (
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  variant="medium"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center py-12">
            <p className="text-[#8A8880] text-lg mb-4">
              No articles found matching your search.
            </p>
            <p className="text-[#555550] text-sm">
              Try different keywords or browse by category.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
