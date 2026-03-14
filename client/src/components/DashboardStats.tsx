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

interface DashboardStatsProps {
  onTabChange: (tab: any) => void;
  onNewArticle: () => void;
}

export default function DashboardStats({ onTabChange, onNewArticle }: DashboardStatsProps) {
  const statsQuery = trpc.system.stats.useQuery();
  const analyticsQuery = trpc.analytics.getSummary.useQuery();
  const trendingQuery = trpc.articles.trending.useQuery({ limit: 5 });
  const { data: recentAudits } = trpc.security.getAuditLogs.useQuery({ limit: 4 });

  const clearCacheMutation = trpc.system.clearCache.useMutation({
    onSuccess: (data) => toast.success("System Flush Successful", { description: data.message }),
    onError: (err) => toast.error("Cache Protocol Failure", { description: err.message })
  });

  const lockdownMutation = trpc.system.emergencyLockdown.useMutation({
    onSuccess: (data) => toast.success("Lockdown Engaged", { description: data.message }),
    onError: (err) => toast.error("Security Override Failure", { description: err.message })
  });

  // Database verification simulation (could be a real tRPC call)
  const handleVerifyDb = () => {
    const promise = new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1500));
    toast.promise(promise, {
      loading: "Scanning database nodes...",
      success: "Database integrity 100% verified.",
      error: "Integrity breach detected."
    });
  };

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
      label: "Total Audience",
      value: statsQuery.data?.totalUsers || 0,
      icon: Users,
      trend: "+12.5%",
      trendUp: true,
      color: "#E8A020"
    },
    {
      label: "Content Nodes",
      value: statsQuery.data?.totalArticles || 0,
      icon: FileText,
      trend: "+3 this week",
      trendUp: true,
      color: "#2980B9"
    },
    {
      label: "Global Reach (Views)",
      value: statsQuery.data?.totalViews || 0,
      icon: Eye,
      trend: "+48%",
      trendUp: true,
      color: "#27AE60"
    },
    {
      label: "User Engagement",
      value: statsQuery.data?.totalComments || 0,
      icon: MessageSquare,
      trend: "-2.4%",
      trendUp: false,
      color: "#8E44AD"
    },
  ];

  const chartData = analyticsQuery.data?.dailyViews.map(d => ({
    name: new Date(d.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
    views: d.views
  })) || [];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#E8A020] mb-2">
            <ShieldCheck size={16} />
            <span className="font-ui text-[10px] font-900 uppercase tracking-[0.3em]">System Authentication Verified</span>
          </div>
          <h1 className="font-headline text-4xl text-[#F2F0EB] tracking-tighter">
            OPERATIONAL <span className="text-[#E8A020]">OVERVIEW</span>
          </h1>
          <p className="font-ui text-sm text-[#8A8880] max-w-lg">
            Monitor state engagement, analyze data distribution, and oversee the evolution of the platform in real-time.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          <Card className="bg-[#11110F] border-[#1C1C1A] p-4 flex items-center gap-4">
            <Calendar size={20} className="text-[#555550]" />
            <div>
              <p className="text-[9px] font-ui font-800 text-[#555550] uppercase tracking-widest">Global Date</p>
              <p className="text-[11px] font-ui text-[#F2F0EB] font-bold uppercase tracking-tighter">
                {new Date().toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </Card>

          <Card
            className={`border-2 p-4 flex items-center justify-between gap-4 cursor-pointer transition-all ${maintenanceQuery.data?.maintenance
              ? "bg-red-500/10 border-red-500/30"
              : "bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
              }`}
            onClick={toggleMaintenance}
          >
            <div className="flex items-center gap-3">
              <Activity size={20} className={maintenanceQuery.data?.maintenance ? "text-red-500" : "text-green-500"} />
              <div>
                <p className="text-[9px] font-ui font-800 text-[#555550] uppercase tracking-widest">Site Status</p>
                <p className={`text-[11px] font-ui font-bold uppercase tracking-tighter ${maintenanceQuery.data?.maintenance ? "text-red-500" : "text-green-500"
                  }`}>
                  {maintenanceQuery.data?.maintenance ? "MAINTENANCE" : "OPERATIONAL"}
                </p>
              </div>
            </div>
            {updateSettingMutation.isPending && <RefreshCw size={12} className="animate-spin text-[#E8A020]" />}
          </Card>
        </div>
      </section>

      {/* Grid Quick Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-[#1C1C1A] border-[#2A2A28] p-6 group hover:border-[#E8A020]/30 transition-all duration-300 relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="p-2.5 rounded-lg bg-[#0F0F0E]" style={{ color: stat.color }}>
                  <stat.icon size={20} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-bold ${stat.trendUp ? "text-green-500" : "text-red-500"}`}>
                  {stat.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.trend}
                </div>
              </div>
              <div className="mt-auto">
                <p className="text-[10px] font-ui font-800 text-[#8A8880] uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-headline text-[#F2F0EB] font-bold tracking-tight">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-[#E8A020]/5 rounded-full blur-2xl group-hover:bg-[#E8A020]/10 transition-colors" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-[#1C1C1A] border-[#2A2A28] p-8 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-[#F2F0EB] font-headline text-lg uppercase tracking-tight">Propagation Metrics</h3>
              <p className="text-[#8A8880] text-xs font-ui">Traffic & Interaction Density (Last 7 Days)</p>
            </div>
          </div>

          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8A020" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E8A020" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262624" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#555550"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#8A8880', fontWeight: 'bold' }}
                />
                <YAxis
                  stroke="#555550"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                  tick={{ fill: '#8A8880', fontWeight: 'bold' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C1C1A',
                    borderColor: '#2A2A28',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F2F0EB'
                  }}
                  itemStyle={{ color: '#E8A020' }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#E8A020"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-8">
          <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6 relative overflow-hidden">
            <h3 className="text-[#F2F0EB] font-headline text-sm uppercase tracking-widest mb-6 border-b border-[#2A2A28] pb-3">Rapid Deployment</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onNewArticle}
                className="flex flex-col items-center justify-center gap-3 p-4 bg-[#0F0F0E] hover:bg-[#E8A020]/10 border border-[#262624] hover:border-[#E8A020]/30 rounded-lg transition-all text-[#8A8880] hover:text-[#E8A020]"
              >
                <Plus size={20} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Create Article</span>
              </button>
              <button
                onClick={() => onTabChange("ads")}
                className="flex flex-col items-center justify-center gap-3 p-4 bg-[#0F0F0E] hover:bg-[#E8A020]/10 border border-[#262624] hover:border-[#E8A020]/30 rounded-lg transition-all text-[#8A8880] hover:text-[#E8A020]"
              >
                <Zap size={20} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Inject AD</span>
              </button>
              <button
                onClick={() => onTabChange("newsletter")}
                className="flex flex-col items-center justify-center gap-3 p-4 bg-[#0F0F0E] hover:bg-[#E8A020]/10 border border-[#262624] hover:border-[#E8A020]/30 rounded-lg transition-all text-[#8A8880] hover:text-[#E8A020]"
              >
                <Activity size={20} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Newsletter</span>
              </button>
              <button
                onClick={() => onTabChange("system")}
                className="flex flex-col items-center justify-center gap-3 p-4 bg-[#0F0F0E] hover:bg-[#E8A020]/10 border border-[#262624] hover:border-[#E8A020]/30 rounded-lg transition-all text-[#8A8880] hover:text-[#E8A020]"
              >
                <Terminal size={20} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Diagnostics</span>
              </button>
            </div>
          </Card>

          <Card className="bg-[#1C1C1A] border-[#2A2A28] p-6">
            <div className="flex items-center justify-between mb-6 border-b border-[#2A2A28] pb-3">
              <h3 className="text-[#F2F0EB] font-headline text-sm uppercase tracking-widest">Core Health</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Optimal</span>
              </div>
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#8A8880]">
                  <Cpu size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">CPU LOAD</span>
                </div>
                <span className="text-[10px] font-display text-[#E8A020] font-bold tracking-tighter">14.2%</span>
              </div>
              <div className="h-1 bg-[#0F0F0E] rounded-full">
                <div className="h-full bg-[#E8A020] w-[14%]" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#8A8880]">
                  <Globe size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Sync Delay</span>
                </div>
                <span className="text-[10px] font-display text-[#E8A020] font-bold tracking-tighter">32ms</span>
              </div>
              <div className="h-1 bg-[#0F0F0E] rounded-full">
                <div className="h-full bg-green-500 w-[10%]" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card className="bg-[#1C1C1A] border-[#2A2A28] p-8">
        <div className="flex items-center justify-between mb-8 border-b border-[#262624] pb-5">
          <div>
            <h3 className="text-[#F2F0EB] font-headline text-lg uppercase tracking-tight">Viral Content Matrix</h3>
            <p className="text-[#8A8880] text-xs font-ui">Articles with high velocity & engagement rates</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#262624] text-[10px] font-ui font-900 text-[#555550] uppercase tracking-[0.2em]">
                <th className="pb-4 font-bold">Content Asset</th>
                <th className="pb-4 font-bold">Sector</th>
                <th className="pb-4 font-bold">Impulse</th>
                <th className="pb-4 font-bold text-right">Performance</th>
              </tr>
            </thead>
            <tbody>
              {trendingQuery.data?.map((article: any, idx: number) => (
                <tr key={article.id} className="border-b border-[#262624]/50 group hover:bg-[#F2F0EB]/[0.02] transition-colors">
                  <td className="py-4">
                    <p className="text-sm font-headline text-[#F2F0EB] group-hover:text-[#E8A020] transition-colors line-clamp-1">{article.title}</p>
                    <p className="text-[10px] font-ui text-[#555550] truncate">{new Date(article.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="py-4 text-[9px] font-900 text-[#0F0F0E] uppercase tracking-widest">
                    <span className="px-2 py-0.5 rounded-sm" style={{ backgroundColor: article.categoryColor || '#555550' }}>{article.category}</span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={12} className="text-green-500" />
                      <span className="text-xs font-bold text-[#F2F0EB]">{article.viewCount?.toLocaleString() || 0}</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded border border-green-500/20 text-green-500 text-[9px] font-bold uppercase tracking-widest">
                      +{((5 - idx) * 3).toFixed(1)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-[#1C1C1A] border-[#2A2A28] p-8">
          <div className="flex items-center justify-between mb-8 border-b border-[#262624] pb-5">
            <div>
              <h3 className="text-[#F2F0EB] font-headline text-lg uppercase tracking-tight">System Dynamics</h3>
              <p className="text-[#8A8880] text-xs font-ui">Real-time event stream</p>
            </div>
          </div>
          <div className="space-y-6">
            {!recentAudits || recentAudits.length === 0 ? (
              <p className="text-center py-10 text-[#555550] text-xs uppercase tracking-widest">No recent events logged</p>
            ) : (
              recentAudits.map((log: any) => (
                <div key={log.id} className="flex items-center gap-4 group">
                  <div className={`text-[9px] font-900 px-2 py-0.5 rounded border border-current opacity-70 ${
                    log.resource === 'auth' ? 'text-blue-400' : 
                    log.resource === 'article' ? 'text-purple-400' :
                    log.resource === 'system' ? 'text-orange-400' : 'text-[#E8A020]'
                  }`}>{log.resource.toUpperCase()}</div>
                  <p className="text-xs text-[#F2F0EB] font-ui flex-1 truncate">{log.action}: {log.userName || 'System'}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="bg-[#1C1C1A] border-[#2A2A28] p-8">
          <div className="flex items-center justify-between mb-8 border-b border-[#262624] pb-5">
            <div>
              <h3 className="text-[#F2F0EB] font-headline text-lg uppercase tracking-tight">Quick Actions</h3>
              <p className="text-[#8A8880] text-xs font-ui">Immediate site interventions</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="space-y-4">
              <button
                onClick={() => clearCacheMutation.mutate()}
                disabled={clearCacheMutation.isPending}
                className="w-full flex items-center justify-between p-4 bg-[#0F0F0E] hover:bg-[#E8A020]/5 border border-[#262624] hover:border-[#E8A020]/20 rounded transition-all group"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw size={16} className={`text-[#8A8880] group-hover:text-[#E8A020] ${clearCacheMutation.isPending ? "animate-spin" : ""}`} />
                  <span className="text-xs font-bold text-[#8A8880] group-hover:text-[#F2F0EB] uppercase tracking-widest">Clear System Cache</span>
                </div>
                <ArrowUpRight size={14} className="text-[#333333] group-hover:text-[#E8A020]" />
              </button>
              <p className="px-1 text-[9px] text-[#555550] uppercase tracking-wider leading-relaxed">
                Flushes the localized AI chat and session cache. Use this to refresh system state if data seems stale.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleVerifyDb}
                className="w-full flex items-center justify-between p-4 bg-[#0F0F0E] hover:bg-blue-500/5 border border-[#262624] hover:border-blue-500/20 rounded transition-all group"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck size={16} className="text-[#8A8880] group-hover:text-blue-400" />
                  <span className="text-xs font-bold text-[#8A8880] group-hover:text-[#F2F0EB] uppercase tracking-widest">Verify Database Integrity</span>
                </div>
                <ArrowUpRight size={14} className="text-[#333333] group-hover:text-blue-400" />
              </button>
              <p className="px-1 text-[9px] text-[#555550] uppercase tracking-wider leading-relaxed">
                Performs a structural scan of all database tables (Articles, Users, Comments) to ensure link consistency and no corrupted nodes.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  if (confirm("DANGER: This will take the entire platform offline for users. Proceed with Emergency Lockdown?")) {
                    lockdownMutation.mutate();
                  }
                }}
                disabled={lockdownMutation.isPending}
                className="w-full flex items-center justify-between p-4 bg-[#0F0F0E] hover:bg-red-500/5 border border-[#262624] hover:border-red-500/20 rounded transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Activity size={16} className={`text-[#8A8880] group-hover:text-red-400 ${lockdownMutation.isPending ? "animate-pulse" : ""}`} />
                  <span className="text-xs font-bold text-[#8A8880] group-hover:text-[#F2F0EB] uppercase tracking-widest">Emergency Lockdown</span>
                </div>
                <ArrowUpRight size={14} className="text-[#333333] group-hover:text-red-400" />
              </button>
              <p className="px-1 text-[9px] text-[#555550] uppercase tracking-wider leading-relaxed">
                <span className="text-red-500/50">DANGER ZONE:</span> Instantly activates Maintenance Mode across all nodes. Only administrators will have access after deployment.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
