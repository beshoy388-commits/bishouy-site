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
import PricingModal from "@/components/PricingModal";
import { usePushNotifications } from "@/_core/hooks/usePushNotifications";

export default function UserProfile() {
  const { user, loading, logout, refresh } = useAuth({
    redirectOnUnauthenticated: true,
  });

  const push = usePushNotifications();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"library" | "membership" | "settings">("library");
  
  // FORM DATA SYNC - Optimized to prevent loops
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    location: "",
    avatarUrl: "",
  });

  const lastSyncUser = useRef<string | null>(null);

  useEffect(() => {
    if (user && !loading) {
      const userKey = `${user.id}-${user.name}-${user.email}-${user.avatarUrl}`;
      if (lastSyncUser.current !== userKey) {
        setFormData({
          name: user.name || "",
          username: user.username || "",
          email: user.email || "",
          bio: user.bio || "",
          location: user.location || "",
          avatarUrl: user.avatarUrl || "",
        });
        lastSyncUser.current = userKey;
      }
    }
  }, [user, loading]);

  const [settingsCategory, setSettingsCategory] = useState<"identity" | "security" | "communications">("identity");
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
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [modalView, setModalView] = useState<"plans" | "manage" | "payment_update" | "cancel_confirm">("plans");

  const updateMutation = trpc.users.updateMe.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      refresh();
    },
    onError: error => toast.error(error.message || "Failed to update profile"),
  });

  const { data: savedArticles, isLoading: isLoadingBookmarks } =
    trpc.bookmarks.list.useQuery(undefined, {
      enabled: !!user,
      staleTime: 30000, // cache bookmarks longer
    });

  const requestEmailMutation = trpc.users.requestEmailChange.useMutation({
    onSuccess: (data) => { toast.success(data.message); setEmailFlow("verifying"); },
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

  const changePasswordMutation = trpc.users.changePassword.useMutation({
    onSuccess: (data) => { toast.success(data.message); setPasswordFlow("idle"); setOldPassword(""); setNewPass(""); setConfirmPass(""); },
    onError: (err) => toast.error(err.message)
  });

  const requestPassResetMutation = trpc.users.requestPasswordResetCode.useMutation({
    onSuccess: (data) => { toast.success(data.message); setPasswordFlow("resetting"); },
    onError: (err) => toast.error(err.message)
  });

  const verifyPassResetMutation = trpc.users.verifyPasswordResetCode.useMutation({
    onSuccess: (data) => { toast.success(data.message); setPasswordFlow("idle"); setNewPass(""); setConfirmPass(""); setPassResetCode(""); },
    onError: (err) => toast.error(err.message)
  });

  const toggle2FAMutation = trpc.users.toggle2FA.useMutation({
    onSuccess: (data) => { toast.success(data.message); refresh(); },
    onError: (err) => toast.error(err.message)
  });

  const updatePreferencesMutation = trpc.users.updatePreferences.useMutation({
    onSuccess: (data) => { toast.success(data.message); refresh(); },
    onError: (err) => toast.error(err.message)
  });

  const verifySessionMutation = trpc.stripe.verifySession.useMutation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const hasProcessedSession = useRef(false);

  useEffect(() => {
    if (hasProcessedSession.current || loading || !user) return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      hasProcessedSession.current = true;
      window.history.replaceState({}, document.title, window.location.pathname);
      const verifyPromise = verifySessionMutation.mutateAsync({ sessionId });
      toast.promise(verifyPromise, {
        loading: "VERIFYING PAYMENT...",
        success: (result) => { if (result.success) { refresh(); return `MEMBERSHIP ACTIVATED`; } return "PAYMENT INCOMPLETE"; },
        error: "VERIFICATION FAILED",
      });
    }
  }, [loading, user]);

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

  const memberSince = useMemo(() => {
    try {
      if (!user?.createdAt) return "Active Member";
      const d = new Date(user.createdAt);
      if (isNaN(d.getTime())) return "Active Member";
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch { return "Active Member"; }
  }, [user?.createdAt]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0E] flex items-center justify-center">
        <div className="text-[#F2F0EB] text-[10px] uppercase tracking-[0.5em] animate-pulse">Loading Identity...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0F0F0E] flex flex-col">
      <SEO title={`${user.name || user.username} | BISHOUY`} description="Manage your intelligence segments." />
      <Navbar />

      <main className="flex-1">
        <section className="relative pt-20 pb-16 px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Header - No Animation Table */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-12">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-[#E8A020]/20 bg-[#11110F]">
                {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-[#11110F]"><UserIcon size={32} className="text-[#2A2A28]" /></div>}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-3xl md:text-6xl font-900 text-[#F2F0EB] uppercase tracking-tighter mb-4">{user.name || user.username}</h1>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-[10px] text-[#555550] uppercase tracking-widest font-bold">
                  <span className="text-[#E8A020]">@{user.username}</span>
                  <span>Joined {memberSince}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#1C1C1A] mb-12 overflow-x-auto no-scrollbar">
              {["library", "membership", "settings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-8 py-4 text-[10px] font-900 uppercase tracking-widest transition-all ${activeTab === tab ? "text-[#E8A020] border-b-2 border-[#E8A020]" : "text-[#555550]"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8">
                {activeTab === "library" && (
                   <div className="space-y-6">
                    {isLoadingBookmarks ? <div className="text-[#555550] text-[10px] uppercase">Retrieving bookmarks...</div> : 
                     (savedArticles && savedArticles.length > 0) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {savedArticles.map(article => (
                          <Link key={article.id} href={`/article/${article.slug}`}>
                            <div className="p-6 bg-[#0A0A09] border border-[#1C1C1A] hover:border-[#E8A020]/30 transition-all cursor-pointer h-full">
                              <h3 className="text-[#F2F0EB] font-bold uppercase text-sm mb-4 line-clamp-2">{article.title}</h3>
                              <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#1C1C1A]">
                                <span className="text-[9px] text-[#555550] uppercase tracking-widest">{article.category}</span>
                                <ChevronRight size={14} className="text-[#555550]" />
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                     ) : <div className="p-12 border border-dashed border-[#1C1C1A] text-center text-[#555550] uppercase text-[10px]">No saved intelligence</div>}
                   </div>
                )}

                {activeTab === "membership" && (
                    <div className="bg-[#0C0C0B] p-8 border border-[#1C1C1A]">
                       <div className="flex items-center justify-between mb-8">
                          <h2 className="text-xl font-900 text-[#F2F0EB] uppercase">Membership</h2>
                          <Zap size={20} className="text-[#E8A020]" />
                       </div>
                       <div className="bg-[#11110F] p-8 border border-[#1C1C1A] mb-8">
                          <span className="text-[9px] font-900 text-[#555550] uppercase block mb-2">Current Tier</span>
                          <span className="text-2xl font-900 text-[#E8A020] uppercase">{user.subscriptionTier || 'Free Access'}</span>
                       </div>
                       <button 
                         onClick={() => { setModalView(user.subscriptionTier !== 'free' ? 'manage' : 'plans'); setIsPricingOpen(true); }}
                         className="w-full bg-[#E8A020] text-[#0F0F0E] py-4 font-900 uppercase text-[11px] tracking-widest"
                       >
                         {user.subscriptionTier !== 'free' ? 'Manage Access' : 'Upgrade Information'}
                       </button>
                    </div>
                )}

                {activeTab === "settings" && (
                    <div className="bg-[#0C0C0B] p-8 border border-[#1C1C1A]">
                       <div className="flex gap-4 mb-10 overflow-x-auto no-scrollbar">
                         {["identity", "security"].map(cat => (
                           <button 
                             key={cat} onClick={() => setSettingsCategory(cat as any)}
                             className={`text-[9px] font-900 uppercase tracking-widest pb-2 ${settingsCategory === cat ? 'text-[#E8A020] border-b border-[#E8A020]' : 'text-[#555550]'}`}
                           >
                             {cat}
                           </button>
                         ))}
                       </div>

                       {settingsCategory === "identity" && (
                         <div className="space-y-6">
                            <input 
                              type="text" value={formData.name} 
                              onChange={e => setFormData({...formData, name: e.target.value})}
                              placeholder="Display Name"
                              className="w-full bg-[#11110F] border border-[#1C1C1A] p-4 text-[#F2F0EB] text-sm focus:outline-none"
                            />
                            <textarea 
                              value={formData.bio} 
                              onChange={e => setFormData({...formData, bio: e.target.value})}
                              placeholder="Short Bio"
                              className="w-full bg-[#11110F] border border-[#1C1C1A] p-4 text-[#F2F0EB] text-sm h-32 focus:outline-none"
                            />
                            <button onClick={handleSaveProfile} className="bg-[#1C1C1A] text-[#F2F0EB] px-8 py-3 text-[10px] font-900 uppercase border border-[#2A2A28]">
                               {updateMutation.isPending ? "Syncing..." : "Update Details"}
                            </button>
                         </div>
                       )}
                    </div>
                )}
              </div>

              <div className="lg:col-span-4 space-y-6">
                 {user.role === "admin" && (
                    <Link href="/admin">
                      <div className="p-6 bg-[#0A0A09] border border-[#E8A020]/20 text-[#E8A020] cursor-pointer hover:bg-[#E8A020]/5 transition-all">
                        <span className="text-[9px] font-900 uppercase tracking-widest">System Overlord</span>
                        <h4 className="font-bold uppercase mt-2 flex items-center justify-between">Admin Console <ChevronRight size={14}/></h4>
                      </div>
                    </Link>
                 )}
                 <div onClick={() => window.location.href='/contact'} className="p-6 bg-[#0C0C0B] border border-[#1C1C1A] text-[#555550] cursor-pointer">
                    <span className="text-[9px] font-900 uppercase tracking-widest">Support</span>
                    <h4 className="font-bold uppercase mt-2 flex items-center justify-between">Contact Assistance <ChevronRight size={14}/></h4>
                 </div>
                 <button onClick={async () => { await logout(); window.location.href='/'; }} className="w-full py-4 border border-red-950 text-red-900 text-[9px] font-900 uppercase tracking-widest hover:bg-red-950/20 transition-all">
                    Terminate Session
                 </button>
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
