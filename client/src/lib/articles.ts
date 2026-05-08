/*
 * BISHOUY.COM — Articles Data
 * Static article data for the global news blog (English)
 */

export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  categoryColor: string | null;
  author: string;
  authorRole: string | null;
  date?: string;
  readTime: number;
  image: string;
  featured: boolean | number;
  breaking?: boolean | number;
  tags?: string[] | string | null;
  createdAt?: Date;
  updatedAt?: Date;
  publishedAt?: Date | null;
  authorId?: number | null;
  likeCount?: number;
  hasLiked?: boolean;
  premiumOnly?: number | boolean;
}

export const CATEGORIES = [
  { 
    name: "World", 
    slug: "world", 
    color: "#E8A020", 
    description: "Our World section offers an uncompromising and sophisticated analysis of the global geopolitical landscape. In an era defined by rapid shifts in international power dynamics, we provide the strategic intelligence necessary to navigate the complexities of modern diplomacy, cross-border conflicts, and emerging global alliances. From the resurgence of great power competition in Eurasia to the critical development of sustainable governance in the Global South, our reporting is designed for the informed citizen who demands depth over brevity. We delve into the historical roots of contemporary crises, examining how regional tensions influence global trade, energy security, and the humanitarian frontier. Our network of correspondents and neural synthesis models work in tandem to deliver a 360-degree view of the events that are not just making headlines, but are fundamentally rewriting the world's constitutional and physical geography. Expect detailed investigations into international law, the impact of climate-driven migration on state sovereignty, and the behind-the-scenes negotiations shaping the future of global institutions." 
  },
  { 
    name: "Politics", 
    slug: "politics", 
    color: "#C0392B", 
    description: "At the heart of the BISHOUY editorial mission is a rigorous examination of state power, legislative architecture, and institutional integrity. The Politics desk moves beyond the transient noise of partisan rhetoric to analyze the structural forces driving national and local governance. We focus on the evolution of democratic institutions, the rise of technocratic governance models, and the critical intersection of civil liberties with state-driven security frameworks. Our coverage tracks the granular details of policy formulation, the judicial precedents being set in high courts, and the electoral shifts that signal deeper societal transformations. We believe that true political reporting requires a commitment to transparency and an understanding of the incentive structures that dictate public administration. Whether we are covering the intricacies of constitutional reform or the populist movements reshaping traditional party systems, our goal is to provide a clear, evidence-based roadmap of the political landscape. By synthesizing expert commentary with raw legislative data, we offer our readers a unique perspective on how power is won, maintained, and challenged in the 21st century." 
  },
  { 
    name: "Economy", 
    slug: "economy", 
    color: "#27AE60", 
    description: "The BISHOUY Economy section is a premier destination for macroeconomic intelligence, fiscal policy analysis, and market-shaping trends. We recognize that the global economy is an interconnected, living system where a policy shift in one hemisphere can trigger profound consequences in another. Our reporting covers the entire spectrum of economic activity, from the centralized decisions of major central banks regarding interest rates and quantitative easing to the disruptive potential of decentralized finance and blockchain technology. We provide high-fidelity analysis of global supply chains, the future of labor in an automated world, and the transition toward a circular economy. Our readers benefit from deep dives into trade agreements, commodity market fluctuations, and the fiscal health of both emerging and developed nations. We prioritize clarity in our financial reporting, helping readers distinguish between market volatility and structural economic change. By integrating traditional financial metrics with ESG (Environmental, Social, and Governance) data, we offer a modern framework for understanding value creation and risk in a world where economic stability is increasingly tied to social and environmental sustainability." 
  },
  { 
    name: "Technology", 
    slug: "technology", 
    color: "#2980B9", 
    description: "Welcome to the frontline of the digital frontier. Our Technology section is dedicated to tracking the breakthroughs and ethical challenges that are redefining human capability. We focus on the transformative power of Artificial Intelligence, from large language models to neural architecture, and examine their impact on every aspect of society, from healthcare and education to military strategy and creative expression. Beyond AI, our reporting encompasses the quantum computing revolution, the expansion of 6G networks, and the critical field of cybersecurity in an age of hybrid warfare. We investigate the 'Big Tech' ecosystem, analyzing the antitrust movements and data privacy regulations that seek to curb digital monopolies. We also highlight the 'deep tech' startups working on fusion energy, biotechnology, and space exploration, providing a glimpse into the industries that will dominate the coming decades. Our technology coverage is rooted in a philosophy of 'Neural Insights'—where we use advanced data analysis to uncover patterns in innovation that traditional journalism might miss. We are not just reporting on gadgets; we are documenting the co-evolution of humanity and its most sophisticated tools." 
  },
  { 
    name: "Culture", 
    slug: "culture", 
    color: "#8E44AD", 
    description: "The BISHOUY Culture section is an intellectual sanctuary for the examination of artistic expression, philosophical discourse, and the evolving narratives of modern society. We explore the archetypes that define our collective identity and the cultural shifts that drive social progress. Our coverage ranges from the high-art movements appearing in global galleries to the underground digital subcultures reshaping the internet's social fabric. We provide nuanced critiques of contemporary cinema, literature, and architecture, always seeking to understand how these works reflect or challenge the spirit of the times (Zeitgeist). Our cultural reporting also addresses the profound impact of globalization on local traditions, the ethics of cultural appropriation, and the role of storytelling in a fragmented media landscape. We believe that culture is the primary engine of human meaning, and our goal is to document its most vibrant and challenging manifestations. Whether analyzing the philosophical implications of post-humanism or the resurgence of ancient craftsmanship in a mass-produced world, our Culture desk provides a sophisticated lens through which to view the shared experiences that bind us together as a species." 
  },
  { 
    name: "Sports", 
    slug: "sports", 
    color: "#E67E22", 
    description: "Our Sports coverage goes far beyond the scoreboard to investigate the business, science, and cultural impact of international athletic competition. We examine the massive economic engines driving global leagues, the intricacies of athlete representation and branding, and the rapidly evolving field of sports medicine and performance optimization. From the geopolitical implications of hosting major international tournaments like the Olympics or the World Cup to the grassroots movements seeking to make sport more accessible and equitable, we provide a holistic view of the sporting world. Our reporting also tracks the intersection of technology and performance, including the use of advanced analytics in coaching, the development of next-generation equipment, and the rise of e-sports as a legitimate competitive and commercial force. We profile the icons who inspire millions and the institutional structures that govern their careers. In the BISHOUY Sports section, we treat athletic achievement with the same analytical rigour as our geopolitical or economic reporting, recognizing that sport is a powerful mirror of societal values, national pride, and human potential." 
  },
];

export const ARTICLES: Article[] = [
  {
    id: 1,
    slug: "european-summit-energy-policies-2030",
    title: "European Summit: Leaders Approve Historic Energy Policies for 2030",
    excerpt:
      "The heads of government of the 27 EU member states have reached a historic agreement on energy policies that will reshape the continent's industrial landscape.",
    content: `European leaders gathered in Brussels have unanimously approved an unprecedented package of energy measures set to radically transform how the continent produces and consumes energy by 2030.

The agreement, the result of months of intensive negotiations, includes increasing the share of renewable energy to 45% of the total energy mix, reducing CO₂ emissions by 55% compared to 1990 levels, and public investments exceeding 800 billion euros in green infrastructure.

"This is the moment when Europe demonstrates it is equal to the challenges of our time," declared the President of the European Commission during the closing press conference. "This is not just about the environment: it's about energy sovereignty, jobs, and competitiveness."

Eastern European countries, initially more resistant, secured specific transition funds to help their economies still dependent on coal transition to more sustainable production models.`,
    category: "World",
    categoryColor: "#E8A020",
    author: "Marco Ferretti",
    authorRole: "Correspondent from Brussels",
    date: "March 3, 2026",
    readTime: 5,
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663399083273/3dAGBac6MGitvNrWVvmyAK/bishouy-hero-world-YhM6ksz8FapgLsXA57BfrG.webp",
    featured: true,
    breaking: true,
    tags: ["Europe", "Energy", "Climate", "Politics"],
  },
  {
    id: 2,
    slug: "artificial-intelligence-cancer-diagnosis",
    title:
      "AI Diagnoses Tumors with Precision Exceeding Doctors: Study Changes Everything",
    excerpt:
      "Research published in Nature Medicine shows that new artificial intelligence models surpass the diagnostic accuracy of oncologists in 12 types of cancer.",
    content: `An international consortium of researchers has published results from a multi-year study that could redefine the future of oncology medicine. The artificial intelligence system developed jointly by three European universities demonstrated diagnostic accuracy of 94.7% in early detection of 12 tumor types, exceeding the average of specialized oncologists by 12%.

The study, conducted on over 180,000 patients across 23 countries, represents the largest clinical validation ever performed for an AI-based diagnostic system. The model simultaneously analyzes imaging data, blood biomarkers, and genetic factors to produce an integrated risk assessment.

"This is not about replacing doctors, but equipping them with a tool that amplifies their capabilities," explained Professor Andrea Conti, study coordinator. "AI is particularly effective in borderline cases, where human diagnosis is more uncertain."`,
    category: "Technology",
    categoryColor: "#2980B9",
    author: "Giulia Marchetti",
    authorRole: "Science & Technology Editor",
    date: "March 3, 2026",
    readTime: 6,
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663399083273/3dAGBac6MGitvNrWVvmyAK/bishouy-hero-tech-84qN2YaQfKXA65us9qtHUm.webp",
    featured: true,
    tags: ["Artificial Intelligence", "Medicine", "Research", "Oncology"],
  },
  {
    id: 3,
    slug: "financial-markets-record-volatility",
    title:
      "Financial Markets: Record Volatility, Fund Managers Take Defensive Measures",
    excerpt:
      "The VIX index reached three-year highs as major stock markets register daily swings exceeding 3%.",
    content: `Global financial markets are experiencing exceptional volatility, with the fear index VIX touching 38 — the highest level since 2023 — and major stock exchanges registering daily swings exceeding 3%.

Behind the turbulence lies a combination of factors: uncertainty about monetary policies from major central banks, geopolitical tensions in various regions, and mixed macroeconomic data from advanced economies.

Institutional fund managers are adopting defensive strategies, increasing cash positions in portfolios and reducing exposure to riskier assets. According to a Bank of America survey, 67% of fund managers have reduced their equity overweight in the past two weeks.`,
    category: "Economy",
    categoryColor: "#27AE60",
    author: "Luca Bianchi",
    authorRole: "Financial Analyst",
    date: "March 2, 2026",
    readTime: 4,
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663399083273/3dAGBac6MGitvNrWVvmyAK/bishouy-hero-economy-W5ThKktzEpiMxWv3GgWEet.webp",
    featured: true,
    tags: ["Finance", "Markets", "Economy", "Investments"],
  },
  {
    id: 4,
    slug: "venice-film-festival-cinema-awards",
    title: "Venice Film Festival: Cinema from the Global South Triumphs",
    excerpt:
      "The Golden Lion goes to a Colombian film telling the story of an indigenous community. The jury rewards diversity and narrative authenticity.",
    content: `The 83rd Venice International Film Festival concluded with an awards ceremony marking a historic turning point: for the first time, the Golden Lion went to a film entirely produced in Colombia, "Tierra Roja" by Camila Restrepo, a work depicting the resistance of an Amazonian indigenous community against natural resource exploitation.

The jury, chaired by French director Claire Denis, justified the choice by highlighting "the extraordinary visual power and emotional depth of a film that speaks to the universal through the particular." The film, shot in Uitoto language with non-professional actors, received a twelve-minute standing ovation during its premiere.`,
    category: "Culture",
    categoryColor: "#8E44AD",
    author: "Sofia Romano",
    authorRole: "Film Critic",
    date: "March 2, 2026",
    readTime: 4,
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663399083273/3dAGBac6MGitvNrWVvmyAK/bishouy-hero-culture-GQHAvUwFQRKWd5UgrsBmXZ.webp",
    featured: false,
    tags: ["Cinema", "Venice", "Culture", "Arts"],
  },
  {
    id: 5,
    slug: "government-tax-reform-40-billion",
    title: "Tax Reform: Government Presents 40-Billion-Euro Plan",
    excerpt:
      "The Economy Minister outlines details of the plan providing income tax reduction for middle-income earners and introducing flat tax for businesses.",
    content: `The government presented today in the Council of Ministers the most ambitious tax reform plan in the past twenty years. The package, worth a total of 40 billion euros distributed over three years, includes significant income tax reduction for earners between 28,000 and 55,000 euros annually, introduction of a 15% flat tax for businesses with turnover up to 5 million euros, and enhanced deductions for families with children.

"This plan represents the greatest fiscal redistribution in republican history," declared the Economy Minister during the press conference. "Our goal is to restore purchasing power to the middle class and stimulate investment from small and medium enterprises."`,
    category: "Politics",
    categoryColor: "#C0392B",
    author: "Antonio Esposito",
    authorRole: "Parliamentary Correspondent",
    date: "March 1, 2026",
    readTime: 5,
    image:
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    featured: false,
    tags: ["Tax", "Government", "Economy", "Politics"],
  },
  {
    id: 6,
    slug: "champions-league-semifinals-benfica",
    title:
      "Champions League: Four Semifinalists Confirmed. Benfica Surprise, Bayern Out",
    excerpt:
      "Benfica eliminates Bayern Munich on penalties in a historic night for Portuguese football. Real Madrid, PSG, and Inter complete the picture.",
    content: `An unforgettable night of football has determined the four Champions League semifinalists. The most striking result comes from Lisbon, where Benfica eliminated Bayern Munich on penalties after an extraordinary match that ended 2-2 after extra time.

Portuguese goalkeeper Diogo Costa was the absolute protagonist, saving three penalties in the final sequence and sparking celebrations across an entire nation. "It's the most beautiful night of my career," declared Benfica's captain at the final whistle.

The other three semifinalists are Real Madrid, who convincingly beat Manchester City 3-1, Paris Saint-Germain, who won 2-0 against Atlético Madrid, and Inter, who eliminated Borussia Dortmund thanks to a Lautaro Martínez brace.`,
    category: "Sports",
    categoryColor: "#E67E22",
    author: "Roberto Conti",
    authorRole: "Sports Editor",
    date: "March 1, 2026",
    readTime: 3,
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    featured: false,
    tags: ["Champions League", "Football", "Sports", "Benfica"],
  },
  {
    id: 7,
    slug: "italian-startup-becomes-unicorn",
    title:
      "Italian Startup Becomes Unicorn: 1.2 Billion Valuation for Milan Fintech",
    excerpt:
      "Payflow, the Milan-based startup specializing in B2B payments, reaches 1.2 billion dollar valuation after Series C funding round.",
    content: `Italy's startup ecosystem celebrates its new unicorn. Payflow, the Milan-based fintech founded in 2020 by three former Google engineers, completed a Series C funding round of 180 million dollars that brings its valuation to 1.2 billion dollars.

The company, specializing in B2B payment solutions for small and medium-sized European enterprises, registered 340% revenue growth in the past year, reaching 45 million euros in annual recurring revenue. The platform now serves over 12,000 client companies across 8 European countries.

"We started with the idea of solving a problem we knew well: Italian SMEs lose an average of 40 days per year managing payments," explained CEO Alessandro Ricci. "Today that solution works across all of Europe."`,
    category: "Economy",
    categoryColor: "#27AE60",
    author: "Valentina Costa",
    authorRole: "Economy & Innovation Editor",
    date: "February 28, 2026",
    readTime: 4,
    image:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
    featured: false,
    tags: ["Startup", "Fintech", "Innovation", "Italy"],
  },
  {
    id: 8,
    slug: "arctic-ice-reaches-historic-minimum",
    title:
      "Arctic: Sea Ice Reaches Historic Minimum. Scientists Sound the Alarm",
    excerpt:
      "Satellite measurements confirm that Arctic sea ice extent has reached the lowest level ever recorded, with unpredictable consequences for global climate.",
    content: `Latest satellite measurements from the European Space Agency confirm alarming news: Arctic sea ice extent has reached the absolute historic minimum since systematic measurements began in 1979. The ice-covered surface has shrunk by 38% compared to average levels from the 1980s.

"We are witnessing a change in the climate system occurring at unprecedented speed in recent geological history," declared Dr. Elena Marchetti, glaciologist at the University of Bologna and member of the research team. "The implications for ocean currents, precipitation patterns, and sea level rise are still partially unpredictable."`,
    category: "World",
    categoryColor: "#E8A020",
    author: "Francesco Lombardi",
    authorRole: "Environment & Science Editor",
    date: "February 28, 2026",
    readTime: 5,
    image:
      "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=80",
    featured: false,
    tags: ["Climate", "Arctic", "Environment", "Science"],
  },
];

export const BREAKING_NEWS = [
  "BREAKING: 6.2 Magnitude Earthquake Strikes Japan's Western Coast",
  "FLASH: Federal Reserve Holds Rates Steady, Markets Rally",
  "URGENT: Peace Agreement Signed Between Conflicting Factions in the Sahel",
  "NEWS: European Parliament Approves New Digital Privacy Directive",
  "UPDATE: Artemis IV Space Mission Successfully Docks with Lunar Station",
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find(a => a.slug === slug);
}

export function getArticlesByCategory(category: string): Article[] {
  return ARTICLES.filter(
    a => a.category.toLowerCase() === category.toLowerCase()
  );
}

export function getFeaturedArticles(): Article[] {
  return ARTICLES.filter(a => a.featured);
}

export function getLatestArticles(count: number = 6): Article[] {
  return ARTICLES.slice(0, count);
}
