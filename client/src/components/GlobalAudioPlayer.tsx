import { useAudio } from "@/contexts/AudioContext";
import { X, Play, Pause, Activity, RotateCcw, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalAudioPlayer() {
  const {
    isPlaying,
    isPaused,
    currentTitle,
    progress,
    stop,
    pause,
    resume,
    seek,
    skipForward,
    skipBackward
  } = useAudio();

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  return (
    <AnimatePresence>
      {(isPlaying || isPaused) && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-[54px] md:bottom-0 left-0 right-0 md:left-auto md:right-0 md:w-[620px] z-[120] notranslate"
        >
          <div className="bg-[#11110F]/98 backdrop-blur-3xl border border-[#E8A020]/25 px-6 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-t-sm md:rounded-tr-none md:rounded-br-none overflow-hidden relative group">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
              <div className="w-full h-full neural-grid" />
            </div>

            <div className="relative z-10 flex items-center gap-6">
              {/* Left: Status & Audio Vis */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-[#E8A020]/10 p-2 rounded-full">
                  <Activity size={16} className={`text-[#E8A020] ${isPlaying && !isPaused ? "animate-pulse" : "opacity-30"}`} />
                </div>
                <div className="flex flex-col -space-y-0.5">
                  <span className="text-[10px] font-bold text-[#E8A020] tabular-nums">{Math.floor(progress)}%</span>
                  <span className="text-[7px] text-[#555550] font-900 uppercase tracking-widest leading-none">Synth</span>
                </div>
              </div>

              {/* Center: Controls - The Core Interface */}
              <div className="flex items-center gap-3 shrink-0 border-r border-[#E8A020]/10 pr-6">
                <button onClick={skipBackward} className="text-[#8A8880] hover:text-[#E8A020] transition-colors p-1" title="Back">
                  <RotateCcw size={20} />
                </button>
                <button
                  onClick={() => isPaused ? resume() : pause()}
                  className="w-10 h-10 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] flex items-center justify-center rounded-full transition-all shadow-xl active:scale-95 shrink-0"
                >
                  {isPaused ? <Play size={20} fill="currentColor" className="ml-1" /> : <Pause size={20} fill="currentColor" />}
                </button>
                <button onClick={skipForward} className="text-[#8A8880] hover:text-[#E8A020] transition-colors p-1" title="Forward">
                  <RotateCw size={20} />
                </button>
              </div>

              {/* Right: Progress Section - Condensed and Horizontal */}
              <div className="flex-1 flex items-center gap-4 min-w-0">
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={progress}
                    onChange={handleSeek}
                    className="w-full h-0.5 bg-[#1C1C1A] rounded-full appearance-none cursor-pointer accent-[#E8A020] hover:h-1 transition-all"
                    style={{
                      background: `linear-gradient(to right, #E8A020 ${progress}%, #1C1C1A ${progress}%)`
                    }}
                  />
                </div>
                <button onClick={stop} className="text-[#555550] hover:text-[#E8A020] transition-colors p-1 shrink-0">
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
