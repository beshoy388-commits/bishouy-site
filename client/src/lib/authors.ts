export interface Author {
    name: string;
    role: string;
    image: string;
    bio: string;
    socials?: {
        twitter?: string;
        linkedin?: string;
        email?: string;
    };
}

export const AUTHORS: Record<string, Author> = {
    "Julian Vance": {
        name: "Julian Vance",
        role: "Editor-in-Chief",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&w=400&h=400&fit=crop",
        bio: "With over 20 years in digital publishing and a background at major international news desks, Julian oversees the global editorial strategy and integrity of Bishouy."
    },
    "Elena Rostova": {
        name: "Elena Rostova",
        role: "Senior Foreign Correspondent",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&w=400&h=400&fit=crop",
        bio: "Specializing in geopolitical shifts across Eurasia, Elena brings ground-level reporting from conflict zones and diplomatic summits to our readers."
    },
    "Marcus Chen": {
        name: "Marcus Chen",
        role: "Tech & Innovation Lead",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&w=400&h=400&fit=crop",
        bio: "A former software engineer turned investigative journalist, Marcus decodes the intersection of silicon, society, and the burgeoning AI economy."
    },
    "Sofia Romano": {
        name: "Sofia Romano",
        role: "Chief Culture Analyst",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&w=400&h=400&fit=crop",
        bio: "Sofia explores the evolution of digital art, cinema, and global ethics, ensuring our cultural coverage remains as rigorous as our hard news."
    },
    "Marco Ferretti": {
        name: "Marco Ferretti",
        role: "EU Correspondent",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=400&h=400&fit=crop",
        bio: "Based in Brussels, Marco covers the intricate dance of European policy and its impact on global energy markets."
    },
    "Giulia Marchetti": {
        name: "Giulia Marchetti",
        role: "Science Editor",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=400&h=400&fit=crop",
        bio: "Giulia bridges the gap between complex clinical research and public understanding, focusing on clinical AI and longevity science."
    },
    "Luca Bianchi": {
        name: "Luca Bianchi",
        role: "Financial Analyst",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&w=400&h=400&fit=crop",
        bio: "A veteran of the Milan Stock Exchange, Luca provides forensic analysis of market volatility and institutional investment trends."
    },
    "Antonio Esposito": {
        name: "Antonio Esposito",
        role: "Political Correspondent",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=400&h=400&fit=crop",
        bio: "Antonio covers the corridors of power, specializing in fiscal reform and the legislative processes of southern Europe."
    },
    "Roberto Conti": {
        name: "Roberto Conti",
        role: "Sports Editor",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&w=400&h=400&fit=crop",
        bio: "Roberto brings a tactical eye to international football, analyzing the data behind the world's most beautiful game."
    },
    "Redazione AI": {
        name: "Redazione AI",
        role: "Artificial Intelligence Desk",
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&w=400&h=400&fit=crop",
        bio: "Our automated data aggregation and research desk, supervised by Julian Vance and Marcus Chen to ensure factual accuracy and editorial depth."
    }
};

export const getAuthorByName = (name: string): Author | undefined => {
    return AUTHORS[name];
};
