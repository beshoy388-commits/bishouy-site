import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useState, useRef, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Loader2,
  LogOut,
  User as UserIcon,
  Edit2,
  Save,
  X,
  Bookmark,
  Activity,
  Calendar,
  Settings,
  Shield,
  Zap,
  ChevronRight,
  Lock,
  Bell,
  Fingerprint,
  Hash,
  Key,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff,
  Camera,
  Mail,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ImageUploader from "@/components/ImageUploader";
import SEO from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import PricingModal from "@/components/PricingModal";
import { usePushNotifications } from "@/_core/hooks/usePushNotifications";

export default function UserProfile() {
  const { user, loading, logout, refresh } = useAuth({
    redirectOnUnauthenticated: true,
  });

  const push = usePushNotifications();

  // Component States
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"library" | "membership" | "settings">("library");
  const [settingsCategory, setSettingsCategory] = useState<"identity" | "security" | "communications">("identity");
  
  // Modals & Flows
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [modalView, setModalView] = useState<"plans" | "manage" | "payment_update" | "cancel_confirm">("plans");
  const [emailFlow, setEmailFlow] = useState<"idle" | "requesting" | "verifying">("idle");
  const [newEmail, setNewEmail] = useState("");
  const [verifyingEmail, setVerifyingEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [passwordFlow, setPasswordFlow] = useState<"idle" | "changing" | "resetting">("idle");
  const [oldPassword, setOldPassword] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passResetCode, setPassResetCode] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  // Form Data with Sync Protection
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    location: "",
    avatarUrl: "",
  });

  const lastSyncHash = useRef<string>("");

  useEffect(() => {
    if (user && !loading) {
      const currentHash = `${user.id}-${user.name}-${user.email}-${user.avatarUrl}`;
      if (lastSyncHash.current !== currentHash) {
        setFormData({
          name: user.name || "",
          username: user.username || "",
          email: user.email || "",
          bio: user.bio || "",
          location: user.location || "",
          avatarUrl: user.avatarUrl || "",
        });
        lastSyncHash.current = currentHash;
      }
    }
  }, [user, loading]);

  // Mutations
  const updateMutation = trpc.users.updateMe.useMutation({
    onSuccess: () => { toast.success("PROFILE SYNCHRONIZED"); setIsEditing(false); refresh(); },
    onError: (e) => toast.error(e.message)
  });

  const { data: savedArticles, isLoading: isLoadingBookmarks } = trpc.bookmarks.list.useQuery(undefined, {
    enabled: !!user,
    staleTime: 60000,
  });

  // Stripe Session Processing
  const hasProcessedSession = useRef(false);
  useEffect(() => {
    if (hasProcessedSession.current || loading || !user) return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      hasProcessedSession.current = true;
      window.history.replaceState({}, document.title, window.location.pathname);
      toast.info("VERIFYING TRANSACTION", { duration: 2000 });
      refresh();
    }
  }, [loading, user]);

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return "Active Member";
    try {
      const d = new Date(user.createdAt);
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch { return "Active Member"; }
  }, [user?.createdAt]);

  const handleSaveProfile = async () => {
    if (!user) return;
    updateMutation.mutate({
      name: formData.name,
      username: formData.username,
      bio: formData.bio,
      location: formData.location,
      avatarUrl: formData.avatarUrl,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0E] flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-t-2 border-[#E8A020] rounded-full animate-spin mb-6" />
        <span className="text-[10px] text-[#F2F0EB] uppercase tracking-[0.4em] animate-pulse">Initializing Identity...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0F0F0E] flex flex-col pt-0 selection:bg-[#E8A020]/30">
      <SEO title={`${user.name || user.username} | PROFILE`} description="Manage your intelligence network and security." />
      <Navbar />

      <main className="flex-1">
        {/* Header Section - Modern Editorial */}
        <section className="relative pt-24 pb-12 overflow-hidden px-4 md:px-6 border-b border-[#1C1C1A]">
          <div className="absolute inset-0 bg-[#E8A020]/[0.02] -skew-y-3 origin-right translate-y-[-10%]" />
          <div className="container relative z-10 max-w-5xl mx-auto">
             <div className="flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-14">
                {/* Avatar Halo Design */}
                <div className="relative group shrink-0">
                  <div className="absolute -inset-2 bg-gradient-to-tr from-[#E8A020]/20 to-transparent rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="w-28 h-28 md:w-44 md:h-44 rounded-full p-[1px] bg-gradient-to-b from-[#E8A020]/40 to-[#1C1C1A] relative z-10">
                    <div className="w-full h-full rounded-full bg-[#0F0F0E] overflow-hidden flex items-center justify-center border-4 border-[#0F0F0E]">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                        ) : (
                          <UserIcon size={48} className="text-[#1C1C1A]" />
                        )}
                    </div>
                    {/* Level Indicator */}
                    <div className={`absolute bottom-2 right-2 w-10 h-10 rounded-full border-4 border-[#0F0F0E] flex items-center justify-center shadow-2xl z-20 ${user.subscriptionTier === 'founder' ? 'bg-[#E8A020] text-[#0F0F0E]' : 'bg-[#1C1C1A] text-[#E8A020]'}`}>
                        {user.subscriptionTier === 'founder' ? <Zap size={18} fill="currentColor" /> : <ShieldCheck size={18} />}
                    </div>
                  </div>
                </div>

                {/* Identity Block */}
                <div className="flex-1 text-center md:text-left pt-2">
                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                      {user.role === 'admin' && <span className="text-[8px] font-900 bg-[#E8A020]/10 border border-[#E8A020]/30 text-[#E8A020] px-3 py-1 rounded-sm uppercase tracking-widest">System Admin</span>}
                      <span className="text-[8px] font-900 bg-[#1C1C1A] text-[#8A8880] px-3 py-1 rounded-sm uppercase tracking-widest border border-[#2A2A28]">@{user.username}</span>
                   </div>
                   <h1 className="text-4xl md:text-7xl font-900 text-[#F2F0EB] uppercase tracking-tighter mb-6 leading-[0.9]">{user.name || user.username}</h1>
                   <div className="flex flex-col md:flex-row items-center gap-6 text-[11px] text-[#555550] uppercase tracking-[0.2em] font-bold">
                      <div className="flex items-center gap-2"><Calendar size={14} className="text-[#E8A020]/40" /> Registered {memberSince}</div>
                      <div className="hidden md:block w-1 h-1 rounded-full bg-[#1C1C1A]" />
                      <div className="flex items-center gap-2 line-clamp-1 max-w-[240px] truncate"><Mail size={14} className="text-[#E8A020]/40" /> {user.email}</div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Content Navigation */}
        <div className="sticky top-[90px] lg:top-[135px] bg-[#0F0F0E]/80 backdrop-blur-xl z-40 border-b border-[#1C1C1A]">
          <div className="container max-w-5xl mx-auto px-4 md:px-6">
             <div className="flex gap-2 md:gap-4 h-16 md:h-20 overflow-x-auto no-scrollbar">
                {[
                  { id: "library", label: "Intelligence Library", icon: Bookmark },
                  { id: "membership", label: "Membership Center", icon: Zap },
                  { id: "settings", label: "Security & Interface", icon: Settings }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 px-6 h-full text-[10px] md:text-[11px] font-900 uppercase tracking-widest transition-all relative shrink-0 ${activeTab === tab.id ? 'text-[#E8A020]' : 'text-[#555550] hover:text-[#F2F0EB]'}`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E8A020] shadow-[0_0_15px_rgba(232,160,32,0.5)]" />}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <section className="container max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              
              {/* Primary Column */}
              <div className="lg:col-span-8">
                 {activeTab === "library" && (
                    <div className="space-y-12">
                       <div className="flex items-center justify-between pb-6 border-b border-[#1C1C1A]/50">
                          <h2 className="text-xl font-900 text-[#F2F0EB] uppercase tracking-tighter">SAVED INTELLIGENCE</h2>
                          <span className="text-[10px] text-[#555550] uppercase font-bold tracking-[0.2em]">{savedArticles?.length || 0} ITEMS</span>
                       </div>

                       {isLoadingBookmarks ? (
                          <div className="py-24 text-center"><Activity size={32} className="text-[#E8A020] animate-pulse mx-auto" /></div>
                       ) : (savedArticles && savedArticles.length > 0) ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             {savedArticles.map(article => (
                               <Link key={article.id} href={`/article/${article.slug}`}>
                                 <div className="group bg-[#11110F] border border-[#1C1C1A] hover:border-[#E8A020]/30 transition-all cursor-pointer h-full overflow-hidden shadow-2xl">
                                    <div className="aspect-video w-full overflow-hidden bg-[#0A0A09]">
                                       {article.image && <img src={article.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />}
                                    </div>
                                    <div className="p-8">
                                       <div className="text-[8px] font-900 text-[#E8A020] uppercase tracking-widest mb-4 border border-[#E8A020]/20 px-2 py-1 w-fit rounded-sm bg-[#E8A020]/5">{article.category || 'NEWS'}</div>
                                       <h3 className="text-[#F2F0EB] font-bold uppercase text-lg mb-6 leading-tight group-hover:text-[#E8A020] transition-colors">{article.title}</h3>
                                       <div className="flex items-center justify-between pt-6 border-t border-[#1C1C1A]/50">
                                          <span className="text-[9px] text-[#555550] uppercase tracking-widest">{new Date(article.createdAt).toLocaleDateString()}</span>
                                          <ChevronRight size={14} className="text-[#555550] group-hover:translate-x-1 transition-transform" />
                                       </div>
                                    </div>
                                 </div>
                               </Link>
                             ))}
                          </div>
                       ) : (
                          <div className="p-20 border border-dashed border-[#1C1C1A] text-center rounded-sm">
                             <Bookmark size={40} className="text-[#1C1C1A] mx-auto mb-6" />
                             <p className="text-[#8A8880] text-[11px] uppercase tracking-widest mb-8">No saved articles in your intelligence feed.</p>
                             <Link href="/"><button className="bg-[#E8A020] text-[#0F0F0E] px-10 py-5 text-[10px] font-900 uppercase tracking-widest shadow-xl">EXPLORE CONTENT</button></Link>
                          </div>
                       )}
                    </div>
                 )}

                 {activeTab === "membership" && (
                    <div className="space-y-12">
                       <h2 className="text-xl font-900 text-[#F2F0EB] uppercase tracking-tighter pb-6 border-b border-[#1C1C1A]/50 font-display">SUBSCRIPTION MODEL</h2>
                       <div className="bg-[#11110F] border border-[#E8A020]/20 p-10 md:p-14 rounded-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8A020]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                             <div>
                                <span className="text-[9px] font-900 text-[#555550] uppercase tracking-[0.4em] block mb-4">ACCESS LEVEL</span>
                                <h3 className="text-4xl md:text-6xl font-900 text-[#F2F0EB] uppercase italic tracking-tighter mb-4">{user.subscriptionTier || 'FREE'}</h3>
                                <div className="flex items-center gap-4">
                                   <div className="flex items-center gap-2 text-[10px] text-[#27AE60] font-bold uppercase"><CheckCircle size={14} /> Active Period</div>
                                   <div className="flex items-center gap-2 text-[10px] text-[#8A8880] font-bold uppercase font-mono tracking-widest">ID: BSY-{user.id.toString().padStart(6, '0')}</div>
                                </div>
                             </div>
                             <button 
                               onClick={() => { setModalView(user.subscriptionTier !== 'free' ? 'manage' : 'plans'); setIsPricingOpen(true); }}
                               className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] px-12 py-6 text-[11px] font-900 uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
                             >
                               {user.subscriptionTier !== 'free' ? 'MANAGE SUBSCRIPTION' : 'UPGRADE ACCESS'}
                             </button>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeTab === "settings" && (
                    <div className="space-y-12">
                       <div className="flex gap-8 border-b border-[#1C1C1A]/50 pb-6">
                          {["identity", "security"].map(cat => (
                            <button 
                              key={cat} onClick={() => setSettingsCategory(cat as any)}
                              className={`text-[10px] font-900 uppercase tracking-[0.3em] transition-all relative ${settingsCategory === cat ? 'text-[#E8A020]' : 'text-[#555550]'}`}
                            >
                              {cat}
                              {settingsCategory === cat && <div className="absolute -bottom-[25px] left-0 right-0 h-0.5 bg-[#E8A020]" />}
                            </button>
                          ))}
                       </div>

                       {settingsCategory === "identity" && (
                         <div className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                               <div className="space-y-4">
                                  <label className="text-[9px] font-900 text-[#555550] uppercase tracking-widest">DISPLAY IDENTITY</label>
                                  <input 
                                    type="text" value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-[#11110F] border border-[#1C1C1A] px-6 py-4 text-[#F2F0EB] text-sm focus:border-[#E8A020]/40 outline-none transition-all"
                                  />
                               </div>
                               <div className="space-y-4">
                                  <label className="text-[9px] font-900 text-[#555550] uppercase tracking-widest">PERMANENT HANDLE</label>
                                  <input type="text" value={`@${user.username}`} disabled className="w-full bg-[#0A0A09] border border-[#1C1C1A] px-6 py-4 text-[#333330] text-sm cursor-not-allowed" />
                               </div>
                            </div>
                            <div className="space-y-4">
                               <label className="text-[9px] font-900 text-[#555550] uppercase tracking-widest">INTELLIGENCE BIO</label>
                               <textarea 
                                 value={formData.bio} 
                                 onChange={e => setFormData({...formData, bio: e.target.value})}
                                 className="w-full bg-[#11110F] border border-[#1C1C1A] px-6 py-6 text-[#F2F0EB] text-sm h-40 focus:border-[#E8A020]/40 outline-none transition-all resize-none leading-relaxed"
                               />
                            </div>
                            <button onClick={handleSaveProfile} className="bg-[#1C1C1A] text-[#F2F0EB] hover:bg-[#2A2A28] border border-[#2A2A28] px-12 py-5 text-[10px] font-900 uppercase tracking-widest transition-all">
                               {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'SAVE CHANGES'}
                            </button>
                         </div>
                       )}
                    </div>
                 )}
              </div>

              {/* Sidebar Column */}
              <div className="lg:col-span-4 space-y-10">
                 {user.role === 'admin' && (
                    <div className="bg-[#1C1C1A]/20 border border-[#E8A020]/30 p-10 rounded-sm">
                       <h4 className="text-[10px] font-900 text-[#E8A020] uppercase tracking-[0.4em] mb-6">ADMIN CONSOLE</h4>
                       <p className="text-[#8A8880] text-[12px] leading-relaxed mb-8 font-serif italic">Access system core feeds and platform governance modules.</p>
                       <Link href="/admin"><button className="w-full bg-transparent border border-[#E8A020]/50 text-[#E8A020] py-4 text-[10px] font-900 uppercase tracking-widest hover:bg-[#E8A020]/10 transition-all">INITIALIZE MODERATION</button></Link>
                    </div>
                 )}
                 
                 <div className="bg-[#11110F] border border-[#1C1C1A] p-10 rounded-sm">
                    <h4 className="text-[10px] font-900 text-[#555550] uppercase tracking-[0.4em] mb-6">SECURITY STATUS</h4>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                          <span className="text-[#333330]">Identity</span>
                          <span className="text-[#27AE60]">VERIFIED</span>
                       </div>
                       <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                          <span className="text-[#333330]">Encryption</span>
                          <span className="text-[#27AE60]">AES-256</span>
                       </div>
                       <Link href="/contact"><button className="w-full bg-[#1C1C1A] text-[#8A8880] py-4 text-[9px] font-900 uppercase tracking-widest mt-4">CONTACT ASSISTANCE</button></Link>
                    </div>
                 </div>

                 <button onClick={async () => { await logout(); window.location.href='/'; }} className="w-full flex items-center justify-center gap-3 text-red-900 hover:text-red-600 transition-colors uppercase text-[9px] font-900 tracking-widest py-4 border border-red-900/10 hover:border-red-900/30">
                    <LogOut size={14} /> TERMINATE SESSION
                 </button>
              </div>

           </div>
        </section>

        <PricingModal 
          isOpen={isPricingOpen} 
          onClose={() => setIsPricingOpen(false)} 
          user={user}
          initialView={modalView}
        />
      </main>

      <Footer hideNewsletter />
    </div>
  );
}

function CheckCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  );
}
