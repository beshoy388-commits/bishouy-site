import { Activity, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { type Article } from "@/lib/articles";

const MARKETS = [
  { name: "S&P 500", value: "5,123.4", change: "+0.45%" },
  { name: "BTC", value: "$67,294", change: "-1.23%" },
  { name: "NASDAQ", value: "16,214.8", change: "+0.89%" },
  { name: "GOLD", value: "$2,156.9", change: "+0.12%" },
];

export default function GlobalTicker() {
  const { data: articles } = trpc.articles.list.useQuery(undefined, {
    staleTime: 300000,
  });

  const breakingNews = articles
    ? (articles as Article[]).filter(a => a.breaking === 1 || a.breaking === true).map(a => a.title)
    : [];

  return (
    <div className="bg-[#E8A020] border-b border-[#0F0F0E]/10 py-2 overflow-hidden notranslate select-none relative z-50">
      <div className="container-fluid flex items-center justify-between gap-12 px-6">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-[#0F0F0E] px-2 py-0.5 rounded-sm">
             <Zap size={10} className="text-[#E8A020] animate-pulse" />
             <span className="text-[8px] font-900 text-[#E8A020] uppercase tracking-[0.2em] font-ui">LIVE FEED</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center gap-16 animate-marquee whitespace-nowrap">
            {/* Breaking News Part */}
            {breakingNews.map((news, i) => (
              <div key={`news-${i}`} className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-[#0F0F0E] font-ui uppercase font-900 tracking-wider">BREAKING: {news}</span>
                <span className="text-[#0F0F0E]/40 font-bold">·</span>
              </div>
            ))}

            {/* Market Part */}
            {MARKETS.map((m, i) => (
              <div key={`market-${i}`} className="flex items-center gap-3 shrink-0">
                <span className="text-[9px] text-[#0F0F0E]/80 font-ui uppercase font-800 tracking-widest">{m.name}</span>
                <span className="text-[10px] text-[#0F0F0E] font-bold">{m.value}</span>
                <span className={`text-[8px] font-900 flex items-center gap-0.5 ${m.change.startsWith('+') ? 'text-[#065F46]' : 'text-[#991B1B]'}`}>
                  {m.change.startsWith('+') ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                  {m.change}
                </span>
                <span className="text-[#0F0F0E]/20">/</span>
              </div>
            ))}

            {/* Loop for seamless effect */}
            {breakingNews.map((news, i) => (
              <div key={`news-loop-${i}`} className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-[#0F0F0E] font-ui uppercase font-900 tracking-wider">BREAKING: {news}</span>
                <span className="text-[#0F0F0E]/40 font-bold">·</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-[#0F0F0E]/60 shrink-0">
            <Activity size={10} />
            <span className="text-[8px] font-900 uppercase tracking-widest font-ui">Neural-Sync Active</span>
        </div>
      </div>
    </div>
  );
}
