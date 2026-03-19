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
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ImageUploader from "@/components/ImageUploader";

export default function UserProfile() {
  const { user, loading, logout, refresh } = useAuth({
    redirectOnUnauthenticated: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
    avatarUrl: user?.avatarUrl || "",
  });

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
        website: user.website || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    await updateMutation.mutateAsync({
      name: formData.name,
      username: formData.username,
      bio: formData.bio,
      location: formData.location,
      website: formData.website,
      avatarUrl: formData.avatarUrl,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0E] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#E8A020]" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F0F0E]">
        <Navbar />
        <div className="container text-center">
          <p className="text-[#8A8880] mb-4">
            Please login to view your profile
          </p>
          <Link href="/">
            <button className="text-[#E8A020] hover:text-[#D4911C]">
              Back to Home
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0E]">
      <Navbar />

      <section className="container pb-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header */}
          <div className="bg-[#1C1C1A] rounded-sm p-8 md:p-12 mb-8">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E8A020] to-[#D4911C] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt={formData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={48} className="text-[#0F0F0E]" />
                  )}
                </div>
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-900 text-[#F2F0EB] flex items-center gap-3">
                    {formData.name || "User"}
                    {user.id < 100 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] bg-[#E8A020]/10 border border-[#E8A020]/30 text-[#E8A020] text-[8px] font-900 uppercase tracking-widest leading-none">
                        Founding Member
                      </span>
                    )}
                  </h1>
                  {formData.username && (
                    <p className="text-[#E8A020] text-sm font-500">
                      @{formData.username}
                    </p>
                  )}
                  <p className="text-[#8A8880] text-sm">{formData.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-4 py-2 rounded-sm transition-colors"
              >
                {isEditing ? (
                  <>
                    <X size={14} />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit2 size={14} />
                    Edit
                  </>
                )}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-6">
                {/* Avatar Upload */}
                <div>
                  <label className="block text-[#8A8880] text-sm mb-2">
                    Profile Photo
                  </label>
                  <ImageUploader
                    onImageUpload={url =>
                      setFormData({ ...formData, avatarUrl: url })
                    }
                    currentImage={formData.avatarUrl}
                    label="Upload Profile Photo"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-[#8A8880] text-sm mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm px-4 py-2 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020]"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-[#8A8880] text-sm mb-2">
                    Username (@username)
                  </label>
                  <div className="flex items-center">
                    <span className="text-[#8A8880] mr-2">@</span>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          username: e.target.value.toLowerCase(),
                        })
                      }
                      placeholder="yourname"
                      maxLength={50}
                      className="flex-1 bg-[#0F0F0E] border border-[#222220] rounded-sm px-4 py-2 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020]"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[#8A8880] text-sm mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm px-4 py-2 text-[#F2F0EB] focus:outline-none focus:border-[#E8A020]"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-[#8A8880] text-sm mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={e =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                    rows={4}
                    className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm px-4 py-2 text-[#F2F0EB] placeholder-[#555550] focus:outline-none focus:border-[#E8A020] resize-none"
                  />
                  <p className="text-[#555550] text-xs mt-1">
                    {formData.bio.length}/500
                  </p>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[#8A8880] text-sm mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="City, Country"
                    className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm px-4 py-2 text-[#F2F0EB] placeholder-[#555550] focus:outline-none focus:border-[#E8A020]"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-[#8A8880] text-sm mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={e =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="https://yourwebsite.com"
                    className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm px-4 py-2 text-[#F2F0EB] placeholder-[#555550] focus:outline-none focus:border-[#E8A020]"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveProfile}
                  disabled={updateMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-[#27AE60] hover:bg-[#229954] text-white font-ui text-sm font-600 uppercase tracking-wider px-6 py-3 rounded-sm transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.bio && (
                  <div className="border-b border-[#222220] pb-4">
                    <p className="text-[#8A8880] text-sm mb-1">Bio</p>
                    <p className="text-[#F2F0EB]">{formData.bio}</p>
                  </div>
                )}

                {formData.location && (
                  <div className="border-b border-[#222220] pb-4">
                    <p className="text-[#8A8880] text-sm mb-1">Location</p>
                    <p className="text-[#F2F0EB]">{formData.location}</p>
                  </div>
                )}

                {formData.website && (
                  <div className="border-b border-[#222220] pb-4">
                    <p className="text-[#8A8880] text-sm mb-1">Website</p>
                    <a
                      href={formData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E8A020] hover:text-[#D4911C]"
                    >
                      {formData.website}
                    </a>
                  </div>
                )}

                <div className="border-b border-[#222220] pb-4">
                  <p className="text-[#8A8880] text-sm mb-1">Access Level</p>
                  <p className="text-[#F2F0EB] font-500 uppercase tracking-widest text-xs">
                    {user.role === "admin" ? (
                      <span className="text-[#E8A020]">System Administrator</span>
                    ) : (
                      "Editorial Reader"
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[#8A8880] text-sm mb-1">Member Since</p>
                  <p className="text-[#F2F0EB] font-500">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={async () => {
                await logout();
                window.location.href = "/";
              }}
              className="w-full mt-8 flex items-center justify-center gap-2 bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-sm font-600 uppercase tracking-wider px-6 py-3 rounded-sm transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* Admin Panel Link */}
          {user.role === "admin" && (
            <div className="bg-[#1C1C1A] rounded-sm p-8">
              <h2 className="font-display text-xl text-[#F2F0EB] mb-4">
                Admin Tools
              </h2>
              <p className="text-[#8A8880] text-sm mb-6">
                As an administrator, you have access to the admin panel where
                you can manage articles, comments, and users.
              </p>
              <Link href="/admin">
                <button className="bg-[#E8A020] hover:bg-[#D4911C] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-wider px-6 py-3 rounded-sm transition-colors">
                  Go to Admin Panel
                </button>
              </Link>
            </div>
          )}

          <div className="bg-[#1C1C1A] rounded-sm p-8 mt-8 border-t-2 border-[#E8A020]">
            <h2 className="font-display text-xl text-[#F2F0EB] mb-6 flex items-center gap-2">
              <Bookmark size={20} className="text-[#E8A020]" />
              Your Intelligence Library
            </h2>

            {isLoadingBookmarks ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-[#E8A020]" size={24} />
              </div>
            ) : savedArticles && savedArticles.length > 0 ? (
              <div className="space-y-4">
                {savedArticles.map(article => (
                  <Link key={article.id} href={`/article/${article.slug}`}>
                    <div className="flex gap-4 group cursor-pointer border border-[#222220] p-4 rounded-sm hover:border-[#E8A020] transition-colors bg-[#0F0F0E]">
                      {article.image && (
                        <div className="w-24 h-24 flex-shrink-0 bg-[#222220] rounded-sm overflow-hidden hidden sm:block">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-[10px] text-[#E8A020] font-ui uppercase tracking-widest font-bold mb-1">
                          {article.category}
                        </div>
                        <h3 className="font-display text-lg text-[#F2F0EB] group-hover:text-[#E8A020] transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <div className="mt-2 text-xs text-[#8A8880] font-ui uppercase tracking-widest">
                          {new Date(
                            article.publishedAt || article.createdAt
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bookmark size={32} className="mx-auto mb-4 text-[#2A2A28]" />
                <p className="text-[#8A8880] text-sm mb-6 max-w-xs mx-auto">
                  Your private intelligence collection is empty. Save analytical reports to access them here.
                </p>
                <Link href="/">
                  <button className="text-[#E8A020] hover:text-[#D4911C] font-ui text-[10px] uppercase tracking-widest font-900 border border-[#E8A020]/30 px-6 py-2 rounded-sm hover:bg-[#E8A020]/5 transition-all">
                    Browse Reports
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
