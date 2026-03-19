import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Bell, ShieldAlert, Cpu, Terminal, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

type IntelType = "BREAKER" | "SYSTEM" | "NEURAL";

interface IntelNotification {
  id: string;
  type: IntelType;
  title: string;
  message: string;
}

export default function NeuralNotificationCenter() {
  const [notifications, setNotifications] = useState<IntelNotification[]>([]);
  
  // Real-time listener simulation: Check for new "pulse" events
  // In a real scenario, this would be a WebSocket or SSE.
  // We'll simulate a "Cold Start" intel alert.
  
  useEffect(() => {
    // Real-time listener placeholder
  }, []);

  const addNotification = (n: IntelNotification) => {
    setNotifications(prev => [n, ...prev].slice(0, 3));
    setTimeout(() => removeNotification(n.id), 8000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-[180px] right-4 z-[200] flex flex-col gap-4 pointer-events-none w-80 md:w-96">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ x: 100, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 100, opacity: 0, scale: 0.9 }}
            className="pointer-events-auto"
          >
            <div className="bg-[#11110F]/90 backdrop-blur-xl border border-[#E8A020]/20 p-5 shadow-2xl relative overflow-hidden group">
                {/* Visual Flair */}
                <div className="absolute top-0 left-0 w-1 h-full bg-[#E8A020]" />
                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Terminal size={40} className="text-[#E8A020]" />
                </div>
                
                <div className="flex gap-4">
                    <div className="w-10 h-10 shrink-0 bg-[#E8A020]/10 flex items-center justify-center rounded-sm">
                        {n.type === 'BREAKER' && <Zap size={18} className="text-[#E8A020] animate-pulse" />}
                        {n.type === 'SYSTEM' && <Cpu size={18} className="text-[#E8A020]/70" />}
                        {n.type === 'NEURAL' && <ShieldAlert size={18} className="text-red-500" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[8px] font-900 text-[#E8A020] uppercase tracking-[0.3em] font-ui">Live Update</span>
                            <div className="flex gap-[1px] items-center">
                                <div className="w-1 h-1 bg-[#22c55e] rounded-full animate-pulse" />
                                <span className="text-[7px] text-[#22c55e] font-800 uppercase tracking-widest">Live</span>
                            </div>
                        </div>
                        <h4 className="text-[11px] font-display font-900 text-[#F2F0EB] uppercase tracking-wider mb-1 line-clamp-1">
                            {n.title}
                        </h4>
                        <p className="text-[10px] text-[#8A8880] font-ui leading-tight line-clamp-2">
                            {n.message}
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => removeNotification(n.id)}
                        className="text-[#555550] hover:text-[#E8A020] transition-colors self-start"
                    >
                        <X size={12} />
                    </button>
                </div>
                
                {/* Progress bar timer */}
                <div className="absolute bottom-0 left-0 h-[1px] bg-[#E8A020]/30 animate-[progress-down_8s_linear]" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

