import { useAudio } from "@/contexts/AudioContext";
import { X, Play, Square, Headphones, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalAudioPlayer() {
  const { isPlaying, currentTitle, stop } = useAudio();

  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-[88px] md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-80 z-[120] notranslate"
        >
          <div className="bg-[#11110F]/90 backdrop-blur-xl border border-[#E8A020]/30 p-4 shadow-2xl rounded-sm overflow-hidden relative group">
            {/* Minimal Pulse Background */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                <div className="w-full h-full neural-grid" />
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-[#E8A020]/10 flex items-center justify-center rounded-full shrink-0 relative overflow-hidden">
                <Activity size={20} className="text-[#E8A020] animate-pulse" />
                <motion.div 
                   animate={{ scale: [1, 1.2, 1] }} 
                   transition={{ duration: 1, repeat: Infinity }}
                   className="absolute inset-0 border-2 border-[#E8A020]/20 rounded-full"
                />
              </div>

              <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2 mb-1">
                    <span className="text-[8px] font-900 text-[#E8A020] uppercase tracking-[0.3em] font-ui">Neural Link Active</span>
                    <Headphones size={8} className="text-[#8A8880]" />
                 </div>
                 <h4 className="text-[11px] font-headline font-bold text-[#F2F0EB] truncate pr-4">
                    {currentTitle}
                 </h4>
                 <div className="flex items-center gap-1 mt-1 text-[8px] text-[#555550] uppercase tracking-widest font-800">
                    <div className="flex gap-[2px] items-end h-2">
                         <div className="w-0.5 bg-[#E8A020] animate-[bounce_0.6s_infinite] h-full" />
                         <div className="w-0.5 bg-[#E8A020] animate-[bounce_0.6s_infinite_100ms] h-1/2" />
                         <div className="w-0.5 bg-[#E8A020] animate-[bounce_0.6s_infinite_200ms] h-[80%]" />
                    </div>
                    <span>Streaming Intelligence...</span>
                 </div>
              </div>

              <button 
                onClick={stop}
                className="w-10 h-10 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] flex items-center justify-center rounded-sm transition-all shadow-xl hover:scale-105 active:scale-95 group/btn shrink-0"
              >
                <Square size={14} fill="currentColor" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
