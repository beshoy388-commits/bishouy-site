import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { 
  Zap, 
  Activity, 
  Globe, 
  Cpu, 
  Terminal, 
  ShieldCheck, 
  Layers,
  Search,
  Server
} from "lucide-react";
import { useState, useEffect } from "react";

export default function NeuralNexus() {
  const visitors = trpc.analytics.getLiveVisitors.useQuery();
  const { data: articles } = trpc.articles.list.useQuery({ limit: 5 });

  const [simulatedLoad, setSimulatedLoad] = useState(74.2);
  
  useEffect(() => {
    const interval = setInterval(() => {
        setSimulatedLoad(prev => +(prev + (Math.random() - 0.5) * 5).toFixed(1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F0E] flex flex-col overflow-x-hidden">
      <SEO title="Neural Nexus — System Intelligence" noindex={true} />
      <Navbar />

      <main className="flex-1 container pt-32 pb-24 relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#E8A020]/5 blur-[200px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-6xl mx-auto">
            {/* Header Terminal */}
            <div className="mb-12 border-b border-[#1C1C1A] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-[10px] font-900 text-[#E8A020] uppercase tracking-[0.5em] mb-4 block font-ui">System Oversight</span>
                    <h1 className="font-display text-5xl md:text-7xl text-[#F2F0EB] uppercase tracking-tighter leading-none">
                        Neural <span className="text-[#E8A020]">Nexus</span>
                    </h1>
                </div>
                <div className="flex items-center gap-8 text-[#555550] font-ui text-[10px] uppercase tracking-widest font-800">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                        <span>Core Stable</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Terminal size={14} />
                        <span>v1.43-Node</span>
                    </div>
                </div>
            </div>

            {/* Grid Terminals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {/* Traffic Terminal */}
                <div className="bg-[#11110F] border border-[#1C1C1A] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Globe size={64} className="text-[#E8A020]" />
                    </div>
                    <h3 className="text-[10px] font-900 text-[#555550] uppercase tracking-widest mb-6 border-b border-[#1C1C1A] pb-3 flex items-center gap-2">
                        <Activity size={12} className="text-[#E8A020]" />
                        Traffic Pulse
                    </h3>
                    <div className="flex items-end gap-3 mb-2">
                        <span className="text-6xl font-display text-[#F2F0EB]">{visitors.data || "???"}</span>
                        <span className="text-[10px] text-[#22c55e] mb-3 font-800">Active Nodes</span>
                    </div>
                    <p className="text-[10px] text-[#8A8880] uppercase tracking-tighter">Real-time engagement telemetry.</p>
                </div>

                {/* Synth Terminal */}
                <div className="bg-[#11110F] border border-[#1C1C1A] p-8 relative overflow-hidden group">
                    <h3 className="text-[10px] font-900 text-[#555550] uppercase tracking-widest mb-6 border-b border-[#1C1C1A] pb-3 flex items-center gap-2">
                        <Cpu size={12} className="text-[#E8A020]" />
                        Neural Load
                    </h3>
                    <div className="flex items-end gap-3 mb-2">
                        <span className="text-6xl font-display text-[#F2F0EB]">{simulatedLoad}%</span>
                        <span className="text-[10px] text-[#E8A020] mb-3 font-800">System Pressure</span>
                    </div>
                    <div className="w-full h-1 bg-[#1C1C1A] mt-4 relative">
                        <motion.div 
                            className="absolute h-full bg-[#E8A020]"
                            animate={{ width: `${simulatedLoad}%` }}
                        />
                    </div>
                </div>

                {/* Database Terminal */}
                <div className="bg-[#11110F] border border-[#1C1C1A] p-8 relative overflow-hidden group">
                    <h3 className="text-[10px] font-900 text-[#555550] uppercase tracking-widest mb-6 border-b border-[#1C1C1A] pb-3 flex items-center gap-2">
                        <Server size={12} className="text-[#E8A020]" />
                        Archive Grid
                    </h3>
                    <div className="flex items-end gap-3 mb-2">
                        <span className="text-6xl font-display text-[#F2F0EB]">CORE</span>
                        <span className="text-[10px] text-[#8A8880] mb-3 font-800">Alpha Status</span>
                    </div>
                    <p className="text-[10px] text-[#8A8880] uppercase tracking-tighter italic">Relational schema locked and encrypted.</p>
                </div>
            </div>

            {/* Deep Intelligence Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 bg-[#11110F] border border-[#1C1C1A] p-0 overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-[#1C1C1A] flex items-center justify-between bg-[#141412]">
                        <h3 className="text-[10px] font-900 text-[#F2F0EB] uppercase tracking-[0.3em] flex items-center gap-3 font-ui">
                            <Layers size={14} className="text-[#E8A020]" />
                            Intelligence Stream — Level 01
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-[#E8A020] animate-pulse" />
                            <span className="text-[8px] text-[#555550] uppercase font-800 tracking-widest">Live Monitoring</span>
                        </div>
                    </div>
                    <div className="divide-y divide-[#1C1C1A]">
                        {articles && articles.map((article: any, idx: number) => (
                            <motion.div 
                                key={article.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 hover:bg-[#1C1C1A]/30 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2 text-[9px] text-[#555550] uppercase font-900 tracking-widest font-ui">
                                        <span className="text-[#E8A020]">{article.category}</span>
                                        <span className="opacity-30">/</span>
                                        <span>Node ID: {article.id}</span>
                                    </div>
                                    <h4 className="text-xl font-headline font-bold text-[#F2F0EB] group-hover:text-[#E8A020] transition-colors mb-2">
                                        {article.title}
                                    </h4>
                                    <p className="text-xs text-[#8A8880] line-clamp-1 italic">"{article.excerpt}"</p>
                                </div>
                                <div className="flex items-center gap-6 shrink-0">
                                    <div className="text-right">
                                        <p className="text-[9px] text-[#555550] uppercase font-900 mb-1">Integrity</p>
                                        <span className="text-[10px] text-[#22c55e] font-800">VERIFIED</span>
                                    </div>
                                    <a 
                                      href={`/article/${article.slug}`}
                                      className="p-3 bg-[#1C1C1A] border border-[#222220] hover:bg-[#E8A020] hover:text-[#0F0F0E] transition-all rounded-sm"
                                    >
                                        <Zap size={14} />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-[#11110F] border border-[#1C1C1A] p-8">
                        <h3 className="text-[10px] font-900 text-[#555550] uppercase tracking-widest mb-6 border-b border-[#1C1C1A] pb-3">Global Sentiment</h3>
                        <div className="space-y-6">
                            {[
                                { label: "Tech Optimism", value: 89, color: "bg-[#22c55e]" },
                                { label: "Financial Risk", value: 42, color: "bg-[#E8A020]" },
                                { label: "Geopolitical Tension", value: 67, color: "bg-red-500" }
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-800 uppercase tracking-tighter">
                                        <span className="text-[#8A8880]">{item.label}</span>
                                        <span className={item.value > 80 ? "text-[#22c55e]" : item.value > 50 ? "text-[#E8A020]" : "text-red-500"}>{item.value}%</span>
                                    </div>
                                    <div className="h-0.5 w-full bg-[#1C1C1A]">
                                        <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#E8A020] p-8 rounded-sm text-[#0F0F0E] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShieldCheck size={100} />
                        </div>
                        <h3 className="text-[10px] font-900 uppercase tracking-[0.2em] mb-4 font-ui">Tactical Access</h3>
                        <p className="text-lg font-display uppercase tracking-tight leading-none mb-6">Elevate your node <br/> clearance.</p>
                        <button className="w-full bg-[#0F0F0E] text-[#F2F0EB] font-ui text-[10px] font-800 uppercase tracking-widest py-3 hover:scale-105 transition-all">Enable Dossier Mode</button>
                    </div>
                </div>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
