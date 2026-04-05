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
        <SEO title={`Loading Profile...`} noindex={true} />
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-[#E8A020]" size={40} />
                <span className="text-[10px] font-900 text-[#555550] uppercase tracking-[0.3em]">Opening Profile...</span>
            </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0F0F0E] flex flex-col">
        <SEO title="User Not Found" noindex={true} />
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <Zap size={48} className="text-[#E8A020] mb-6 opacity-20" />
          <h1 className="font-display text-4xl text-[#F2F0EB] mb-4">
            User Not Found
          </h1>
          <p className="text-[#8A8880] mb-8 font-ui uppercase tracking-widest text-xs">
            This account does not exist or has been removed from the platform.
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
        title={`${profile.name} (@${profile.username}) | BISHOUY`} 
        description={profile.bio || `Explore the contributions of ${profile.name} on BISHOUY.`}
        image={profile.avatarUrl || undefined}
      />
      <Navbar />

      <main className="flex-1 container pb-24 relative">
        {/* Background Atmosphere */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E8A020]/5 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

        <div className="max-w-4xl mx-auto pt-24 md:pt-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-1 shadow-2xl"
          >
            <div className="bg-[#0F0F0E] p-8 md:p-12 border border-[#2A2A28] rounded-sm relative overflow-hidden">
                {/* Decorative Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8A020]/5 rotate-45 translate-x-16 -translate-y-16 pointer-events-none" />

                {/* Header Section */}
                <div className="flex flex-col md:flex-row gap-10 items-start md:items-center relative z-10">
                    <div className="relative group">
                        <div className="w-40 h-40 md:w-48 md:h-48 border-2 border-[#1C1C1A] p-2 bg-[#1c1c1a]/30 rounded-full overflow-hidden transition-all duration-500 group-hover:border-[#E8A020]/30 shadow-2xl">
                            {profile.avatarUrl ? (
                                <img
                                    src={profile.avatarUrl}
                                    alt={profile.name || "User Avatar"}
                                    className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
                                />
                            ) : (
                                <div className="w-full h-full bg-[#11110F] flex items-center justify-center">
                                    <User size={64} className="text-[#2A2A28]" />
                                </div>
                            )}
                        </div>
                        </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-sm text-[10px] font-900 uppercase tracking-widest ${profile.role === 'admin' ? 'bg-[#E8A020]/20 text-[#E8A020] border border-[#E8A020]/40' : 'bg-[#1C1C1A] text-[#8A8880] border border-[#2A2A28]'}`}>
                                {profile.role === 'admin' ? 'Administrator' : 'Member'}
                            </span>
                        </div>

                        <h1 className="font-display text-5xl md:text-6xl text-[#F2F0EB] mb-2 font-900 leading-none">
                            {profile.name}
                        </h1>
                        <p className="font-ui text-sm text-[#8A8880] font-bold tracking-widest uppercase mb-8">
                            @{profile.username}
                        </p>

                        <div className="flex flex-wrap gap-x-8 gap-y-4 text-[#555550] text-[10px] font-ui uppercase tracking-[0.2em] pt-6 border-t border-[#1C1C1A]/50">
                            {profile.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={12} className="text-[#E8A020]" />
                                    <span>{profile.location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar size={12} className="text-[#E8A020]" />
                                <span>Joined {joinDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity size={12} className="text-[#E8A020]" />
                                <span>{comments?.length || 0} Contributions</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bio Section */}
                {profile.bio && (
                  <div className="mt-12 pt-12 border-t border-[#1C1C1A]/50">
                      <h3 className="font-ui text-[10px] font-900 text-[#555550] uppercase tracking-widest mb-6">About</h3>
                      <p className="text-[#D4D0C8] text-xl leading-relaxed italic font-serif opacity-90 max-w-2xl border-l-4 border-[#E8A020]/20 pl-8">
                          "{profile.bio}"
                      </p>
                  </div>
                )}

                {/* Tactical History / Comments */}
                <div className="mt-16">
                  <div className="flex items-center justify-between mb-10 pb-4 border-b border-[#1C1C1A]">
                    <h2 className="font-ui text-[11px] font-900 text-[#F2F0EB] uppercase tracking-[0.4em] flex items-center gap-3">
                        <MessageSquare size={16} className="text-[#E8A020]" />
                        Recent Comments
                    </h2>
                    {profile.website && (
                        <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#8A8880] uppercase tracking-widest hover:text-[#E8A020] transition-all flex items-center gap-2 group"
                        >
                            Website <LinkIcon size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </a>
                    )}
                  </div>

                  {comments && comments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {comments.map((comment: any) => (
                        <div
                          key={comment.id}
                          className="group bg-[#0A0A09] p-8 border border-[#1C1C1A] hover:border-[#E8A020]/40 transition-all duration-500 rounded-sm"
                        >
                          <div className="flex items-center justify-between mb-6 text-[9px] text-[#555550] font-ui uppercase tracking-widest border-b border-[#1C1C1A] pb-4">
                            <span className="flex items-center gap-2 group-hover:text-[#E8A020] transition-colors">
                                <Activity size={10} />
                                Discussion Thread
                            </span>
                            <span>
                              {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>

                          <a
                             href={`/article/${comment.articleSlug}`}
                             className="block font-display text-lg text-[#F2F0EB] group-hover:text-[#E8A020] transition-colors line-clamp-2 leading-tight mb-4"
                          >
                             {comment.articleTitle}
                          </a>

                          <div className="relative">
                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[#E8A020]/10 rounded-full" />
                            <p className="text-[#8A8880] text-[15px] leading-relaxed line-clamp-4 italic opacity-80">
                              "{comment.content}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-24 bg-[#0A0A09] border border-dashed border-[#1C1C1A] rounded-sm">
                        <MessageSquare size={48} className="mx-auto mb-6 text-[#1C1C1A] opacity-20" />
                        <p className="text-[#555550] font-ui text-[11px] uppercase tracking-widest font-bold">
                            No public contributions found.
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
