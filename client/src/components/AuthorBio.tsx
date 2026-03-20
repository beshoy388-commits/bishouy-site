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
                    loading="lazy"
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
                    {author.socials?.twitter && (
                        <a href={author.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-[#555550] hover:text-[#E8A020] transition-colors" aria-label="X (formerly Twitter)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.486 3.24H4.298L17.607 20.65z" />
                            </svg>
                        </a>
                    )}
                    {author.socials?.linkedin && (
                        <a href={author.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#555550] hover:text-[#E8A020] transition-colors" aria-label="LinkedIn">
                            <Linkedin size={16} />
                        </a>
                    )}
                    <a href={`mailto:${authorName.toLowerCase().replaceAll(' ', '.')}@bishouy.com`} className="text-[#555550] hover:text-[#E8A020] transition-colors" aria-label="Email">
                        <Mail size={16} />
                    </a>
                </div>
            </div>
        </div>
    );
}
