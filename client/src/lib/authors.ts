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
    "Bishouy Editorial": {
        name: "Bishouy Editorial",
        role: "Editorial Desk",
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&w=400&h=400&fit=crop",
        bio: "Our global editorial collective dedicated to bringing high-fidelity news, analysis, and insights from the intersection of technology, culture, and politics."
    },
    "Bishouy Research": {
        name: "Bishouy Research",
        role: "Data & Insights",
        image: "https://images.unsplash.com/photo-1494707924465-e1426acb48cb?ixlib=rb-4.0.3&w=400&h=400&fit=crop",
        bio: "Specializing in deep-dive research and data visualization, our research desk provides the factual backbone for our most complex stories."
    }
};

export const getAuthorByName = (name: string): Author | undefined => {
    return AUTHORS[name] || AUTHORS["Bishouy Editorial"];
};
