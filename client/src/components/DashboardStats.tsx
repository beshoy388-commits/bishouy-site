import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import {
  Users,
  FileText,
  Eye,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Zap,
  Activity,
  Calendar,
  ShieldCheck,
  Cpu,
  Globe,
  Terminal,
  RefreshCw,
  CheckCircle,
  Radio,
  Share2,
  ChevronRight,
  Send,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import {
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis
} from "recharts";
import { motion } from "framer-motion";

interface DashboardStatsProps {
  onTabChange: (tab: any) => void;
  onNewArticle: () => void;
}

export default function DashboardStats({ onTabChange, onNewArticle }: DashboardStatsProps) {
  const statsQuery = trpc.system.stats.useQuery();
  const analyticsQuery = trpc.analytics.getSummary.useQuery();
  const trendingQuery = trpc.articles.trending.useQuery({ limit: 4 });
  const { data: recentAudits } = trpc.security.getAuditLogs.useQuery({ limit: 6 });

  const clearCacheMutation = trpc.system.clearCache.useMutation({
    onSuccess: (data) => toast.success("System Flush Successful", { description: data.message }),
    onError: (err) => toast.error("Cache Protocol Failure", { description: err.message })
  });

  const maintenanceQuery = trpc.system.getStatus.useQuery();
  const updateSettingMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success("Mainframe state updated");
      maintenanceQuery.refetch();
    },
    onError: () => toast.error("State synchrony failure")
  });

  const toggleMaintenance = () => {
    const currentState = maintenanceQuery.data?.maintenance;
    updateSettingMutation.mutate({ key: "maintenance_mode", value: currentState ? "false" : "true" });
  };

  const stats = [
    {
      label: "Node Population",
      value: statsQuery.data?.totalUsers || 0,
      icon: Users,
      trend: "+12.5%",
      trendUp: true,
      color: "#E8A020"
    },
    {
      label: "Intel Reports",
      value: statsQuery.data?.totalArticles || 0,
      icon: FileText,
      trend: "+3 L-Stream",
      trendUp: true,
      color: "#2980B9"
    },
    {
      label: "Signal Reach",
      value: statsQuery.data?.totalViews || 0,
      icon: Eye,
      trend: "+48% Pulse",
      trendUp: true,
      color: "#22c55e"
    },
    {
      label: "Neural Feedback",
      value: statsQuery.data?.totalComments || 0,
      icon: MessageSquare,
      trend: "-2.4% Decay",
      trendUp: false,
      color: "#8E44AD"
    },
  ];

  const chartData = analyticsQuery.data?.dailyViews.map(d => ({
    name: new Date(d.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
    views: d.views
  })) || [];

  return (
    <div className="space-y-12 animate-fade-in relative pb-20">
      
      {/* HUD Header Terminal */}
      <section className="flex flex-col xl:flex-row items-stretch justify-between gap-8 pb-10 border-b border-[#1C1C1A]">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
             <div className="px-2 py-1 bg-[#E8A020]/10 border border-[#E8A020]/20 rounded-sm">
                <span className="text-[10px] font-black text-[#E8A020] uppercase tracking-[0.2em] font-ui">Operational Hub</span>
             </div>
             <div className="h-px w-12 bg-[#1C1C1A]" />
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-[9px] font-extrabold text-[#555550] uppercase tracking-widest font-ui">Security Tier 1 Active</span>
             </div>
          </div>
          <h1 className="font-display text-5xl lg:text-7xl text-[#F2F0EB] tracking-tighter uppercase leading-[0.8]">
             Intelligence <br/> <span className="text-[#E8A020]">Overwatch.</span>
          </h1>
          <p className="font-ui text-xs text-[#555550] max-w-xl uppercase tracking-widest leading-loose">
             Synchronizing global news streams with sovereign neural processing. Monitor node integrity and traffic propagation via the encrypted command shell below.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-center">
            {/* Status Card 1 */}
            <div className="w-full sm:w-56 p-6 bg-[#11110F] border border-[#1C1C1A] relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                    <Radio size={40} className="text-[#E8A020]" />
                </div>
                <p className="text-[9px] font-black text-[#555550] uppercase tracking-widest mb-4 font-ui">Broadcast Status</p>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-display text-[#F2F0EB] uppercase tracking-tighter">Live Stream</span>
                    <span className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                </div>
            </div>
            
            {/* Maintenance Toggle HUD */}
            <button 
                onClick={toggleMaintenance}
                className={`w-full sm:w-64 p-6 border transition-all relative overflow-hidden text-left ${maintenanceQuery.data?.maintenance 
                    ? "bg-red-500/5 border-red-500/30 text-red-500" 
                    : "bg-[#11110F] border-[#1C1C1A] text-[#F2F0EB] hover:border-[#E8A020]/20"}`}
            >
                <p className="text-[9px] font-black opacity-50 uppercase tracking-widest mb-4 font-ui">Platform State</p>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-display uppercase tracking-tighter">
                        {maintenanceQuery.data?.maintenance ? "Lockdown Active" : "Grid Online"}
                    </span>
                    <Activity size={18} className={maintenanceQuery.data?.maintenance ? "animate-pulse" : "opacity-30"} />
                </div>
                {updateSettingMutation.isPending && (
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#E8A020] animate-[shimmer_1s_infinite]" />
                )}
            </button>
        </div>
      </section>

      {/* Grid Quick Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-[#11110F] border-[#1C1C1A] p-8 h-48 relative overflow-hidden group hover:border-[#E8A020]/40 transition-all cursor-crosshair">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#E8A020]/20" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#E8A020]/20" />
                
                <div className="flex justify-between items-start mb-auto pt-2">
                    <div className="p-3 bg-[#E8A020]/5 rounded-sm border border-[#E8A020]/10 group-hover:bg-[#E8A020]/10 transition-colors">
                        <stat.icon size={18} className="text-[#E8A020]" />
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex items-end justify-between mb-2">
                        <p className="text-4xl font-display text-[#F2F0EB] font-black tracking-tighter leading-none">
                            {stat.value.toLocaleString()}
                        </p>
                        <span className={`text-[10px] font-black font-ui tracking-tighter ${stat.trendUp ? "text-green-500" : "text-red-500"}`}>
                            {stat.trend}
                        </span>
                    </div>
                    <p className="text-[10px] font-black text-[#555550] uppercase tracking-[0.2em] font-ui border-t border-[#1C1C1A] pt-3">{stat.label}</p>
                </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Signal Propagation Chart */}
        <Card className="lg:col-span-2 bg-[#11110F] border-[#1C1C1A] p-0 overflow-hidden relative">
          <div className="p-8 border-b border-[#1C1C1A] flex items-center justify-between bg-[#141412]">
            <div className="flex items-center gap-4">
               <Activity size={14} className="text-[#E8A020]" />
               <h3 className="text-[10px] font-black text-[#F2F0EB] uppercase tracking-[0.3em] font-ui">Propagation Telemetry — SIGNAL_01</h3>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-[#555550] uppercase tracking-widest font-ui">Mode: 7D Density Analysis</span>
            </div>
          </div>

          <div className="h-[400px] w-full p-8 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8A020" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E8A020" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C1C1A" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#333330"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#555550', fontWeight: '900' }}
                />
                <YAxis
                  stroke="#333330"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#555550', fontWeight: '900' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#11110F',
                    borderColor: '#222220',
                    borderRadius: '0px',
                    fontSize: '11px',
                    color: '#F2F0EB',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: '#E8A020', fontWeight: '900', textTransform: 'uppercase' }}
                  cursor={{ stroke: '#E8A020', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#E8A020"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Rapid Deployment Terminal */}
        <div className="space-y-8">
          <Card className="bg-[#11110F] border-[#1C1C1A] p-0 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#1C1C1A] bg-[#141412]">
                <h3 className="text-[10px] font-black text-[#555550] uppercase tracking-widest font-ui flex items-center gap-3">
                    <Zap size={14} className="text-[#E8A020]" />
                    Rapid Deployment
                </h3>
            </div>
            <div className="grid grid-cols-1 gap-[1px] bg-[#1C1C1A]">
                {[
                    { label: "Initialize New Article", icon: Plus, action: onNewArticle, color: "text-[#E8A020]" },
                    { label: "Inject Ad Protocol", icon: Share2, action: () => onTabChange("ads"), color: "text-blue-400" },
                    { label: "System Diagnostics", icon: Terminal, action: () => onTabChange("system"), color: "text-purple-400" },
                    { label: "Dispatch Intel Broadcast", icon: Send, action: () => onTabChange("newsletter"), color: "text-green-400" }
                ].map((action, i) => (
                    <button
                        key={i}
                        onClick={action.action}
                        className="flex items-center justify-between p-6 bg-[#11110F] hover:bg-[#1C1C1A] transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <action.icon size={18} className={`${action.color} group-hover:scale-110 transition-transform`} />
                            <span className="text-[10px] font-black text-[#8A8880] group-hover:text-[#F2F0EB] uppercase tracking-widest font-ui">{action.label}</span>
                        </div>
                        <ChevronRight size={14} className="text-[#333330] group-hover:text-[#E8A020] group-hover:translate-x-1 transition-all" />
                    </button>
                ))}
            </div>
          </Card>

          {/* System Health Module */}
          <Card className="bg-[#11110F] border-[#1C1C1A] p-8 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8A020] opacity-[0.02] -mr-8 -mt-8 rounded-full blur-2xl group-hover:opacity-[0.05] transition-opacity" />
                <div className="flex items-center justify-between mb-8 border-b border-[#1C1C1A] pb-4">
                    <h3 className="text-[10px] font-black text-[#F2F0EB] uppercase tracking-[0.3em] font-ui">Core Stability</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                        <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Optimized</span>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] font-black text-[#555550] uppercase tracking-widest font-ui">Neural Load</span>
                            <span className="text-[10px] font-black text-[#E8A020] font-display uppercase tracking-tighter">14.2%</span>
                        </div>
                        <div className="h-[2px] w-full bg-[#1C1C1A] overflow-hidden">
                            <motion.div 
                                className="h-full bg-[#E8A020]" 
                                initial={{ width: 0 }}
                                animate={{ width: "14.2%" }}
                                transition={{ duration: 2, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] font-black text-[#555550] uppercase tracking-widest font-ui">Sync Latency</span>
                            <span className="text-[10px] font-black text-[#22c55e] font-display uppercase tracking-tighter">32ms</span>
                        </div>
                        <div className="h-[2px] w-full bg-[#1C1C1A] overflow-hidden">
                            <motion.div 
                                className="h-full bg-[#22c55e]" 
                                initial={{ width: 0 }}
                                animate={{ width: "8%" }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                </div>
          </Card>
        </div>
      </div>

      {/* Content Scrutiny Matrix */}
      <Card className="bg-[#11110F] border-[#1C1C1A] p-0 overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <Radio size={120} className="text-[#E8A020]" />
        </div>
        <div className="p-8 border-b border-[#1C1C1A] bg-[#141412] flex items-center justify-between">
           <div>
              <h3 className="text-[10px] font-black text-[#F2F0EB] uppercase tracking-[0.4em] font-ui mb-2">High-Velocity Intelligence Matrix</h3>
              <p className="text-[9px] text-[#555550] uppercase tracking-widest font-extrabold">Tracking viral propagation across global nodes</p>
           </div>
           <button onClick={() => onTabChange("articles")} className="px-4 py-2 border border-[#E8A020]/20 hover:bg-[#E8A020]/10 transition-all font-ui text-[9px] font-black uppercase tracking-widest text-[#E8A020]">
              See All Nodes
           </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingQuery.data?.map((article: any, idx: number) => (
                <motion.div 
                    key={article.id}
                    whileHover={{ y: -5 }}
                    className="bg-[#141412] border border-[#1C1C1A] p-6 group hover:border-[#E8A020]/30 transition-all relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8A020]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest text-[#0F0F0E]" style={{ backgroundColor: article.categoryColor || '#555550' }}>
                            {article.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-green-500">
                            <TrendingUp size={12} />
                            <span className="text-[10px] font-black">+{((4 - idx) * 3).toFixed(1)}%</span>
                        </div>
                    </div>
                    
                    <h4 className="text-sm font-headline font-700 text-[#F2F0EB] mb-4 line-clamp-2 leading-snug h-10 group-hover:text-[#E8A020] transition-colors uppercase tracking-tight">
                        {article.title}
                    </h4>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-[#1C1C1A] mt-auto">
                        <div className="flex items-center gap-2 text-[#555550]">
                            <Eye size={12} />
                            <span className="text-[10px] font-black font-ui tracking-tighter">{article.viewCount?.toLocaleString() || 0}</span>
                        </div>
                        <a href={`/article/${article.slug}`} target="_blank" className="text-[#555550] hover:text-[#E8A020] transition-colors"><ExternalLink size={12} /></a>
                    </div>
                </motion.div>
            ))}
        </div>
      </Card>
      
      {/* Footer System Log Snapshot */}
      <Card className="bg-[#11110F] border-[#1C1C1A] p-8 border-l-4 border-l-[#E8A020]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-[#E8A020]/10 rounded-sm">
                      <Terminal size={20} className="text-[#E8A020]" />
                  </div>
                  <div>
                      <h4 className="text-[10px] font-black text-[#F2F0EB] uppercase tracking-[0.3em] font-ui mb-2">Intelligence Stream Snapshot</h4>
                      <p className="text-[11px] text-[#555550] font-ui max-w-2xl leading-relaxed">
                         {recentAudits && recentAudits[0] ? `LAST_EVENT: [${recentAudits[0].resource.toUpperCase()}] ${recentAudits[0].action} by ${recentAudits[0].userName || 'SYSTEM'} @ ${new Date(recentAudits[0].createdAt).toLocaleTimeString()}` : 'MONITORING_ONLINE: AWAITING_UPSTREAM_INTEL'}
                      </p>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  <button onClick={() => onTabChange("system")} className="flex items-center gap-2 bg-[#1C1C1A] hover:bg-[#E8A020] hover:text-[#0F0F0E] text-[#8A8880] font-ui text-[10px] font-black uppercase tracking-widest px-6 py-3 transition-all rounded-sm">
                        View Kernel Logs
                  </button>
              </div>
          </div>
      </Card>
    </div>
  );
}
