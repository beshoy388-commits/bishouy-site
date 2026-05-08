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
    "Beshoy Toubia": {
        name: "Beshoy Toubia",
        role: "Editor-in-Chief",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=400&h=400&fit=crop",
        bio: "Veteran journalist and investigative editor with over 15 years of experience in international affairs. Founder of Bishouy.com, focused on the intersection of geopolitics and emerging technology."
    },
    "Bishouy Editorial": {
        name: "Editorial Desk",
        role: "Global News",
        image: "https://images.unsplash.com/photo-1495020689067-958852a7735e?ixlib=rb-4.0.3&w=400&h=400&fit=crop",
        bio: "A collective of seasoned journalists, analysts, and contributors from London, Milan, and New York, delivering rigorous, fact-based reporting on global events."
    },
    "Bishouy AI": {
        name: "Bishouy Intelligence",
        role: "Neural Analysis",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&w=400&h=400&fit=crop",
        bio: "The technical heart of Bishouy, utilizing advanced neural networks to synthesize vast datasets into actionable intelligence for our readers."
    }
};

export const getAuthorByName = (name: string): Author | undefined => {
    return AUTHORS[name] || AUTHORS["Bishouy Editorial"];
};
