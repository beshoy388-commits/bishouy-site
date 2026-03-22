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
        bio: "Visionary journalist and founder of Bishouy.com. Dedicated to building a platform that marries traditional editorial integrity with the analytical power of emerging technologies."
    },
    "Bishouy Editorial": {
        name: "Editorial Desk",
        role: "Global News",
        image: "https://images.unsplash.com/photo-1495020689067-958852a7735e?ixlib=rb-4.0.3&w=400&h=400&fit=crop",
        bio: "Our global editorial collective dedicated to bringing high-fidelity news, analysis, and insights from the intersection of technology, culture, and politics."
    },
    "Bishouy AI": {
        name: "Bishouy Intelligence",
        role: "Neural Analysis",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&w=400&h=400&fit=crop",
        bio: "Our proprietary AI-assisted research node specializing in real-time data processing, pattern recognition, and trend forecasting for complex global events."
    }
};

export const getAuthorByName = (name: string): Author | undefined => {
    return AUTHORS[name] || AUTHORS["Bishouy Editorial"];
};
