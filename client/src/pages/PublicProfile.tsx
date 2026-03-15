import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  User,
  Calendar,
  Link as LinkIcon,
  MapPin,
  Loader2,
  Shield,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

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
          <Loader2 className="animate-spin text-[#E8A020]" size={32} />
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
          <h1 className="font-display text-4xl text-[#E8A020] mb-4">
            User Not Found
          </h1>
          <p className="text-[#8A8880] mb-8">
            The profile you are looking for does not exist.
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
    <div className="min-h-screen bg-[#0F0F0E] flex flex-col">
      <SEO 
        title={`${profile.name} (@${profile.username})`} 
        description={profile.bio || `View the reader profile of ${profile.name} on Bishouy.com`}
        image={profile.avatarUrl || undefined}
      />
      <Navbar />

      <main className="flex-1 container pt-44 lg:pt-52 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#1C1C1A] border border-[#2A2A28] p-8 md:p-12 flex flex-col items-center text-center">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name || "User Avatar"}
                className="w-32 h-32 rounded-full object-cover mb-6 border-4 border-[#E8A020]"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-[#2A2A28] border-4 border-[#E8A020] flex items-center justify-center mb-6">
                <User size={48} className="text-[#8A8880]" />
              </div>
            )}

            <h1 className="font-display text-4xl text-[#F2F0EB] mb-2">
              {profile.name}
            </h1>
            <p className="font-ui text-sm text-[#E8A020] tracking-widest uppercase mb-4">
              @{profile.username}
            </p>

            {profile.role === "admin" && (
              <div className="bg-[#2A2A28] px-3 py-1 rounded-full flex items-center gap-1.5 mb-6 text-[#F2F0EB] text-[10px] font-600 tracking-widest uppercase">
                <Shield size={12} className="text-[#E8A020]" />
                Administrator
              </div>
            )}

            <p className="text-[#D4D0C8] max-w-lg mx-auto leading-relaxed mb-8">
              {profile.bio || "This user hasn't added a bio yet."}
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-[#8A8880] text-sm font-ui border-t border-[#2A2A28] pt-8 w-full">
              {profile.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#E8A020]" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.website && (
                <div className="flex items-center gap-2">
                  <LinkIcon size={16} className="text-[#E8A020]" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#E8A020] transition-colors"
                  >
                    Website
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#E8A020]" />
                <span>Joined {joinDate}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 bg-[#1C1C1A] border border-[#2A2A28] p-8 md:p-12">
            <h2 className="font-display text-2xl text-[#F2F0EB] mb-8 pb-4 border-b border-[#2A2A28]">
              Recent Comments
            </h2>

            {comments && comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment: any) => (
                  <div
                    key={comment.id}
                    className="bg-[#0F0F0E] p-6 rounded-sm border border-[#222220]"
                  >
                    <div className="flex items-center gap-2 mb-3 text-sm text-[#8A8880] font-ui">
                      <span>Commented on</span>
                      <a
                        href={`/article/${comment.articleSlug}`}
                        className="text-[#E8A020] hover:text-[#D4911C] font-bold line-clamp-1 transition-colors"
                      >
                        {comment.articleTitle}
                      </a>
                      <span className="ml-auto text-xs shrink-0">
                        {new Date(comment.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </span>
                    </div>
                    <p className="text-[#D4D0C8] whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#8A8880] text-center py-8">
                {profile.name} hasn't made any public comments yet.
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
