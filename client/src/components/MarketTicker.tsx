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
    <div className="bg-[#0A0A09] border-b border-[#1C1C1A] py-1.5 overflow-hidden notranslate select-none">
       <div className="container flex items-center justify-between gap-12">
          <div className="flex items-center gap-2 text-[#555550] shrink-0">
              <Activity size={10} className="text-[#E8A020]" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em] font-ui">Neural Link Active</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="flex items-center gap-10 animate-marquee whitespace-nowrap">
                {MARKETS.concat(MARKETS).map((m, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                        <span className="text-[9px] text-[#555550] font-ui uppercase font-black tracking-widest">{m.name}</span>
                        <span className="text-[10px] text-[#F2F0EB] font-serif font-bold">{m.value}</span>
                        <span className={`flex items-center gap-0.5 text-[8px] font-black px-1 rounded-[2px] ${m.change.startsWith('+') ? 'text-[#22c55e] bg-[#22c55e]/10' : 'text-[#ef4444] bg-[#ef4444]/10'}`}>
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
