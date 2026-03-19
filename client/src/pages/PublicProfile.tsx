import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  User,
  Calendar,
  Link as LinkIcon,
  MapPin,
  Loader2,
  Shield,
  Activity,
  ShieldCheck,
  Zap,
  MessageSquare
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";

export default function PublicProfile() {
  const [, params] = useRoute("/u/:username");
  const username = params?.username;

  const {
    data: profile,
    isLoading: profileLoading,
    error,
  } = trpc.users.getByUsername.useQuery(
    { username: username || "" },
    { enabled: !!username }
  );

  const { data: comments, isLoading: commentsLoading } =
    trpc.users.getPublicComments.useQuery(
      { username: username || "" },
      { enabled: !!username }
    );

  const isLoading = profileLoading || commentsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0E] flex flex-col">
        <SEO title={`Loading Dossier...`} noindex={true} />
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-[#E8A020]" size={40} />
                <span className="text-[10px] font-900 text-[#555550] uppercase tracking-[0.3em]">Accessing Dossier Node...</span>
            </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0F0F0E] flex flex-col">
        <SEO title="Node Not Found" noindex={true} />
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <Zap size={48} className="text-[#E8A020] mb-6 opacity-20" />
          <h1 className="font-display text-4xl text-[#F2F0EB] mb-4">
            Node Not Found
          </h1>
          <p className="text-[#8A8880] mb-8 font-ui uppercase tracking-widest text-xs">
            The profile/dossier you are attempting to access is no longer active within our grid.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const joinDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0F0F0E] flex flex-col overflow-x-hidden">
      <SEO 
        title={`${profile.name} — Intelligence Dossier`} 
        description={profile.bio || `Strategic contributions from ${profile.name} on Bishouy.com`}
        image={profile.avatarUrl || undefined}
      />
      <Navbar />

      <main className="flex-1 container pb-24 relative">
        {/* Background Atmosphere */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E8A020]/5 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

        <div className="max-w-4xl mx-auto pt-12 md:pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="dossier-card p-1 md:p-1 shadow-2xl"
          >
            <div className="bg-[#0F0F0E] p-8 md:p-12 border border-[#2A2A28]">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row gap-10 items-start md:items-center dossier-header">
                    <div className="relative">
                        <div className="w-40 h-40 md:w-48 md:h-48 border border-[#1C1C1A] p-2 bg-[#1c1c1a]/30">
                            {profile.avatarUrl ? (
                                <img
                                    src={profile.avatarUrl}
                                    alt={profile.name || "User Avatar"}
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                />
                            ) : (
                                <div className="w-full h-full bg-[#11110F] flex items-center justify-center">
                                    <User size={64} className="text-[#2A2A28]" />
                                </div>
                            )}
                        </div>
                        <div className="absolute -top-4 -right-4 bg-[#E8A020] p-2 shadow-xl">
                            <ShieldCheck size={20} className="text-[#0F0F0E]" />
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className={`agent-status-tag ${profile.role === 'admin' ? 'status-admin' : 'status-active'}`}>
                                {profile.role === 'admin' ? 'Sovereign Admin' : 'Active Analyst'}
                            </span>
                            <span className="text-[10px] text-[#555550] uppercase tracking-widest font-800">Verified Identity</span>
                        </div>

                        <h1 className="font-display text-5xl md:text-6xl text-[#F2F0EB] mb-2 uppercase tracking-tighter">
                            {profile.name}
                        </h1>
                        <p className="font-ui text-xs text-[#E8A020] font-900 tracking-[0.3em] uppercase mb-8">
                            Node / {profile.username}
                        </p>

                        <div className="flex flex-wrap gap-x-8 gap-y-4 text-[#8A8880] text-[10px] font-ui uppercase tracking-widest pt-6 border-t border-[#1C1C1A]/50">
                            {profile.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={12} className="text-[#E8A020]" />
                                    <span>{profile.location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar size={12} className="text-[#E8A020]" />
                                <span>Initialized {joinDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity size={12} className="text-[#E8A020]" />
                                <span>{comments?.length || 0} Intelligence Logs</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bio / Strategic Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    <div className="md:col-span-2">
                        <h3 className="font-ui text-[9px] font-900 text-[#555550] uppercase tracking-[0.4em] mb-4">Strategic Summary</h3>
                        <p className="text-[#D4D0C8] text-lg leading-relaxed italic font-serif opacity-80 decoration-[#E8A020]/20 underline-offset-8 underline">
                            "{profile.bio || "No summary provided for this node. Identity currently understated."}"
                        </p>
                    </div>
                    <div className="bg-[#11110F] border border-[#1C1C1A] p-6">
                        <h3 className="font-ui text-[9px] font-900 text-[#555550] uppercase tracking-[0.2em] mb-4">System Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-[#555550] uppercase">Trust Rating</span>
                                <span className="text-[10px] text-[#E8A020] font-bold">ALPHA</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-[#1C1C1A] pt-2">
                                <span className="text-[10px] text-[#555550] uppercase">Privacy Protocol</span>
                                <span className="text-[10px] text-[#E8A020] font-bold">STRICT</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tactical History / Comments */}
                <div>
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1C1C1A]">
                    <h2 className="font-ui text-[10px] font-900 text-[#F2F0EB] uppercase tracking-[0.4em] flex items-center gap-3">
                        <MessageSquare size={14} className="text-[#E8A020]" />
                        Analytical History
                    </h2>
                    {profile.website && (
                        <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-[#8A8880] uppercase tracking-widest hover:text-[#E8A020] transition-colors flex items-center gap-2"
                        >
                            External Intelligence <LinkIcon size={12} />
                        </a>
                    )}
                  </div>

                  {comments && comments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {comments.map((comment: any) => (
                        <div
                          key={comment.id}
                          className="group bg-[#11110F] p-8 border border-[#1C1C1A] hover:border-[#E8A020]/30 transition-all duration-300 relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-16 h-16 opacity-[0.03] group-hover:opacity-[0.08]">
                             <Zap className="w-full h-full text-[#E8A020]" />
                          </div>
                          
                          <div className="flex items-center justify-between mb-6 text-[8px] text-[#555550] font-ui uppercase tracking-widest border-b border-[#1C1C1A] pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#E8A020] animate-pulse" />
                                <span>Article Node Analysis</span>
                            </div>
                            <span>
                              {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>

                          <a
                             href={`/article/${comment.articleSlug}`}
                             className="block font-headline text-md text-[#F2F0EB] group-hover:text-[#E8A020] transition-colors line-clamp-1 mb-4"
                          >
                             {comment.articleTitle}
                          </a>

                          <p className="text-[#8A8880] text-sm leading-relaxed line-clamp-3 italic">
                            "{comment.content}"
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-[#11110F] border border-dashed border-[#1c1c1a]">
                        <p className="text-[#555550] font-ui text-[10px] uppercase tracking-[0.3em]">
                            Intelligence history empty. Analysis pending.
                        </p>
                    </div>
                  )}
                </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

