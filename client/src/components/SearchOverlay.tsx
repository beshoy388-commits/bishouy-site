import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { getSafeImage, getFallbackImage } from "@/lib/image-utils";

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(timer);
    }, [query]);

    const searchQuery = trpc.articles.search.useQuery(
        { query: debouncedQuery } as any,
        { enabled: debouncedQuery.length >= 2 }
    );

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
            setQuery("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#0F0F0E]/98 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="container py-6">
                <div className="flex items-center justify-between mb-8">
                    <span className="font-display text-2xl text-[#F2F0EB]">Search</span>
                    <button
                        onClick={onClose}
                        className="p-2 text-[#8A8880] hover:text-[#F2F0EB] transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="relative mb-12">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555550]" size={24} />
                        <input
                            autoFocus
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Start typing to search articles..."
                            className="w-full bg-[#1C1C1A] border-b-2 border-[#2A2A28] focus:border-[#E8A020] px-14 py-6 text-2xl text-[#F2F0EB] placeholder-[#555550] outline-none transition-all"
                        />
                        {searchQuery.isLoading && (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#E8A020]" size={24} />
                        )}
                    </div>

                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                        {searchQuery.data && searchQuery.data.length > 0 ? (
                            searchQuery.data.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/article/${article.slug}`}
                                    onClick={onClose}
                                >
                                    <div className="group flex gap-4 p-4 rounded-sm hover:bg-[#1C1C1A] transition-all cursor-pointer">
                                        <div className="w-24 h-16 bg-[#2A2A28] rounded-sm overflow-hidden shrink-0">
                                            {article.image && (
                                                <img
                                                    src={getSafeImage(article.image, article.category, article.id, 400)}
                                                    alt=""
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                                        const img = e.target as HTMLImageElement;
                                                        if (img.dataset.triedFallback === "true") return;
                                                        img.dataset.triedFallback = "true";
                                                        img.src = getFallbackImage(article.category || "news", article.id, 400);
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[10px] font-ui text-[#E8A020] uppercase tracking-widest block mb-1">
                                                {article.category}
                                            </span>
                                            <h4 className="text-[#F2F0EB] font-headline text-lg group-hover:text-[#E8A020] transition-colors line-clamp-1">
                                                {article.title}
                                            </h4>
                                        </div>
                                        <ArrowRight className="text-[#2A2A28] group-hover:text-[#E8A020] transition-colors self-center" size={20} />
                                    </div>
                                </Link>
                            ))
                        ) : debouncedQuery.length >= 2 && !searchQuery.isLoading ? (
                            <div className="text-center py-12">
                                <p className="text-[#8A8880]">No articles found for "{debouncedQuery}"</p>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-[#555550]">Type at least 2 characters to search...</p>
                            </div>
                        )}
                    </div>

                    {searchQuery.data && searchQuery.data.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-[#1C1C1A] text-center">
                            <Link href={`/search?q=${query}`} onClick={onClose} className="text-[#E8A020] hover:underline font-ui text-sm">
                                View all results for "{query}"
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
