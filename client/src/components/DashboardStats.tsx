import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Users, FileText, MessageSquare, Megaphone, Loader2 } from "lucide-react";

export default function DashboardStats() {
    const statsQuery = trpc.system.stats.useQuery();

    if (statsQuery.isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-[#E8A020]" size={32} />
            </div>
        );
    }

    const stats = statsQuery.data;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="font-headline text-2xl text-[#F2F0EB] mb-2">Platform Overview</h2>
                <p className="font-ui text-sm text-[#8A8880]">High-level metrics for Bishouy.com</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-4 sm:p-6 flex flex-col justify-between h-28 sm:h-32 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users size={48} className="text-[#E8A020] sm:w-16 sm:h-16" />
                    </div>
                    <div className="flex items-center gap-2 text-[#8A8880] mb-2 z-10">
                        <Users size={14} className="sm:w-4 sm:h-4" />
                        <span className="font-ui text-[9px] sm:text-xs font-600 uppercase tracking-widest truncate">Users</span>
                    </div>
                    <div className="text-2xl sm:text-4xl font-headline text-[#F2F0EB] z-10">{stats?.totalUsers || 0}</div>
                </Card>

                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-4 sm:p-6 flex flex-col justify-between h-28 sm:h-32 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <FileText size={48} className="text-[#E8A020] sm:w-16 sm:h-16" />
                    </div>
                    <div className="flex items-center gap-2 text-[#8A8880] mb-2 z-10">
                        <FileText size={14} className="sm:w-4 sm:h-4" />
                        <span className="font-ui text-[9px] sm:text-xs font-600 uppercase tracking-widest truncate">Articles</span>
                    </div>
                    <div className="text-2xl sm:text-4xl font-headline text-[#F2F0EB] z-10">{stats?.totalArticles || 0}</div>
                </Card>

                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-4 sm:p-6 flex flex-col justify-between h-28 sm:h-32 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <MessageSquare size={48} className="text-[#E8A020] sm:w-16 sm:h-16" />
                    </div>
                    <div className="flex items-center gap-2 text-[#8A8880] mb-2 z-10">
                        <MessageSquare size={14} className="sm:w-4 sm:h-4" />
                        <span className="font-ui text-[9px] sm:text-xs font-600 uppercase tracking-widest truncate">Comments</span>
                    </div>
                    <div className="text-2xl sm:text-4xl font-headline text-[#F2F0EB] z-10">{stats?.totalComments || 0}</div>
                </Card>

                <Card className="bg-[#1C1C1A] border-[#2A2A28] p-4 sm:p-6 flex flex-col justify-between h-28 sm:h-32 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Megaphone size={48} className="text-[#E8A020] sm:w-16 sm:h-16" />
                    </div>
                    <div className="flex items-center gap-2 text-[#8A8880] mb-2 z-10">
                        <Megaphone size={14} className="sm:w-4 sm:h-4" />
                        <span className="font-ui text-[9px] sm:text-xs font-600 uppercase tracking-widest truncate">Active Ads</span>
                    </div>
                    <div className="text-2xl sm:text-4xl font-headline text-[#F2F0EB] z-10">{stats?.totalAds || 0}</div>
                </Card>
            </div>

            <Card className="bg-[#1C1C1A] border-[#2A2A28] p-8 mt-8 flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-headline text-[#E8A020] mb-4">Welcome to Your Command Center</h3>
                <p className="text-[#8A8880] text-sm max-w-2xl leading-relaxed">
                    From here, you have complete control over Bishouy.com. Publish breaking news, moderate the community in the Comments tab, monetize your traffic using the Ads Manager, and reach your audience via powerful Newsletter Broadcasts.
                </p>
            </Card>
        </div>
    );
}
