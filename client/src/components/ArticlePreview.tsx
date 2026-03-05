/*
 * BISHOUY.COM — Article Preview Component
 * Full-page preview of an article as it will appear to readers
 */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Clock, User, Calendar } from "lucide-react";

interface ArticlePreviewProps {
  article: {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    categoryColor: string;
    author: string;
    authorRole: string;
    image: string;
    featured: boolean;
    breaking: boolean;
    readTime: number;
    tags: string[];
  };
}

export default function ArticlePreview({ article }: ArticlePreviewProps) {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Parse custom image directives for rendering
  const renderContent = (content: string) => {
    const parts = content.split(/(<!-- img:[a-z]+:\d+% -->)/g);
    let currentImageStyle: { position: string; width: string } | null = null;

    return parts.map((part, index) => {
      const directiveMatch = part.match(/<!-- img:([a-z]+):(\d+)% -->/);
      if (directiveMatch) {
        currentImageStyle = {
          position: directiveMatch[1],
          width: directiveMatch[2],
        };
        return null;
      }

      const style = currentImageStyle;
      currentImageStyle = null;

      return (
        <ReactMarkdown
          key={index}
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ src, alt }) => {
              const imgStyle = style || { position: "center", width: "100" };
              const alignClass =
                imgStyle.position === "left"
                  ? "mr-auto"
                  : imgStyle.position === "right"
                    ? "ml-auto"
                    : imgStyle.position === "full"
                      ? "w-full"
                      : "mx-auto";

              return (
                <figure
                  className={`my-6 ${imgStyle.position === "left"
                      ? "float-left mr-6 mb-4"
                      : imgStyle.position === "right"
                        ? "float-right ml-6 mb-4"
                        : "clear-both"
                    }`}
                  style={{
                    width:
                      imgStyle.position === "full"
                        ? "100%"
                        : `${imgStyle.width}%`,
                  }}
                >
                  <img
                    src={src}
                    alt={alt || ""}
                    className={`rounded-sm ${alignClass}`}
                    style={{ width: "100%", height: "auto" }}
                  />
                </figure>
              );
            },
            em: ({ children }) => {
              const text = String(children);
              if (style) {
                return (
                  <figcaption className="text-center text-[#8A8880] text-sm mt-2 italic">
                    {text}
                  </figcaption>
                );
              }
              return <em>{children}</em>;
            },
            h1: ({ children }) => (
              <h1 className="font-display text-3xl text-[#F2F0EB] mt-8 mb-4">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="font-display text-2xl text-[#F2F0EB] mt-6 mb-3">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-display text-xl text-[#F2F0EB] mt-4 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-[#D4D0C8] leading-relaxed mb-4 font-serif text-base">
                {children}
              </p>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-[#E8A020] pl-4 my-4 italic text-[#8A8880]">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-[#E8A020] hover:text-[#D4911C] underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 mb-4 text-[#D4D0C8]">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 mb-4 text-[#D4D0C8]">
                {children}
              </ol>
            ),
            code: ({ children, className }) => {
              if (className) {
                return (
                  <code className="block bg-[#0F0F0E] p-4 rounded-sm text-[#E8A020] text-sm overflow-x-auto mb-4">
                    {children}
                  </code>
                );
              }
              return (
                <code className="bg-[#0F0F0E] px-1.5 py-0.5 rounded text-[#E8A020] text-sm">
                  {children}
                </code>
              );
            },
            hr: () => <hr className="border-[#222220] my-8" />,
          }}
        >
          {part}
        </ReactMarkdown>
      );
    });
  };

  return (
    <div className="bg-[#0F0F0E] rounded-sm border border-[#2A2A28] overflow-hidden">
      {/* Preview Banner */}
      <div className="bg-[#E8A020] text-[#0F0F0E] text-center py-2 font-ui text-xs font-600 uppercase tracking-widest">
        Article Preview — This is how the article will appear to readers
      </div>

      {/* Hero Image */}
      {article.image && (
        <div className="relative h-[300px] md:h-[400px] overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80";
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                const blurBg = parent.querySelector('.img-hero-blur-bg') as HTMLElement;
                if (blurBg) blurBg.style.backgroundImage = 'url(https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)';
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0E] via-[#0F0F0E]/40 to-transparent" />
        </div>
      )}

      {/* Article Content */}
      <div className="px-6 md:px-12 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="font-ui text-[10px] font-700 uppercase tracking-widest px-2.5 py-1 rounded-sm text-white"
                style={{ backgroundColor: article.categoryColor || "#E8A020" }}
              >
                {article.category}
              </span>
              {article.breaking && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E8A020] animate-pulse" />
                  <span className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest">
                    Breaking
                  </span>
                </div>
              )}
              {article.featured && (
                <span className="font-ui text-[10px] font-600 text-[#E8A020] uppercase tracking-widest border border-[#E8A020] px-2 py-0.5 rounded-sm">
                  Featured
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-900 text-[#F2F0EB] leading-tight mb-4">
              {article.title || "Untitled Article"}
            </h1>

            <p className="text-[#8A8880] text-lg mb-6">
              {article.excerpt || "No excerpt provided."}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-[#8A8880] text-sm border-t border-b border-[#1C1C1A] py-4">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{article.author || "Unknown Author"}</span>
                {article.authorRole && (
                  <span className="text-[#555550]">· {article.authorRole}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{today}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{article.readTime} min read</span>
              </div>
            </div>
          </div>

          {/* Article Body */}
          <div className="prose prose-invert max-w-none mb-12">
            {article.content ? (
              renderContent(article.content)
            ) : (
              <p className="text-[#555550] italic">
                No content yet. Start writing in the editor.
              </p>
            )}
            <div className="clear-both" />
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-[#1C1C1A]">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="font-ui text-[10px] px-3 py-1.5 bg-[#1C1C1A] text-[#8A8880] rounded-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
