import { Link } from "wouter";
import { BookOpen } from "lucide-react";

interface ReadAlsoProps {
  slug: string;
  title: string;
}

export default function ReadAlso({ slug, title }: ReadAlsoProps) {
  return (
    <aside className="my-8 p-6 bg-[#11110F] border-l-4 border-[#E8A020] rounded-sm group hover:bg-[#161614] transition-all">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen size={14} className="text-[#E8A020]" />
        <span className="font-ui text-[10px] font-900 text-[#E8A020] uppercase tracking-[0.3em]">Read Also</span>
      </div>
      <Link href={`/article/${slug}`}>
        <a className="font-display text-lg md:text-xl text-[#F2F0EB] hover:text-[#E8A020] transition-colors leading-tight block">
          {title}
        </a>
      </Link>
    </aside>
  );
}
