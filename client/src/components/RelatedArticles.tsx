import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Calendar } from "lucide-react";

interface RelatedArticlesProps {
  articleId: number;
  category: string;
}

export default function RelatedArticles({ articleId, category }: RelatedArticlesProps) {
  const { data: articles } = trpc.articles.getRelated.useQuery(
    { articleId, limit: 3 },
    { suspense: false }
  );

  if (!articles || articles.length === 0) return null;

  return (
    <section className="mt-16 border-t border-[#1C1C1A] pt-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-gradient-to-r from-[#E8A020] to-transparent" />
        <span className="font-ui text-[10px] text-[#8A8880] uppercase tracking-widest whitespace-nowrap">
          Related Articles
        </span>
        <div className="flex-1 h-px bg-gradient-to-l from-[#E8A020] to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => {
          const date = new Date(article.publishedAt || article.createdAt!).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          return (
            <Link key={article.id} href={`/article/${article.slug}`}>
              <article className="group cursor-pointer">
                <div className="aspect-[16/9] overflow-hidden rounded-sm mb-3 bg-[#1C1C1A]">
                  <img
                    src={article.image || ""}
                    alt={article.title}
                    width={400}
                    height={225}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-display text-sm font-bold text-[#F2F0EB] leading-snug mb-2 group-hover:text-[#E8A020] transition-colors line-clamp-3">
                  {article.title}
                </h3>
                <div className="flex items-center gap-1 text-[#555550] text-xs">
                  <Calendar size={11} />
                  <span>{date}</span>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
