import { getAuthorByName } from "@/lib/authors";
import { Mail, Twitter, Linkedin } from "lucide-react";

interface AuthorBioProps {
    authorName: string;
}

export default function AuthorBio({ authorName }: AuthorBioProps) {
    const author = getAuthorByName(authorName);

    if (!author) return null;

    return (
        <div className="bg-[#1C1C1A] border border-[#2A2A28] rounded-sm p-6 md:p-8 my-12 flex flex-col md:flex-row gap-6 md:items-center">
            <div className="flex-shrink-0">
                <img 
                    src={author.image} 
                    alt={author.name} 
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover grayscale border-2 border-[#E8A020]/30"
                />
            </div>
            <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <h4 className="font-display text-xl text-[#F2F0EB]">{author.name}</h4>
                    <span className="font-ui text-[10px] text-[#E8A020] uppercase tracking-widest px-2 py-0.5 bg-[#E8A020]/10 rounded-full w-fit">
                        {author.role}
                    </span>
                </div>
                <p className="text-[#8A8880] text-sm leading-relaxed mb-4">
                    {author.bio}
                </p>
                <div className="flex items-center gap-4">
                    <a href="#" className="text-[#555550] hover:text-[#E8A020] transition-colors">
                        <Twitter size={16} />
                    </a>
                    <a href="#" className="text-[#555550] hover:text-[#E8A020] transition-colors">
                        <Linkedin size={16} />
                    </a>
                    <a href={`mailto:${authorName.toLowerCase().replace(' ', '.')}@bishouy.com`} className="text-[#555550] hover:text-[#E8A020] transition-colors">
                        <Mail size={16} />
                    </a>
                </div>
            </div>
        </div>
    );
}
