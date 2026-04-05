import { useAuth } from "@/_core/hooks/useAuth";
import { useRoute } from "wouter";
import { useEffect, useState } from "react";
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
import { startRegistration } from "@simplewebauthn/browser";

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

  const generatePasskeyOptions = trpc.passkeys.generateRegistrationOptions.useMutation();
  const verifyPasskeyRegistration = trpc.passkeys.verifyRegistration.useMutation();
  const removePasskeyMutation = trpc.passkeys.removePasskey.useMutation();
  const handleRegisterPasskey = () => {
    generatePasskeyOptions.mutate(undefined, {
      onSuccess: (options) => {
        startRegistration({ optionsJSON: options as any }).then(attResp => {
          verifyPasskeyRegistration.mutate(attResp, {
            onSuccess: () => {
              toast.success("Passkey registered");
              refresh();
            },
            onError: (err) => toast.error(err.message)
          });
        }).catch(err => {
          if (err.name !== "NotAllowedError") toast.error(err.message);
        });
      },
      onError: (err) => toast.error(err.message)
    });
  };

  let passkeys = [];
  try {
    if (user?.passkeyCredentials && typeof user.passkeyCredentials === "string" && user.passkeyCredentials !== "") {
      const parsed = JSON.parse(user.passkeyCredentials);
      if (Array.isArray(parsed)) {
        passkeys = parsed;
      }
    }
  } catch (e) {
    console.error("Passkey parsing error", e);
  }

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

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
        avatarUrl: user.avatarUrl || "",
      });
    }

    // Check for Stripe session completion
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
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

      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

  }, [user]);

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
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Elite Editorial Loader */}
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
        </motion.div>
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
              <button className="w-full bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-[11px] font-900 uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-[#E8A020]/10">
                LOGIN
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const memberSince = (() => {
    try {
      if (!user?.createdAt) return "Unknown Access Date";
      return new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    } catch {
      return "Active Member";
    }
  })();

  return (
    <div className="min-h-screen bg-[#0F0F0E] flex flex-col pt-0">
      <SEO title={`${user.name || user.username || 'Profile'} | BISHOUY`} description="Manage your intelligence segments, saved articles and security credentials." />
      <Navbar />

      <main className="flex-1 overflow-x-hidden">
        {/* Profile Header — Compact & Premium */}
        <section className="relative pt-20 md:pt-32 pb-8 md:pb-16 overflow-hidden">
          {/* Atmosphere */}
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
              {/* Horizontal compact layout (Stacked on mobile) */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 md:gap-10">
                {/* Avatar — Refined Halo */}
                <div className="relative shrink-0">
                  <div className="absolute -inset-1.5 bg-[#E8A020]/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="w-24 h-24 md:w-36 md:h-36 rounded-full p-[1px] bg-gradient-to-tr from-[#E8A020]/40 to-[#1C1C1A]/20 shadow-2xl relative mx-auto sm:mx-0">
                    <div
                      onClick={() => { setActiveTab("settings"); setIsEditing(true); setSettingsCategory("identity"); }}
                      className="w-full h-full rounded-full bg-[#0F0F0E] overflow-hidden flex items-center justify-center cursor-pointer group relative"
                    >
                      {user.avatarUrl ? (
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
                    {/* Membership Seal */}
                    <div className={`absolute bottom-0 right-0 ${user.subscriptionTier === 'founder' ? 'bg-[#E8A020] text-[#0F0F0E] shadow-[0_0_15px_rgba(232,160,32,0.4)]' : user.subscriptionTier === 'premium' ? 'bg-[#1C1C1A] text-[#E8A020] border border-[#E8A020]/50' : 'bg-[#2A2A28] text-[#8A8880]'} p-2 rounded-full border-2 border-[#0F0F0E] shadow-xl z-20`}>
                      {user.subscriptionTier === 'founder' ? <Zap size={14} fill="currentColor" /> : user.subscriptionTier === 'premium' ? <ShieldCheck size={14} fill="currentColor" /> : <UserIcon size={12} />}
                    </div>
                  </div>
                </div>

                {/* Name, Handle & Badges */}
                <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start">
                  {/* Badges — Glassmorphic treatment */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                    {user.role === "admin" && (
                      <span className="bg-[#E8A020]/5 border border-[#E8A020]/30 text-[#E8A020] px-2.5 py-0.5 rounded-[1px] text-[8px] font-900 uppercase tracking-widest leading-none inline-flex items-center gap-1.5 backdrop-blur-sm">
                        <Shield size={9} fill="currentColor" />
                        Admin
                      </span>
                    )}
                    {user.subscriptionTier === 'founder' && (
                      <span className="bg-[#E8A020] text-[#0F0F0E] px-2.5 py-0.5 rounded-[1px] text-[8px] font-900 uppercase tracking-widest leading-none inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(232,160,32,0.2)]">
                        <Zap size={9} fill="currentColor" />
                        Founder
                      </span>
                    )}
                    {user.subscriptionTier === 'premium' && (
                      <span className="bg-[#1C1C1A]/60 border border-[#E8A020]/40 text-[#E8A020] px-2.5 py-0.5 rounded-[1px] text-[8px] font-900 uppercase tracking-widest leading-none inline-flex items-center gap-1.5 backdrop-blur-sm">
                        <ShieldCheck size={9} />
                        Premium
                      </span>
                    )}
                  </div>

                  {/* Name — Premium display type (Fixed overlap) */}
                  <h1 className="font-display text-3xl md:text-5xl lg:text-7xl font-900 text-[#F2F0EB] leading-tight tracking-tight uppercase max-w-full break-words mb-3">
                    {String(user.name || user.username || "Anonymous")}
                  </h1>

                  {/* Handle + Email (subtle mono) */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-4 text-[10px] md:text-[11px] text-[#555550] font-mono tracking-tight">
                    <span className="text-[#E8A020]/70 uppercase font-black tracking-widest text-[8px] bg-[#E8A020]/5 px-2 py-0.5 rounded-[1px] w-fit">@{user.username || 'unknown'}</span>
                    <span className="hidden sm:inline opacity-30">/</span>
                    <span className="truncate max-w-[200px] sm:max-w-auto opacity-60 hover:opacity-100 transition-opacity cursor-default">{user.email}</span>
                  </div>

                  {/* Member Since — desktop only */}
                  <div className="hidden md:flex items-center gap-2 mt-5 opacity-40 hover:opacity-70 transition-opacity">
                    <div className="w-5 h-[1px] bg-[#E8A020]" />
                    <span className="text-[9px] text-[#F2F0EB] uppercase tracking-[0.3em] font-900">Registered segment {memberSince}</span>
                  </div>
                </div>
              </div>

              {/* Upgrade CTA — Shimmer Perfection */}
              {(!user.subscriptionTier || user.subscriptionTier === 'free') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 md:mt-12"
                >
                  <button
                    onClick={() => { setModalView("plans"); setIsPricingOpen(true); }}
                    className="w-full bg-gradient-to-r from-[#E8A020] to-[#D4911C] hover:from-[#D4911C] hover:to-[#C4810C] text-[#0F0F0E] py-5 md:py-4 rounded-sm flex items-center justify-center gap-4 transition-all shadow-2xl shadow-[#E8A020]/10 active:scale-[0.99] group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                    <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                    <span className="font-ui text-[11px] md:text-[12px] font-900 uppercase tracking-[0.2em]">Initialize Premium Access — Free Trial</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        <section className="container pb-24 px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            {/* 3 Top-level Tabs: Library, Membership, Settings */}
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
                    <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#E8A020] shadow-[0_-4px_10px_rgba(232,160,32,0.4)]" />
                  )}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Main Content Area */}
              <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                  {activeTab === "library" && (
                    <motion.div
                      key="library"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
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
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                                  className="group bg-[#0A0A09] border border-[#1C1C1A] rounded-sm overflow-hidden hover:border-[#E8A020]/40 transition-all shadow-xl hover:shadow-2xl cursor-pointer flex flex-col sm:flex-row h-full"
                                >
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
                                      <div className="flex items-center gap-2 text-[#555550] group-hover:text-[#E8A020] transition-colors group-hover:translate-x-1 duration-300">
                                        <ChevronRight size={14} />
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
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
                            <button className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-[11px] font-900 uppercase tracking-widest px-20 py-6 rounded-sm transition-all shadow-xl shadow-[#E8A020]/10 mx-auto">
                              Explore News
                            </button>
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "membership" && (
                    <motion.div
                      key="membership"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-8"
                    >
                      <div className="bg-[#0A0A09] border border-[#1C1C1A] rounded-sm overflow-hidden shadow-2xl">
                        <div className="p-6 md:p-10">
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                              <Zap size={20} className="text-[#E8A020]" />
                              <h2 className="font-display text-xl text-[#F2F0EB] uppercase tracking-tighter font-bold">Membership Plan</h2>
                            </div>
                            <span className="text-[10px] font-mono text-[#555550] uppercase tracking-widest">BSY-{user.id.toString().padStart(6, '0')}</span>
                          </div>

                          <div className="bg-[#11110F] border border-[#1C1C1A] rounded-sm p-8 mb-8 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[#E8A020]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <div className="flex items-center justify-between mb-8">
                              <div>
                                <span className="text-[9px] font-900 text-[#555550] uppercase tracking-[0.3em] block mb-2">Account Status</span>
                                <span className={`text-2xl font-900 uppercase tracking-widest ${(user.subscriptionTier === 'free' || !user.subscriptionTier) ? 'text-[#8A8880]' : 'text-[#E8A020]'}`}>
                                  {user.subscriptionTier === 'founder' ? 'Founding Member' : user.subscriptionTier === 'premium' ? 'Premium Member' : 'Free Tier'}
                                </span>
                              </div>
                              <div className={`h-14 w-14 flex items-center justify-center rounded-sm border ${(user.subscriptionTier === 'free' || !user.subscriptionTier) ? 'border-[#2A2A28] bg-[#1C1C1A]' : 'border-[#E8A020]/30 bg-[#E8A020]/10'}`}>
                                <Zap size={28} className={(user.subscriptionTier === 'free' || !user.subscriptionTier) ? 'text-[#333330]' : 'text-[#E8A020]'} />
                              </div>
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
                            {(!user.subscriptionTier || user.subscriptionTier === 'free') ? (
                              <button
                                onClick={() => { setModalView("plans"); setIsPricingOpen(true); }}
                                className="col-span-1 sm:col-span-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-900 text-[11px] uppercase tracking-widest py-5 rounded-sm transition-all shadow-xl shadow-[#E8A020]/10 flex items-center justify-center gap-3 active:scale-[0.98]"
                              >
                                <Sparkles size={18} />
                                Unlock Premium Experience
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => { setModalView("manage"); setIsPricingOpen(true); }}
                                  className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-900 text-[11px] uppercase tracking-widest py-4 rounded-sm transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                  Manage Subscription
                                </button>
                                <button
                                  onClick={() => { setModalView("cancel_confirm"); setIsPricingOpen(true); }}
                                  className="border border-red-500/20 hover:border-red-500 text-red-500/50 hover:text-red-500 font-900 text-[11px] uppercase tracking-widest py-4 rounded-sm transition-all flex items-center justify-center hover:bg-red-500/5"
                                >
                                  Cancel Plan
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "settings" && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-[#0A0A09] border border-[#1C1C1A] rounded-sm p-8 md:p-12 shadow-2xl"
                    >
                      <div className="flex flex-col gap-6 mb-12">
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 pb-6 border-b border-[#1C1C1A]">
                          <nav className="flex items-center w-full md:w-auto overflow-x-auto no-scrollbar scroll-smooth flex-nowrap bg-[#11110F] p-1 rounded-sm border border-[#1C1C1A]">
                            {[
                              { id: "identity", label: "PROFILE", icon: UserIcon },
                              { id: "security", label: "SECURITY", icon: Shield },
                              { id: "communications", label: "NEWSLETTER", icon: Bell }
                            ].map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => setSettingsCategory(cat.id as any)}
                                className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-3 text-[9px] font-900 uppercase tracking-widest transition-all whitespace-nowrap relative shrink-0 ${settingsCategory === cat.id ? "text-[#E8A020] bg-[#1C1C1A]" : "text-[#555550] hover:text-[#F2F0EB]"}`}
                              >
                                <cat.icon size={13} />
                                {cat.label}
                              </button>
                            ))}
                          </nav>

                          <div className="flex items-center gap-4">
                            {settingsCategory === "identity" && (
                              <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`w-full md:w-auto max-w-[240px] md:min-w-[180px] flex items-center justify-center gap-2 font-ui text-[9px] font-900 uppercase tracking-[0.2em] px-8 py-3 rounded-sm transition-all shadow-xl group ${isEditing ? 'bg-[#1C1C1A] text-[#8A8880] border border-[#2A2A28]' : 'bg-[#E8A020] text-[#0F0F0E] hover:bg-[#D4911C]'}`}
                              >
                                {isEditing ? <ArrowLeft size={14} /> : <Edit2 size={14} />}
                                {isEditing ? "DISCARD" : "EDIT PROFILE"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        {settingsCategory === "identity" && (
                          <motion.div
                            key="identity-tab"
                            initial={{ opacity: 0, scale: 0.99 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.99 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-10 transform-gpu translate-z-0"
                          >
                            {isEditing ? (
                              <div key="identity-edit-form" className="space-y-8">
                                <div className="flex flex-col items-center gap-6 pb-8 border-b border-[#1C1C1A] text-center md:text-left md:flex-row md:items-start">
                                  <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-2 border-[#E8A020]/20 bg-[#1C1C1A] group relative flex items-center justify-center mx-auto md:mx-0">
                                    {formData.avatarUrl ? (
                                      <img src={formData.avatarUrl} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0F0F0E] text-[#555550]">
                                        <UserIcon size={32} className="opacity-50 text-[#333330]" />
                                        <span className="text-[8px] uppercase mt-2 font-900">IDENTITY SOURCE</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 w-full scale-95 origin-top md:origin-left">
                                    <span className="block text-[11px] text-[#555550] uppercase tracking-[0.3em] font-900 mb-2">PROFILE PICTURE</span>
                                    <p className="text-[9px] text-[#333330] uppercase mb-4 tracking-wider">Accepted formats: JPG, PNG. Optimal 1:1 ratio.</p>
                                    <ImageUploader
                                      onImageUpload={url => setFormData({ ...formData, avatarUrl: url })}
                                      currentImage={formData.avatarUrl}
                                      label="Change Photo"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-3">
                                    <label className="text-[10px] text-[#555550] uppercase tracking-widest font-900">Display Name</label>
                                    <input
                                      type="text"
                                      value={formData.name}
                                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                                      className="w-full bg-[#11110F] border border-[#1C1C1A] rounded-sm px-4 py-3 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020]/50 transition-all font-ui text-sm"
                                    />
                                  </div>
                                  <div className="space-y-3">
                                    <label className="text-[10px] text-[#555550] uppercase tracking-widest font-900">Username</label>
                                    <div className="flex items-center group overflow-hidden rounded-sm border border-[#1C1C1A]">
                                      <div className="inline-flex items-center px-4 h-11 bg-[#1C1C1A] text-[#555550] text-sm border-r border-[#1C1C1A]/50 group-focus-within:text-[#E8A020] transition-colors">@</div>
                                      <input
                                        type="text"
                                        value={formData.username}
                                        readOnly
                                        className="flex-1 h-11 bg-[#11110F] px-4 text-[#8A8880] cursor-not-allowed font-ui text-sm focus:outline-none"
                                      />
                                    </div>
                                    <p className="text-[9px] text-[#333330] uppercase tracking-tighter">
                                      <span className="text-[#E8A020]/60 mr-1">Note:</span> Username represents your global index and cannot be modified.
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <label className="text-[10px] text-[#555550] uppercase tracking-widest font-900">About Me</label>
                                  <textarea
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Share a short bio..."
                                    className="w-full bg-[#11110F] border border-[#1C1C1A] rounded-sm px-4 py-4 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020]/50 h-32 resize-none transition-all font-ui text-sm leading-relaxed"
                                  />
                                </div>

                                <button
                                  onClick={handleSaveProfile}
                                  disabled={updateMutation.isPending}
                                  className="w-full md:max-w-[240px] mx-auto bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-[11px] font-900 uppercase tracking-[0.2em] py-5 rounded-sm transition-all shadow-xl shadow-[#E8A020]/10 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                  {updateMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
                                </button>
                              </div>
                            ) : (
                              <div key="identity-view-mode" className="space-y-12">
                                <div className="flex flex-col md:flex-row gap-8 items-start bg-[#11110F] p-8 rounded-sm border border-[#1C1C1A]">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-6">
                                      <span className="text-[11px] text-[#555550] uppercase tracking-[0.3em] font-900 block">ABOUT ME</span>
                                    </div>
                                    {user.bio ? (
                                      <p className="text-[#F2F0EB] font-serif italic opacity-90 border-l-4 border-[#E8A020]/20 pl-8 leading-relaxed">"{user.bio}"</p>
                                    ) : (
                                      <p className="text-[14px] text-[#8A8880] italic">No bio yet. Click "Edit Profile" to add one.</p>
                                    )}
                                  </div>
                                  <div className="w-full md:w-80 grid grid-cols-1 gap-4 shrink-0">
                                    <div className="bg-[#0A0A09] p-5 border border-[#1C1C1A] rounded-sm flex items-center justify-between">
                                      <div>
                                        <span className="text-[8px] text-[#555550] uppercase tracking-widest font-900 block mb-1">Username</span>
                                        <p className="text-[#F2F0EB] font-bold text-sm">@{user.username || "unset"}</p>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-[8px] text-[#555550] uppercase tracking-widest font-900 block mb-1">Saved</span>
                                        <p className="text-[#F2F0EB] font-bold text-sm">{savedArticles?.length || 0}</p>
                                      </div>
                                    </div>
                                    <div className="bg-[#0A0A09] p-5 border border-[#1C1C1A] rounded-sm flex items-center justify-between">
                                      <span className="text-[8px] text-[#555550] uppercase tracking-widest font-900 block mb-1">Member Since</span>
                                      <div className="flex items-center gap-2">
                                        <Calendar size={12} className="text-[#E8A020]" />
                                        <p className="text-[#F2F0EB] font-bold text-sm">{memberSince}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-10 border-t border-[#1C1C1A]">
                                  <button
                                    onClick={async () => { await logout(); window.location.href = "/"; }}
                                    className="flex items-center gap-3 text-[#555550] hover:text-[#F2F0EB] font-ui text-[10px] font-900 uppercase tracking-[0.2em] transition-all group"
                                  >
                                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                                    SIGN OUT
                                  </button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {settingsCategory === "security" && (
                          <motion.div
                            key="security-tab"
                            initial={{ opacity: 0, scale: 0.99 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.99 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-10 transform-gpu translate-z-0"
                          >
                            {/* Email Settings */}
                            <div className="bg-[#11110F] border border-[#1C1C1A] p-10 rounded-sm">
                              <h3 className="text-[11px] font-900 uppercase tracking-widest text-[#F2F0EB] mb-8 flex items-center gap-3">
                                <Mail size={16} className="text-[#E8A020]" />
                                Email Account Settings
                              </h3>

                              {emailFlow === "idle" ? (
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                  <div>
                                    <p className="text-[#555550] text-[10px] uppercase tracking-widest font-900 mb-2">Current Address</p>
                                    <p className="text-[#F2F0EB] font-bold text-lg">{user?.email?.replace(/(.{3}).*(@.*)/, "$1****$2") || "N/A"}</p>
                                  </div>
                                  <button
                                    onClick={() => setEmailFlow("requesting")}
                                    className="bg-[#E8A020]/10 text-[#E8A020] border border-[#E8A020]/30 hover:bg-[#E8A020]/20 px-8 py-3 rounded-sm text-[10px] font-900 uppercase tracking-widest transition-all"
                                  >
                                    Change Email
                                  </button>
                                </div>
                              ) : emailFlow === "requesting" ? (
                                <div className="space-y-8">
                                  <div className="space-y-3">
                                    <label className="text-[10px] text-[#555550] uppercase tracking-widest font-900">New Email Address</label>
                                    <input
                                      type="email"
                                      placeholder="Enter new email..."
                                      value={newEmail}
                                      onChange={e => setNewEmail(e.target.value)}
                                      className="w-full bg-[#0A0A09] border border-[#1C1C1A] rounded-sm px-4 py-4 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020] transition-all font-ui"
                                    />
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <button
                                      onClick={() => {
                                        if (!newEmail) return toast.error("Please enter a valid address");
                                        setVerifyingEmail(newEmail);
                                        requestEmailMutation.mutate({ newEmail });
                                      }}
                                      disabled={requestEmailMutation.isPending}
                                      className="flex-1 bg-[#E8A020] text-[#0F0F0E] py-4 rounded-sm font-ui text-[10px] font-900 uppercase tracking-widest disabled:opacity-50 shadow-xl shadow-[#E8A020]/10"
                                    >
                                      {requestEmailMutation.isPending ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Send VERIFYtion Code"}
                                    </button>
                                    <button onClick={() => setEmailFlow("idle")} className="px-8 py-4 border border-[#1C1C1A] text-[#555550] font-900 text-[10px] uppercase tracking-widest hover:text-[#F2F0EB] transition-all">CANCEL</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-8">
                                  <div className="bg-[#E8A020]/5 border border-[#E8A020]/10 p-6 rounded-sm">
                                    <p className="text-[12px] text-[#E8A020] leading-relaxed">
                                      VERIFYtion Code sent to <strong>{verifyingEmail}</strong>.<br />
                                      Please enter the 6-digit code below to confirm.
                                    </p>
                                  </div>
                                  <div className="space-y-3">
                                    <label className="text-[10px] text-[#555550] uppercase tracking-widest font-900 text-center block">Enter Security Code</label>
                                    <div className="relative max-w-xs mx-auto">
                                      <Hash size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2A2A28]" />
                                      <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={verificationCode}
                                        onChange={e => setVerificationCode(e.target.value)}
                                        className="w-full bg-[#0A0A09] border border-[#1C1C1A] rounded-sm p-4 pl-14 text-[#F2F0EB] font-serif tracking-[0.6em] text-3xl focus:outline-none focus:border-[#E8A020] transition-all text-center"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <button
                                      onClick={() => verifyEmailMutation.mutate({ newEmail: verifyingEmail, code: verificationCode })}
                                      disabled={verifyEmailMutation.isPending}
                                      className="flex-1 bg-[#27AE60] text-[#F2F0EB] py-5 rounded-sm font-ui text-[10px] font-900 uppercase tracking-widest disabled:opacity-50"
                                    >
                                      {verifyEmailMutation.isPending ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Update My Email"}
                                    </button>
                                    <button onClick={() => setEmailFlow("requesting")} className="px-8 py-5 border border-[#1C1C1A] text-[#555550] font-900 text-[10px] uppercase tracking-widest hover:text-[#F2F0EB] transition-all">Resend</button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Password MANAGEment */}
                            <div className="bg-[#11110F] border border-[#1C1C1A] p-10 rounded-sm">
                              <h3 className="text-[11px] font-900 uppercase tracking-widest text-[#F2F0EB] mb-8 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Key size={16} className="text-[#E8A020]" />
                                  Security Credentials
                                </div>
                                <button
                                  onClick={() => {
                                    requestPassResetMutation.mutate();
                                  }}
                                  className="text-[9px] text-[#555550] hover:text-[#E8A020] uppercase tracking-widest font-bold transition-colors"
                                >
                                  Forgot Password?
                                </button>
                              </h3>

                              <AnimatePresence mode="wait">
                                {passwordFlow === "idle" ? (
                                  <motion.div
                                    key="pass-idle"
                                    className="flex flex-col md:flex-row md:items-center justify-between gap-6"
                                  >
                                    <div>
                                      <p className="text-[#555550] text-[10px] uppercase tracking-widest font-900 mb-2">Account Password</p>
                                      <p className="text-[#8A8880] text-sm">Update your access credentials regularly for better security.</p>
                                    </div>
                                    <button
                                      onClick={() => setPasswordFlow("changing")}
                                      className="bg-[#1C1C1A] text-[#F2F0EB] border border-[#2A2A28] hover:border-[#E8A020]/40 px-8 py-3 rounded-sm text-[10px] font-900 uppercase tracking-widest transition-all"
                                    >
                                      Change Password
                                    </button>
                                  </motion.div>
                                ) : passwordFlow === "changing" ? (
                                  <motion.div
                                    key="pass-change"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-6 overflow-hidden"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                      <div className="space-y-3">
                                        <label className="text-[10px] text-[#555550] uppercase tracking-widest font-900">Current Password</label>
                                        <div className="relative">
                                          <input
                                            type={showPasswords ? "text" : "password"}
                                            value={oldPassword}
                                            onChange={e => setOldPassword(e.target.value)}
                                            className="w-full bg-[#0A0A09] border border-[#1C1C1A] rounded-sm pl-4 pr-12 py-3 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020]/30 transition-all font-ui text-sm"
                                          />
                                          <button
                                            onClick={() => setShowPasswords(!showPasswords)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555550] hover:text-[#E8A020] transition-colors"
                                          >
                                            {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                                          </button>
                                        </div>
                                      </div>
                                      <div className="space-y-3 invisible md:visible h-0 md:h-auto" />
                                      <div className="space-y-3">
                                        <label className="text-[10px] text-[#555550] uppercase tracking-widest font-900">New Password</label>
                                        <div className="relative">
                                          <input
                                            type={showPasswords ? "text" : "password"}
                                            value={newPass}
                                            onChange={e => setNewPass(e.target.value)}
                                            className="w-full bg-[#0A0A09] border border-[#1C1C1A] rounded-sm pl-4 pr-12 py-3 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020]/30 transition-all font-ui text-sm"
                                          />
                                          <button
                                            onClick={() => setShowPasswords(!showPasswords)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555550] hover:text-[#E8A020] transition-colors"
                                          >
                                            {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                                          </button>
                                        </div>
                                      </div>
                                      <div className="space-y-3">
                                        <label className="text-[10px] text-[#555550] uppercase tracking-widest font-900">Confirm New Password</label>
                                        <div className="relative">
                                          <input
                                            type={showPasswords ? "text" : "password"}
                                            value={confirmPass}
                                            onChange={e => setConfirmPass(e.target.value)}
                                            className="w-full bg-[#0A0A09] border border-[#1C1C1A] rounded-sm pl-4 pr-12 py-3 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020]/30 transition-all font-ui text-sm"
                                          />
                                          <button
                                            onClick={() => setShowPasswords(!showPasswords)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555550] hover:text-[#E8A020] transition-colors"
                                          >
                                            {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4 pt-4">
                                      <button
                                        onClick={() => {
                                          if (newPass !== confirmPass) return toast.error("Passwords do not match");
                                          changePasswordMutation.mutate({ oldPassword, newPassword: newPass });
                                        }}
                                        disabled={changePasswordMutation.isPending}
                                        className="flex-1 bg-[#E8A020] text-[#0F0F0E] py-4 rounded-sm font-ui text-[10px] font-900 uppercase tracking-widest disabled:opacity-50"
                                      >
                                        {changePasswordMutation.isPending ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Update Credentials"}
                                      </button>
                                      <button onClick={() => setPasswordFlow("idle")} className="px-8 py-4 border border-[#1C1C1A] text-[#555550] font-900 text-[10px] uppercase tracking-widest hover:text-[#F2F0EB] transition-all">CANCEL</button>
                                    </div>
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="pass-reset"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                  >
                                    <div className="bg-[#E8A020]/5 border border-[#E8A020]/10 p-6 rounded-sm flex items-start gap-4">
                                      <AlertCircle className="text-[#E8A020] shrink-0 mt-0.5" size={18} />
                                      <p className="text-[12px] text-[#E8A020] leading-relaxed">
                                        A recovery code was sent to your email. Enter the code and your new password to restore access.
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                      <div className="space-y-4">
                                        <label className="text-[10px] text-[#555550] uppercase tracking-widest font-900 block">Security Code</label>
                                        <div className="relative">
                                          <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2A2A28]" />
                                          <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="000000"
                                            value={passResetCode}
                                            onChange={e => setPassResetCode(e.target.value)}
                                            className="w-full bg-[#0A0A09] border border-[#1C1C1A] rounded-sm p-4 pl-12 text-[#F2F0EB] font-serif tracking-[0.4em] text-2xl focus:outline-none focus:border-[#E8A020]/40 transition-all"
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-4">
                                        <div className="space-y-4">
                                          <label className="text-[10px] text-[#555550] uppercase tracking-widest font-900 block">New Password</label>
                                          <input
                                            type={showPasswords ? "text" : "password"}
                                            value={newPass}
                                            placeholder="••••••••"
                                            onChange={e => setNewPass(e.target.value)}
                                            className="w-full bg-[#0A0A09] border border-[#1C1C1A] rounded-sm p-4 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020]/40 transition-all"
                                          />
                                        </div>
                                        <div className="space-y-4">
                                          <label className="text-[10px] text-[#555550] uppercase tracking-widest font-900 block">Confirm Password</label>
                                          <input
                                            type={showPasswords ? "text" : "password"}
                                            value={confirmPass}
                                            placeholder="••••••••"
                                            onChange={e => setConfirmPass(e.target.value)}
                                            className="w-full bg-[#0A0A09] border border-[#1C1C1A] rounded-sm p-4 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020]/40 transition-all font-ui"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <button
                                        onClick={() => {
                                          if (newPass !== confirmPass) return toast.error("Passwords do not match");
                                          verifyPassResetMutation.mutate({ code: passResetCode, newPassword: newPass });
                                        }}
                                        disabled={verifyPassResetMutation.isPending}
                                        className="flex-1 bg-[#E8A020] text-[#0F0F0E] py-5 rounded-sm font-ui text-[10px] font-900 uppercase tracking-widest disabled:opacity-50 shadow-xl shadow-[#E8A020]/10"
                                      >
                                        {verifyPassResetMutation.isPending ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Commit Recovery"}
                                      </button>
                                      <button onClick={() => setPasswordFlow("idle")} className="px-8 py-5 border border-[#1C1C1A] text-[#555550] font-900 text-[10px] uppercase tracking-widest hover:text-[#F2F0EB] transition-all">CANCEL</button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* 2FA/Security Toggle */}
                            <div className="bg-[#11110F] border border-[#1C1C1A] p-10 rounded-sm">
                              <h3 className="text-[11px] font-900 uppercase tracking-widest text-[#F2F0EB] mb-10 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 shrink-0">
                                  <Lock size={16} className="text-[#E8A020]" />
                                  Privacy & Account Security
                                </div>
                                <div className="flex-1 h-[1px] bg-[#1C1C1A] opacity-50" />
                                {user.twoFactorEnabled ? (
                                  <span className="text-[9px] bg-[#27AE60]/10 text-[#27AE60] border border-[#27AE60]/30 px-3 py-1 rounded-sm font-bold shrink-0">2FA ENABLED</span>
                                ) : (
                                  <span className="text-[9px] bg-[#555550]/10 text-[#555550] border border-[#555550]/30 px-3 py-1 rounded-sm font-bold opacity-60 shrink-0">PROTECTION: BASIC</span>
                                )}
                              </h3>

                              <div className="space-y-10">
                                <div className="flex items-center justify-between group">
                                  <div className="max-w-full">
                                    <h4 className="text-sm text-[#F2F0EB] font-bold mb-2 group-hover:text-[#E8A020] transition-colors">Two-Factor Authentication <span className={`text-[8px] font-900 px-2 py-0.5 rounded-full ${user.twoFactorEnabled ? "text-[#27AE60] bg-[#27AE60]/5 border border-[#27AE60]/20" : "text-[#555550] bg-[#1C1C1A] border border-[#2A2A28]"}`}>{user.twoFactorEnabled ? "ENABLED" : "DISABLED"}</span></h4>
                                    <p className="text-[12px] text-[#555550] leading-relaxed">Require a verification code from your email for every new sign-in attempt.</p>
                                  </div>
                                  <button
                                    onClick={() => toggle2FAMutation.mutate({ enabled: !user.twoFactorEnabled })}
                                    className={`w-14 h-7 rounded-full relative transition-all duration-500 shadow-inner flex items-center px-1.5 focus:outline-none focus:ring-1 focus:ring-[#E8A020] ${user.twoFactorEnabled ? "bg-[#27AE60]" : "bg-[#1C1C1A]"}`}
                                    aria-label={`Toggle Two-Factor Authentication: ${user.twoFactorEnabled ? 'ON' : 'OFF'}`}
                                  >
                                    <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
                                      <span className="text-[6px] font-black text-white/40">ON</span>
                                      <span className="text-[6px] font-black text-white/40">OFF</span>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full bg-[#F2F0EB] shadow-md transition-all duration-500 relative z-10 ${user.twoFactorEnabled ? "translate-x-7" : "translate-x-0"}`} />
                                  </button>
                                </div>

                                <div className="flex items-center justify-between border-t border-[#1C1C1A] pt-10">
                                  <div>
                                    <h4 className="text-sm text-[#F2F0EB] font-bold mb-2">Biometric Passkeys</h4>
                                    <p className="text-[12px] text-[#8A8880]">Sign in using FaceID, TouchID or hardware security keys.</p>
                                  </div>
                                   <button
                                     onClick={handleRegisterPasskey}
                                     className="text-[10px] font-bold uppercase tracking-widest bg-[#1C1C1A] hover:bg-[#252522] text-[#E8A020] px-4 py-2 rounded-sm border border-[#1C1C1A] transition-colors"
                                   >
                                     Add Key
                                   </button>
                                </div>

                                <div className="pt-10 border-t border-[#1C1C1A]">
                                  <div className="bg-[#0A0A09]/50 border border-[#1C1C1A] p-8 rounded-sm flex flex-col items-center justify-center text-center">
                                    <Fingerprint size={32} className="text-[#E8A020] mb-4 opacity-40" />
                                    <h3 className="text-[11px] font-900 uppercase tracking-[0.3em] text-[#F2F0EB] mb-2">BIOMETRIC SECURITY</h3>
                                    <p className="text-[10px] text-[#8A8880] uppercase tracking-widest leading-relaxed">Secured by your device's hardware enclave.</p>
                                  </div>
                                </div>

                              </div>
                            </div>
                          </motion.div>
                        )}

                        {settingsCategory === "communications" && (
                          <motion.div
                            key="communications-tab"
                            initial={{ opacity: 0, scale: 0.99 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.99 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-10 transform-gpu translate-z-0"
                          >
                            <div className="bg-[#11110F] border border-[#1C1C1A] p-10 rounded-sm">
                              <h3 className="text-[11px] font-900 uppercase tracking-widest text-[#F2F0EB] mb-10 flex items-center gap-3">
                                <Bell size={16} className="text-[#E8A020]" />
                                NEWSLETTER PREFERENCES
                              </h3>

                              <div className="mb-8 p-4 bg-[#0A0A09] border border-[#1C1C1A] rounded-sm flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-[9px] text-[#555550] uppercase tracking-widest font-900 mb-1">CONTACT INFO</span>
                                  <span className="text-[11px] text-[#8A8880] font-mono">{user.email}</span>
                                </div>
                                <button
                                  onClick={() => { setSettingsCategory("identity"); setIsEditing(true); }}
                                  className="text-[9px] font-900 text-[#E8A020] uppercase tracking-widest hover:underline"
                                >
                                  EDIT EMAIL
                                </button>
                              </div>

                              <div className="space-y-12">
                                <div className="flex items-start justify-between gap-6">
                                  <div className="flex-1 md:pr-12 min-w-0">
                                    <h4 className="text-md text-[#F2F0EB] font-bold mb-3">The Daily Briefing</h4>
                                    <p className="text-[14px] text-[#8A8880] leading-relaxed max-w-lg">
                                      Our curated newsletter delivered to your inbox every morning, featuring the most significant geopolitical and financial analysis.
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => updatePreferencesMutation.mutate({ subscribeToNewsletter: !user.subscribeToNewsletter })}
                                    className={`w-14 h-7 rounded-full relative transition-all duration-500 shrink-0 shadow-inner group flex items-center px-1.5 focus:outline-none focus:ring-1 focus:ring-[#E8A020] ${user.subscribeToNewsletter ? "bg-[#27AE60]" : "bg-[#1C1C1A]"}`}
                                    aria-label={`Toggle Newsletter: ${user.subscribeToNewsletter ? 'ON' : 'OFF'}`}
                                  >
                                    <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
                                      <span className="text-[6px] font-black text-white/40">ON</span>
                                      <span className="text-[6px] font-black text-white/40">OFF</span>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full bg-[#F2F0EB] shadow-md transition-all duration-500 relative z-10 ${user.subscribeToNewsletter ? "translate-x-7" : "translate-x-0"}`} />
                                  </button>
                                </div>

                                <div className={`flex items-start justify-between border-t border-[#1C1C1A] pt-12 ${!push.isSupported ? 'opacity-40' : ''}`}>
                                  <div className="flex-1 pr-12">
                                    <h4 className="text-md text-[#F2F0EB] font-bold mb-3 flex items-center gap-2">
                                      Breaking News Alerts
                                      {!push.isSupported && (
                                        <span className="text-[8px] text-[#555550] uppercase tracking-widest border border-[#1C1C1A] px-2 py-0.5 rounded-sm">Unsupported Browser</span>
                                      )}
                                      {push.isSubscribed && (
                                        <span className="text-[8px] text-[#27AE60] uppercase tracking-widest border border-[#27AE60]/30 px-2 py-0.5 rounded-sm">Active</span>
                                      )}
                                    </h4>
                                    <p className="text-[14px] text-[#8A8880] leading-relaxed max-w-lg">
                                      Instant push notifications for critical global events as they unfold.
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => push.isSubscribed ? push.unsubscribe() : push.subscribe()}
                                    disabled={!push.isSupported || push.isLoading}
                                    className={`w-14 h-7 rounded-full relative shrink-0 shadow-inner flex items-center px-1.5 focus:outline-none focus:ring-1 focus:ring-[#E8A020] transition-all duration-500 ${push.isSubscribed ? "bg-[#27AE60]" : "bg-[#1C1C1A]"} disabled:cursor-not-allowed`}
                                    aria-label={`Toggle Breaking News Alerts: ${push.isSubscribed ? 'ON' : 'OFF'}`}
                                  >
                                    <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
                                      <span className="text-[6px] font-black text-white/40">ON</span>
                                      <span className="text-[6px] font-black text-white/40">OFF</span>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full bg-[#F2F0EB] shadow-md transition-all duration-500 relative z-10 ${push.isSubscribed ? "translate-x-7" : "translate-x-0"}`} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="p-10 border border-dashed border-[#1C1C1A] rounded-sm text-center">
                              <p className="text-[10px] text-[#555550] uppercase tracking-[0.3em] font-bold mb-2">Privacy Assurance</p>
                              <p className="text-[#8A8880] text-sm leading-relaxed max-w-sm mx-auto">
                                We never share your personal data. Read our <Link href="/privacy-policy" className="text-[#E8A020] hover:underline">Privacy Policy</Link> for details.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sidebar Column */}
              <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-8 h-fit">
                {/* Admin Card - Only for admins */}
                {user.role === "admin" && (
                  <div className="bg-[#0A0A09] border border-[#1C1C1A] p-8 rounded-sm shadow-xl relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <ShieldCheck size={40} className="text-[#E8A020]" />
                    </div>
                    <h3 className="font-display text-[9px] font-900 text-[#555550] uppercase tracking-[0.3em] mb-6">System Access</h3>
                    <p className="text-[#8A8880] text-xs mb-8 leading-relaxed font-ui">Central hub for content feeds, users, and platform security.</p>
                    <Link href="/admin">
                      <button className="w-full flex items-center justify-center gap-3 border border-[#E8A020]/20 hover:border-[#E8A020] bg-transparent text-[9px] text-[#E8A020] py-4 rounded-sm font-900 uppercase tracking-[0.3em] transition-all hover:bg-[#E8A020]/5">
                        Admin Console
                        <ChevronRight size={14} />
                      </button>
                    </Link>
                  </div>
                )}

                {/* Support Card for All Users */}
                <div className="bg-[#0A0A09] border border-[#1C1C1A] p-8 rounded-sm shadow-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[#E8A020]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <h3 className="font-display text-[9px] font-900 text-[#555550] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <AlertCircle size={12} className="text-[#E8A020]" />
                    Need Assistance?
                  </h3>
                  <p className="text-[#8A8880] text-xs mb-8 leading-relaxed font-ui">
                    Reach out to our editorial team or resolve active subscription issues.
                  </p>
                  <Link href="/contact">
                    <button className="w-full flex items-center justify-center gap-3 bg-[#11110F] border border-[#1C1C1A] hover:border-[#E8A020]/30 text-[9px] text-[#F2F0EB] py-4 rounded-sm font-900 uppercase tracking-[0.3em] transition-all hover:text-[#E8A020]">
                      Contact Support
                    </button>
                  </Link>
                </div>
              </div>
            </div> {/* Close main grid */}
            <PricingModal
              isOpen={isPricingOpen}
              onClose={() => setIsPricingOpen(false)}
              initialView={modalView}
            />
          </div>
        </section>
      </main>

      <Footer hideNewsletter />
    </div>
  );
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
