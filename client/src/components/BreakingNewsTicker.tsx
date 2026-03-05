/*
 * BISHOUY.COM — Breaking News Ticker
 * Animated scrolling ticker below the navbar
 * Amber accent on dark background
 */

import { BREAKING_NEWS } from "@/lib/articles";
import { trpc } from "@/lib/trpc";

export default function BreakingNewsTicker() {
  const { data: breakingArticles } = trpc.articles.list.useQuery({ limit: 10 });
  const breakingNews = breakingArticles
    ? breakingArticles.filter(a => a.breaking === 1).map(a => a.title)
    : [];

  // Fallback to static if none in DB
  const displayItems = breakingNews.length > 0 ? breakingNews : BREAKING_NEWS;

  // Duplicate for seamless loop
  const items = [...displayItems, ...displayItems];

  return (
    <div className="bg-[#E8A020] overflow-hidden">
      <div className="flex items-stretch">
        {/* Label */}
        <div className="flex-shrink-0 bg-[#0F0F0E] px-4 py-2 flex items-center gap-2 z-10">
          <span className="w-2 h-2 rounded-full bg-[#E8A020] animate-pulse" />
          <span className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest whitespace-nowrap">
            Breaking
          </span>
        </div>

        {/* Scrolling content */}
        <div className="overflow-hidden flex-1 relative">
          <div className="ticker-track flex items-center py-2">
            {items.map((news, i) => (
              <span key={i} className="flex items-center">
                <span className="font-ui text-[11px] font-600 text-[#0F0F0E] uppercase tracking-wide whitespace-nowrap px-6">
                  {news}
                </span>
                <span className="text-[#0F0F0E]/40 font-bold">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
