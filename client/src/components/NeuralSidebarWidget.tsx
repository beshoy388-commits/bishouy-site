import * as React from "react";
import { Activity, ShieldCheck, Zap, BarChart3, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function NeuralSidebarWidget({ category = "Intelligence", locked = false }: { category?: string, locked?: boolean }) {
  const [pulse, setPulse] = React.useState(98.4);

  React.useEffect(() => {
    if (locked) return;
    const interval = setInterval(() => {
      setPulse((prev) => {
        const delta = (Math.random() - 0.5) * 0.2;
        return parseFloat((prev + delta).toFixed(1));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [locked]);

  return (
    <div className={`bg-[#11110F] border border-[#1C1C1A] rounded-sm p-6 shadow-2xl relative overflow-hidden group ${locked ? 'cursor-not-allowed' : ''}`}>
      {/* Background Pulse Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="w-full h-full" style={{ 
          backgroundImage: 'radial-gradient(#E8A020 0.5px, transparent 0.5px)', 
          backgroundSize: '10px 10px' 
        }} />
      </div>

      {locked && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center bg-[#0F0F0E]/80 backdrop-blur-[2px]">
           <Zap size={24} className="text-[#E8A020] mb-3 animate-pulse" fill="currentColor" />
           <span className="text-[10px] font-900 text-[#F2F0EB] uppercase tracking-[0.2em] mb-1">Access Restricted</span>
           <span className="text-[9px] text-[#555550] uppercase tracking-widest leading-tight">Detailed metrics require Premium access</span>
        </div>
      )}

      <div className={`relative z-10 ${locked ? 'blur-[1px] opacity-40 grayscale' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#E8A020] animate-pulse" />
            <span className="text-[10px] font-900 text-[#F2F0EB] uppercase tracking-[0.3em] font-ui">Content Analysis</span>
          </div>
          <Zap size={12} className="text-[#E8A020]" />
        </div>

        <div className="space-y-6">
          {/* Main Metric */}
          <div>
            <div className="flex justify-between items-end mb-1">
              <span className="text-[9px] text-[#555550] uppercase tracking-widest font-ui">Confidence Score</span>
              <span className="text-xl font-serif text-[#F2F0EB] font-900">{pulse}%</span>
            </div>
            <div className="h-1 w-full bg-[#1C1C1A] rounded-full overflow-hidden">
              <motion.div 
                 initial={{ width: "0%" }}
                 animate={{ width: `${pulse}%` }}
                 className="h-full bg-[#E8A020]" 
              />
            </div>
          </div>

          {/* Sub Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1C1C1A]">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[#8A8880]">
                <ShieldCheck size={10} />
                <span className="text-[8px] uppercase tracking-widest font-ui">Source Status</span>
              </div>
              <p className="text-[10px] text-[#F2F0EB] font-bold uppercase tracking-tighter">Verified Source</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[#8A8880]">
                <BarChart3 size={10} />
                <span className="text-[8px] uppercase tracking-widest font-ui">Tone</span>
              </div>
              <p className="text-[10px] text-[#E8A020] font-bold uppercase tracking-tighter">Balanced</p>
            </div>
          </div>

          {/* Analysis Snippet */}
          <div className="bg-[#0A0A09] p-4 border border-[#1C1C1A] rounded-sm">
            <div className="flex items-center gap-2 mb-2">
                <Globe size={10} className="text-[#8A8880]" />
                <span className="text-[9px] text-[#8A8880] uppercase tracking-widest font-ui">Trust Analysis</span>
            </div>
            <p className="text-[10px] text-[#D4D0C8] leading-relaxed italic opacity-70">
              "This {category} report has been analyzed for accuracy and objectivity. Verification complete."
            </p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-[#1C1C1A] flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Activity size={10} className="text-[#27AE60] animate-pulse" />
             <span className="text-[8px] text-[#555550] uppercase tracking-widest font-800">Verified Data</span>
           </div>
           <span className="text-[8px] text-[#333330] font-mono whitespace-nowrap overflow-hidden">ID: {Math.floor(Math.random() * 10000)}</span>
        </div>
      </div>
    </div>
  );
}
