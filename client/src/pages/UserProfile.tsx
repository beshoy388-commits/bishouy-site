import { useAuth } from "@/_core/hooks/useAuth";
import { useRoute } from "wouter";
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
  MapPin,
  Mail,
  Zap,
  ChevronRight,
  Lock,
  Globe,
  Bell,
  Fingerprint,
  RefreshCw,
  Hash,
  Key,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff,
  Camera,
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

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"library" | "membership" | "settings">("library");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: user?.location || "",
    avatarUrl: user?.avatarUrl || "",
  });

  // Sync formData when user data becomes available
  useEffect(() => {
    if (user && !loading) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user, loading]);

  // Settings Sub-Tabs
  const [settingsCategory, setSettingsCategory] = useState<"identity" | "security" | "communications">("identity");

  // Email Change State
  const [emailFlow, setEmailFlow] = useState<"idle" | "requesting" | "verifying">("idle");
  const [newEmail, setNewEmail] = useState("");
  const [verifyingEmail, setVerifyingEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // Password Management State
  const [passwordFlow, setPasswordFlow] = useState<"idle" | "changing" | "resetting">("idle");
  const [oldPassword, setOldPassword] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passResetCode, setPassResetCode] = useState("");

  // Unified Visibility State
  const [showPasswords, setShowPasswords] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [modalView, setModalView] = useState<"plans" | "manage" | "payment_update" | "cancel_confirm">("plans");

  const updateMutation = trpc.users.updateMe.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      refresh();
    },
    onError: error => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const { data: savedArticles, isLoading: isLoadingBookmarks } =
    trpc.bookmarks.list.useQuery(undefined, {
      enabled: !!user,
    });

  const requestEmailMutation = trpc.users.requestEmailChange.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setEmailFlow("verifying");
    },
    onError: (err) => toast.error(err.message)
  });

  const verifyEmailMutation = trpc.users.verifyEmailChange.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setEmailFlow("idle");
      setNewEmail("");
      setVerifyingEmail("");
      setVerificationCode("");
      refresh();
    },
    onError: (err) => toast.error(err.message)
  });

  // Password Mutations
  const changePasswordMutation = trpc.users.changePassword.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setPasswordFlow("idle");
      setOldPassword("");
      setNewPass("");
      setConfirmPass("");
    },
    onError: (err) => toast.error(err.message)
  });

  const requestPassResetMutation = trpc.users.requestPasswordResetCode.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setPasswordFlow("resetting");
    },
    onError: (err) => toast.error(err.message)
  });

  const verifyPassResetMutation = trpc.users.verifyPasswordResetCode.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setPasswordFlow("idle");
      setNewPass("");
      setConfirmPass("");
      setPassResetCode("");
    },
    onError: (err) => toast.error(err.message)
  });

  const toggle2FAMutation = trpc.users.toggle2FA.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refresh();
    },
    onError: (err) => toast.error(err.message)
  });

  const updatePreferencesMutation = trpc.users.updatePreferences.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refresh();
    },
    onError: (err) => toast.error(err.message)
  });

  const verifySessionMutation = trpc.stripe.verifySession.useMutation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const hasProcessedSession = useRef(false);

  // Handle Stripe session completion ONLY ONCE per mount
  useEffect(() => {
    if (hasProcessedSession.current) return;
    if (loading || !user) return;

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    
    if (sessionId) {
      hasProcessedSession.current = true;
      
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      const verifyPromise = verifySessionMutation.mutateAsync({ sessionId });

      toast.promise(verifyPromise, {
        loading: "VERIFYING PAYMENT STATUS...",
        success: (result) => {
          if (result.success) {
            refresh();
            return `MEMBERSHIP ACTIVATED: ${result.tier?.toUpperCase()}`;
          }
          return "PAYMENT INCOMPLETE";
        },
        error: "VERIFICATION SIGNAL LOST",
      });
    }
  }, [loading, user, refresh]);

  const handleSaveProfile = async () => {
    if (!user) return;

    await updateMutation.mutateAsync({
      name: formData.name,
      username: formData.username,
      bio: formData.bio,
      location: formData.location,
      avatarUrl: formData.avatarUrl,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0E] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
             <div className="w-16 h-16 border-t-[1px] border-[#E8A020]/30 rounded-full animate-spin" />
             <div className="absolute inset-0 w-16 h-16 border-r-[1px] border-[#E8A020] rounded-full animate-[spin_1.5s_linear_infinite]" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-1 bg-[#E8A020] rounded-full animate-pulse" />
             </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="font-display text-[10px] text-[#F2F0EB] uppercase tracking-[0.5em] animate-pulse">Synchronizing</span>
            <span className="font-ui text-[7px] text-[#555550] uppercase tracking-[0.2em]">Neural Intelligence Network</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F0F0E] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center container text-center">
          <div className="bg-[#1C1C1A] p-12 rounded-sm border border-[#222220] shadow-2xl max-w-sm mx-auto">
            <Shield size={64} className="mx-auto mb-6 text-[#555550] opacity-20" />
            <h1 className="font-display text-2xl text-[#F2F0EB] mb-4 font-bold leading-tight">ACCESS REQUIRED</h1>
            <p className="text-[#8A8880] text-sm mb-8 leading-relaxed">
              Please log in to access your profile and saved articles.
            </p>
            <Link href="/login">
              <button className="w-full bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-[11px] font-900 uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-all shadow-xl shadow-[#E8A020]/10">
                LOGIN
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const memberSince = useMemo(() => {
    try {
      if (!user?.createdAt) return "Active Member";
      const d = new Date(user.createdAt);
      if (isNaN(d.getTime())) return "Active Member";
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return "Active Member";
    }
  }, [user?.createdAt]);

  return (
    <div className="min-h-screen bg-[#0F0F0E] flex flex-col pt-0">
      <SEO title={`${user?.name || user?.username || 'Profile'} | BISHOUY`} description="Manage your intelligence segments, saved articles and security credentials." />
      <Navbar />

      <main className="flex-1 overflow-x-hidden">
        <section className="relative pt-20 md:pt-32 pb-8 md:pb-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E8A020]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute inset-0 neural-grid opacity-[0.03]" />
          </div>

          <div className="container relative z-10 px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 md:gap-10">
                <div className="relative shrink-0">
                  <div className="w-24 h-24 md:w-36 md:h-36 rounded-full p-[1px] bg-gradient-to-tr from-[#E8A020]/40 to-[#1C1C1A]/20 shadow-2xl relative mx-auto sm:mx-0">
                    <div
                      onClick={() => { setActiveTab("settings"); setIsEditing(true); setSettingsCategory("identity"); }}
                      className="w-full h-full rounded-full bg-[#0F0F0E] overflow-hidden flex items-center justify-center cursor-pointer group relative"
                    >
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#11110F]">
                          <UserIcon size={32} className="text-[#2A2A28]" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-[#0F0F0E]/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center pointer-events-none backdrop-blur-[2px]">
                        <Camera size={20} className="text-[#E8A020] mb-1" />
                        <span className="text-[7px] font-900 uppercase tracking-widest text-[#F2F0EB]">Update</span>
                      </div>
                    </div>
                    <div className={`absolute bottom-0 right-0 ${user?.subscriptionTier === 'founder' ? 'bg-[#E8A020] text-[#0F0F0E] shadow-[0_0_15px_rgba(232,160,32,0.4)]' : user?.subscriptionTier === 'premium' ? 'bg-[#1C1C1A] text-[#E8A020] border border-[#E8A020]/50' : 'bg-[#2A2A28] text-[#8A8880]'} p-2 rounded-full border-2 border-[#0F0F0E] shadow-xl z-20`}>
                      {user?.subscriptionTier === 'founder' ? <Zap size={14} fill="currentColor" /> : user?.subscriptionTier === 'premium' ? <ShieldCheck size={14} fill="currentColor" /> : <UserIcon size={12} />}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                    {user?.role === "admin" && (
                      <span className="bg-[#E8A020]/5 border border-[#E8A020]/30 text-[#E8A020] px-2.5 py-0.5 rounded-[1px] text-[8px] font-900 uppercase tracking-widest leading-none inline-flex items-center gap-1.5 backdrop-blur-sm">
                        <Shield size={9} fill="currentColor" />
                        Admin
                      </span>
                    )}
                    {user?.subscriptionTier === 'founder' && (
                      <span className="bg-[#E8A020] text-[#0F0F0E] px-2.5 py-0.5 rounded-[1px] text-[8px] font-900 uppercase tracking-widest leading-none inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(232,160,32,0.2)]">
                        <Zap size={9} fill="currentColor" />
                        Founder
                      </span>
                    )}
                    {user?.subscriptionTier === 'premium' && (
                      <span className="bg-[#1C1C1A]/60 border border-[#E8A020]/40 text-[#E8A020] px-2.5 py-0.5 rounded-[1px] text-[8px] font-900 uppercase tracking-widest leading-none inline-flex items-center gap-1.5 backdrop-blur-sm">
                        <ShieldCheck size={9} />
                        Premium
                      </span>
                    )}
                  </div>

                  <h1 className="font-display text-3xl md:text-5xl lg:text-7xl font-900 text-[#F2F0EB] leading-tight tracking-tight uppercase max-w-full break-words mb-3">
                    {String(user?.name || user?.username || "Anonymous")}
                  </h1>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-4 text-[10px] md:text-[11px] text-[#555550] font-mono tracking-tight">
                    <span className="text-[#E8A020]/70 uppercase font-black tracking-widest text-[8px] bg-[#E8A020]/5 px-2 py-0.5 rounded-[1px] w-fit">@{user?.username || 'unknown'}</span>
                    <span className="truncate max-w-[200px] sm:max-w-auto opacity-60 hover:opacity-100 transition-opacity cursor-default ml-2">{user?.email}</span>
                  </div>

                  <div className="hidden md:flex items-center gap-2 mt-5 opacity-40 hover:opacity-70 transition-opacity">
                    <div className="w-5 h-[1px] bg-[#E8A020]" />
                    <span className="text-[9px] text-[#F2F0EB] uppercase tracking-[0.3em] font-900">Registered segment {memberSince}</span>
                  </div>
                </div>
              </div>

              {(!user?.subscriptionTier || user?.subscriptionTier === 'free') && (
                <div className="mt-8 md:mt-12">
                  <button
                    onClick={() => { setModalView("plans"); setIsPricingOpen(true); }}
                    className="w-full bg-gradient-to-r from-[#E8A020] to-[#D4911C] hover:from-[#D4911C] hover:to-[#C4810C] text-[#0F0F0E] py-5 md:py-4 rounded-sm flex items-center justify-center gap-4 transition-all shadow-2xl shadow-[#E8A020]/10 active:scale-[0.99] group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                    <Sparkles size={16} />
                    <span className="font-ui text-[11px] md:text-[12px] font-900 uppercase tracking-[0.2em]">Initialize Premium Access — Free Trial</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <section className="container pb-24 px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-0 border-b border-[#1C1C1A] mb-8 md:mb-12 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
              {[
                { id: "library" as const, label: "Library", icon: Bookmark },
                { id: "membership" as const, label: "Membership", icon: Zap },
                { id: "settings" as const, label: "Settings", icon: Settings },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 md:flex-initial pb-4 md:pb-5 text-[10px] md:text-[11px] font-900 uppercase tracking-[0.2em] transition-all relative flex items-center justify-center md:justify-start gap-2 px-3 md:px-6 whitespace-nowrap ${activeTab === tab.id ? "text-[#E8A020]" : "text-[#555550] hover:text-[#F2F0EB]"}`}
                >
                  <tab.icon size={14} className={activeTab === tab.id ? "text-[#E8A020]" : "text-[#555550]"} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#E8A020]" />
                  )}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8">
                {activeTab === "library" && (
                  <div key="library" className="space-y-6">
                    <div className="flex items-center justify-between mb-8 opacity-60">
                      <h2 className="font-display text-xl text-[#F2F0EB] flex items-center gap-3 uppercase tracking-tighter">
                        <Bookmark size={20} className="text-[#E8A020]" />
                        YOUR LIBRARY
                      </h2>
                      <span className="text-[10px] font-900 text-[#555550] uppercase tracking-widest">{savedArticles?.length || 0} SAVED ARTICLES</span>
                    </div>

                    {isLoadingBookmarks ? (
                      <div className="py-24 flex justify-center">
                        <Activity size={32} className="text-[#E8A020] animate-pulse" />
                      </div>
                    ) : (Array.isArray(savedArticles) && savedArticles.length > 0) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {savedArticles.map((article, idx) => {
                          if (!article || !article.id || !article.title) return null;
                          return (
                            <Link key={article.id} href={`/article/${article.slug || ''}`}>
                              <div className="group bg-[#0A0A09] border border-[#1C1C1A] rounded-sm overflow-hidden hover:border-[#E8A020]/40 transition-all shadow-xl hover:shadow-2xl cursor-pointer flex flex-col sm:flex-row h-full">
                                {article.image && (
                                  <div className="w-full sm:w-40 md:w-48 h-44 sm:h-auto overflow-hidden grayscale-[0.8] group-hover:grayscale-0 transition-all duration-700 shrink-0">
                                    <img src={article.image} alt="" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
                                  </div>
                                )}
                                <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                                  <div>
                                    <div className="category-badge mb-3 w-fit border border-[#E8A020]/20 shadow-lg">{article.category || 'News'}</div>
                                    <h3 className="font-display text-lg md:text-xl text-[#F2F0EB] group-hover:text-[#E8A020] transition-colors line-clamp-2 leading-tight mb-4 font-bold">
                                      {article.title}
                                    </h3>
                                  </div>
                                  <div className="flex items-center justify-between pt-4 border-t border-[#1C1C1A]">
                                    <span className="text-[9px] text-[#555550] uppercase tracking-widest font-bold">
                                      {formatDate(article.publishedAt || article.createdAt || new Date())}
                                    </span>
                                    <ChevronRight size={14} className="text-[#555550]" />
                                  </div>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-[#0A0A09] border border-[#1C1C1A] border-dashed rounded-sm p-20 text-center mb-12">
                        <Bookmark size={48} className="mx-auto mb-8 text-[#1C1C1A] opacity-20" />
                        <h3 className="font-display text-2xl text-[#F2F0EB] mb-4">Empty Library</h3>
                        <p className="text-[#8A8880] text-md mb-10 max-w-sm mx-auto leading-relaxed">
                          You haven't saved any articles yet. Bookmark compelling stories to read them here later.
                        </p>
                        <Link href="/">
                          <button className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-[11px] font-900 uppercase tracking-widest px-20 py-6 rounded-sm">
                            Explore News
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "membership" && (
                  <div key="membership" className="space-y-8">
                    <div className="bg-[#0A0A09] border border-[#1C1C1A] rounded-sm overflow-hidden shadow-2xl">
                      <div className="p-6 md:p-10">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <Zap size={20} className="text-[#E8A020]" />
                            <h2 className="font-display text-xl text-[#F2F0EB] uppercase tracking-tighter font-bold">Membership Plan</h2>
                          </div>
                          <span className="text-[10px] font-mono text-[#555550] uppercase tracking-widest">BSY-{user?.id?.toString().padStart(6, '0')}</span>
                        </div>

                        <div className="bg-[#11110F] border border-[#1C1C1A] rounded-sm p-8 mb-8 relative overflow-hidden group">
                          <div className="flex items-center justify-between mb-8">
                            <div>
                              <span className="text-[9px] font-900 text-[#555550] uppercase tracking-[0.3em] block mb-2">Account Status</span>
                              <span className={`text-2xl font-900 uppercase tracking-widest ${(user?.subscriptionTier === 'free' || !user?.subscriptionTier) ? 'text-[#8A8880]' : 'text-[#E8A020]'}`}>
                                {user?.subscriptionTier === 'founder' ? 'Founding Member' : user?.subscriptionTier === 'premium' ? 'Premium Member' : 'Free Tier'}
                              </span>
                            </div>
                            <Zap size={28} className={(user?.subscriptionTier === 'free' || !user?.subscriptionTier) ? 'text-[#333330]' : 'text-[#E8A020]'} />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#1C1C1A]/50">
                            <div className="flex items-center gap-3">
                              <Calendar size={14} className="text-[#555550]" />
                              <div className="flex flex-col">
                                <span className="text-[8px] text-[#555550] uppercase font-900 tracking-widest">Join Date</span>
                                <span className="text-[11px] text-[#F2F0EB] font-bold uppercase tracking-wider">{memberSince}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Shield size={14} className="text-[#555550]" />
                              <div className="flex flex-col">
                                <span className="text-[8px] text-[#555550] uppercase font-900 tracking-widest">Encryption</span>
                                <span className="text-[11px] text-[#F2F0EB] font-bold uppercase tracking-wider">ACTIVE (AES-256)</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(!user?.subscriptionTier || user?.subscriptionTier === 'free') ? (
                            <button
                              onClick={() => { setModalView("plans"); setIsPricingOpen(true); }}
                              className="col-span-1 sm:col-span-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-900 text-[11px] uppercase tracking-widest py-5 rounded-sm shadow-xl active:scale-[0.98]"
                            >
                              Unlock Premium Experience
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => { setModalView("manage"); setIsPricingOpen(true); }}
                                className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-900 text-[11px] uppercase tracking-widest py-4 rounded-sm"
                              >
                                Manage Subscription
                              </button>
                              <button
                                onClick={() => { setModalView("cancel_confirm"); setIsPricingOpen(true); }}
                                className="border border-red-500/20 text-red-500/50 hover:text-red-500 font-900 text-[11px] uppercase tracking-widest py-4 rounded-sm"
                              >
                                Cancel Plan
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div key="settings" className="bg-[#0A0A09] border border-[#1C1C1A] rounded-sm p-8 md:p-12">
                    <div className="flex flex-col gap-6 mb-12">
                      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 pb-6 border-b border-[#1C1C1A]">
                        <nav className="flex items-center bg-[#11110F] p-1 rounded-sm border border-[#1C1C1A]">
                          {[
                            { id: "identity", label: "PROFILE", icon: UserIcon },
                            { id: "security", label: "SECURITY", icon: Shield },
                            { id: "communications", label: "NEWSLETTER", icon: Bell }
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => setSettingsCategory(cat.id as any)}
                              className={`px-5 py-3 text-[9px] font-900 uppercase tracking-widest transition-all ${settingsCategory === cat.id ? "text-[#E8A020] bg-[#1C1C1A]" : "text-[#555550]"}`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </nav>
                        {settingsCategory === "identity" && (
                          <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="bg-[#E8A020] text-[#0F0F0E] px-8 py-3 rounded-sm font-900 text-[9px] uppercase tracking-widest"
                          >
                            {isEditing ? "DISCARD" : "EDIT PROFILE"}
                          </button>
                        )}
                      </div>
                    </div>

                    {settingsCategory === "identity" && (
                      <div key="identity-tab" className="space-y-10">
                        {isEditing ? (
                          <div className="space-y-8">
                            <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-[#1C1C1A]">
                               <ImageUploader
                                  onImageUpload={url => setFormData({ ...formData, avatarUrl: url })}
                                  currentImage={formData.avatarUrl}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Name"
                                className="w-full bg-[#11110F] border border-[#1C1C1A] rounded-sm px-4 py-3 text-[#F2F0EB]"
                              />
                              <input
                                type="text"
                                value={formData.username}
                                readOnly
                                className="w-full bg-[#11110F] border border-[#1C1C1A] rounded-sm px-4 py-3 text-[#555550]"
                              />
                            </div>
                            <textarea
                              value={formData.bio}
                              onChange={e => setFormData({ ...formData, bio: e.target.value })}
                              placeholder="Bio"
                              className="w-full bg-[#11110F] border border-[#1C1C1A] rounded-sm px-4 py-4 text-[#F2F0EB] h-32"
                            />
                            <button onClick={handleSaveProfile} className="bg-[#E8A020] text-[#0F0F0E] px-12 py-4 rounded-sm font-900 uppercase text-[10px]">
                              {updateMutation.isPending ? "SAVING..." : "SAVE CHANGES"}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-12">
                            {user?.bio && <p className="text-[#F2F0EB] italic border-l-2 border-[#E8A020] pl-6">"{user.bio}"</p>}
                            <div className="pt-10 border-t border-[#1C1C1A]">
                              <button onClick={async () => { await logout(); window.location.href = "/"; }} className="text-[#555550] uppercase text-[10px] font-900">SIGN OUT</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {settingsCategory === "security" && (
                      <div key="security-tab" className="space-y-10">
                        <div className="bg-[#11110F] p-8 rounded-sm">
                           <h3 className="text-[#F2F0EB] text-[11px] font-900 uppercase mb-6">Security Settings</h3>
                           <p className="text-[#555550] text-sm mb-6">Manage your security credentials and authentication methods.</p>
                           <button onClick={() => setEmailFlow("requesting")} className="text-[#E8A020] text-[10px] font-900 uppercase">Change Email Address</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-8 h-fit">
                {user?.role === "admin" && (
                  <div className="bg-[#0A0A09] border border-[#1C1C1A] p-8 rounded-sm shadow-xl">
                    <h3 className="text-[9px] font-900 text-[#555550] uppercase tracking-[0.3em] mb-4">ADMIN ACCESS</h3>
                    <Link href="/admin">
                      <button className="w-full border border-[#E8A020]/20 text-[#E8A020] py-4 rounded-sm text-[9px] font-900 uppercase">MODERATION CONSOLE</button>
                    </Link>
                  </div>
                )}
                <div className="bg-[#0A0A09] border border-[#1C1C1A] p-8 rounded-sm shadow-xl">
                  <h3 className="text-[9px] font-900 text-[#555550] uppercase tracking-[0.3em] mb-4">SUPPORT</h3>
                  <Link href="/contact">
                    <button className="w-full bg-[#11110F] text-[#F2F0EB] py-4 rounded-sm text-[9px] font-900 uppercase">CONTACT EDITORIAL</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PricingModal
          isOpen={isPricingOpen}
          onClose={() => setIsPricingOpen(false)}
          initialView={modalView}
        />
      </main>

      <Footer hideNewsletter />
    </div>
  );
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "Active";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Active";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  } catch {
    return "Active";
  }
}
