/*
 * BISHOUY.COM — Breaking News Ticker
 * Animated scrolling ticker below the navbar
 * Amber accent on dark background
 */

import { BREAKING_NEWS, type Article } from "@/lib/articles";
import { trpc } from "@/lib/trpc";

export default function BreakingNewsTicker() {
  const { data: articles } = trpc.articles.list.useQuery(undefined, {
    staleTime: 300000,
    refetchInterval: 60000,
  });

  const breakingNews = articles
    ? (articles as Article[]).filter(a => a.breaking === 1 || a.breaking === true).map(a => a.title)
    : [];

  // Fallback to static if none in DB
  const displayItems = breakingNews.length > 0 ? breakingNews : BREAKING_NEWS;

  // Duplicate for seamless loop
  const items = [...displayItems, ...displayItems];

  return (
    <div className="bg-[#E8A020] overflow-hidden">
      <div className="flex items-stretch">
        {/* Label */}
        <div className="flex-shrink-0 bg-[#0F0F0E] pl-4 pr-3 py-2 flex items-center gap-2 z-10 notranslate border-r border-[#2A2A28]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8A020] animate-pulse" />
          <span className="font-ui text-[9px] font-800 text-[#E8A020] uppercase tracking-[0.2em] whitespace-nowrap">
            Breaking
          </span>
        </div>

        {/* Scrolling content */}
        <div className="overflow-hidden flex-1 relative flex items-center">
          <div className="ticker-track flex flex-nowrap items-center py-2">
            {items.map((news, i) => (
              <div key={i} className="flex-shrink-0 flex items-center">
                <span className="font-ui text-[11px] font-bold text-[#0F0F0E] uppercase tracking-wider whitespace-nowrap px-8">
                  <span>{news}</span>
                </span>
                <span className="text-[#0F0F0E]/40 font-bold notranslate">·</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
