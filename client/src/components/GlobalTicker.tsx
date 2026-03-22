import { Activity, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { type Article } from "@/lib/articles";

const MARKETS = [
  { name: "S&P 500", value: "5,823.4", change: "+0.45%" },
  { name: "NASDAQ", value: "18,214.8", change: "+0.89%" },
  { name: "BTC", value: "$97,294", change: "-1.23%" },
  { name: "GOLD", value: "$2,656.9", change: "+0.12%" },
  { name: "USD/EUR", value: "1.084", change: "-0.04%" },
];

export default function GlobalTicker() {
  const { data: articles } = trpc.articles.list.useQuery(undefined, {
    staleTime: 300000,
  });

  const breakingNews = articles
    ? (articles as Article[]).filter(a => a.breaking === 1 || a.breaking === true).map(a => a.title)
    : ["Global Economic Pulse Normalizing", "Neural Network Sync Active", "Digital Asset Volatility Monitor"];

  // Combined Data Stream for the unified ticker
  const createItems = () => [
    ...breakingNews.map(title => ({ type: 'news', label: 'NEWS', value: title, change: undefined })),
    ...MARKETS.map(m => ({ type: 'market', label: m.name, value: m.value, change: m.change })),
  ];

  const items = createItems();
  const displayItems = [...items, ...items]; // Loop for marquee

  return (
    <div className="bg-[#0A0A09] border-b border-[#1C1C1A] py-2 overflow-hidden notranslate select-none relative z-10">
      <div className="container-fluid flex items-center justify-between gap-12 px-6">
        <div className="flex items-center gap-2 shrink-0 border-r border-[#1C1C1A] pr-4">
           <Zap size={10} className="text-[#E8A020] animate-pulse" />
           <span className="text-[8px] font-900 text-[#E8A020] uppercase tracking-[0.4em] font-ui whitespace-nowrap">Neural Intelligence Feed</span>
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
            {displayItems.map((item, i) => (
              <div key={i} className="flex items-center gap-8 shrink-0">
                {item.type === 'news' ? (
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-900 text-[#E8A020] tracking-widest px-1.5 py-0.5 bg-[#E8A020]/10 border border-[#E8A020]/20 rounded-[2px]">{item.label}</span>
                    <span className="text-[10px] text-[#F2F0EB] font-ui font-800 uppercase tracking-wider">{item.value}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-[#555550] font-ui uppercase font-900 tracking-widest">{item.label}</span>
                    <span className="text-[10px] text-[#F2F0EB] font-display">{item.value}</span>
                    <span className={`text-[8px] font-900 flex items-center gap-0.5 ${item.change?.startsWith('+') ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                      {item.change?.startsWith('+') ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                      {item.change}
                    </span>
                  </div>
                )}
                <span className="text-[#1C1C1A] font-bold">/</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-[#555550] shrink-0 border-l border-[#1C1C1A] pl-4">
            <div className="flex flex-col items-end">
                <span className="text-[7px] font-900 uppercase tracking-widest text-[#E8A020]/60">Action Node</span>
                <span className="text-[8px] font-900 uppercase tracking-tighter text-[#F2F0EB]">Sync Active</span>
            </div>
            <Activity size={10} className="text-[#E8A020]" />
        </div>
      </div>
    </div>
  );
}
