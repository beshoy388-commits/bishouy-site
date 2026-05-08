import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Clock } from "lucide-react";

export default function ArticleSidebar({ currentSlug }: { currentSlug?: string }) {
  const { data: recent } = trpc.articles.getRecent.useQuery({ limit: 5 });
  const { data: trending } = trpc.articles.trending.useQuery({ limit: 5 });

  const renderList = (items: typeof recent) => {
    if (!items || items.length === 0) return (
      <p className="text-[#555550] text-xs font-ui">No articles yet.</p>
    );
    return (
      <ol className="space-y-4">
        {items.map((article, idx) => (
          <li key={article.id}>
            <Link href={`/article/${article.slug}`}>
              <span className="flex items-start gap-3 group cursor-pointer">
                <span className="font-display text-2xl text-[#2A2A28] font-bold leading-none mt-0.5 flex-shrink-0 w-6">
                  {idx + 1}
                </span>
                <span className="font-ui text-sm text-[#8A8880] group-hover:text-[#E8A020] transition-colors leading-snug line-clamp-3">
                  {article.title}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    );
  };

  return (
    <aside className="space-y-10">
      {/* Trending */}
      <div className="bg-[#1C1C1A] rounded-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={14} className="text-[#E8A020]" />
          <span className="font-ui text-[11px] text-[#E8A020] uppercase tracking-widest font-bold">
            Trending
          </span>
        </div>
        {renderList(trending)}
      </div>

      {/* Recent */}
      <div className="bg-[#1C1C1A] rounded-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Clock size={14} className="text-[#8A8880]" />
          <span className="font-ui text-[11px] text-[#8A8880] uppercase tracking-widest font-bold">
            Most Recent
          </span>
        </div>
        {renderList(recent)}
      </div>
    </aside>
  );
}
