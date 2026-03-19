import { Activity, TrendingUp, TrendingDown } from "lucide-react";

const MARKETS = [
  { name: "S&P 500", value: "5,123.4", change: "+0.45%" },
  { name: "BTC", value: "$67,294", change: "-1.23%" },
  { name: "NASDAQ", value: "16,214.8", change: "+0.89%" },
  { name: "GOLD", value: "$2,156.9", change: "+0.12%" },
  { name: "BISHOUY INDEX", value: "Neural Pulse", change: "98.4" },
  { name: "USD/EUR", value: "0.923", change: "-0.04%" },
];

export default function MarketTicker() {
  return (
    <div className="bg-[#0A0A09] border-b border-[#1C1C1A] py-2.5 overflow-hidden notranslate select-none relative z-50">
       <div className="container flex items-center justify-between gap-12">
          <div className="hidden md:flex items-center gap-2 text-[#555550] shrink-0">
              <Activity size={10} className="text-[#E8A020]" />
              <span className="text-[8px] font-900 uppercase tracking-[0.4em] font-ui">Global Intelligence Feed</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#0A0A09] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0A0A09] to-transparent z-10 pointer-events-none" />
            <div className="flex items-center gap-12 animate-marquee whitespace-nowrap px-4">
                {MARKETS.concat(MARKETS).concat(MARKETS).map((m, i) => (
                    <div key={i} className="flex items-center gap-3 shrink-0 py-1">
                        <span className="text-[9px] text-[#555550] font-ui uppercase font-900 tracking-widest">{m.name}</span>
                        <span className="text-[10px] text-[#F2F0EB] font-serif font-bold">{m.value}</span>
                        <span className={`flex items-center gap-0.5 text-[8px] font-900 px-1 rounded-[2px] ${m.change.startsWith('+') ? 'text-[#22c55e] bg-[#22c55e]/10' : 'text-[#ef4444] bg-[#ef4444]/10'}`}>
                            {m.change.startsWith('+') ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                            {m.change}
                        </span>
                    </div>
                ))}
            </div>
          </div>
       </div>
    </div>
  )
}
