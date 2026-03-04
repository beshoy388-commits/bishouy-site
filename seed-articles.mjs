import { drizzle } from "drizzle-orm/libsql";
import { articles } from "./drizzle/schema.ts";
import { createClient } from "@libsql/client";

const DATABASE_URL = process.env.DATABASE_URL;

const articlesData = [
  {
    slug: "european-summit-energy-policies-2030",
    title: "European Summit: Leaders Approve Historic Energy Policies for 2030",
    excerpt: "The heads of government of the 27 EU member states have reached a historic agreement on energy policies that will reshape the continent's industrial landscape.",
    content: `European leaders gathered in Brussels have unanimously approved an unprecedented package of energy measures set to radically transform how the continent produces and consumes energy by 2030.

The agreement, the result of months of intensive negotiations, includes increasing the share of renewable energy to 45% of the total energy mix, reducing CO₂ emissions by 55% compared to 1990 levels, and public investments exceeding 800 billion euros in green infrastructure.

"This is the moment when Europe demonstrates it is equal to the challenges of our time," declared the President of the European Commission during the closing press conference. "This is not just about the environment: it's about energy sovereignty, jobs, and competitiveness."

Eastern European countries, initially more resistant, secured specific transition funds to help their economies still dependent on coal transition to more sustainable production models.`,
    category: "World",
    categoryColor: "#E8A020",
    author: "Marco Ferretti",
    authorRole: "Correspondent from Brussels",
    featured: 1,
    breaking: 1,
    readTime: 5,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663399083273/3dAGBac6MGitvNrWVvmyAK/bishouy-hero-world-YhM6ksz8FapgLsXA57BfrG.webp",
    tags: JSON.stringify(["Europe", "Energy", "Climate", "Politics"]),
    publishedAt: new Date(),
  },
  {
    slug: "artificial-intelligence-cancer-diagnosis",
    title: "AI Diagnoses Tumors with Precision Exceeding Doctors: Study Changes Everything",
    excerpt: "Research published in Nature Medicine shows that new artificial intelligence models surpass the diagnostic accuracy of oncologists in 12 types of cancer.",
    content: `An international consortium of researchers has published results from a multi-year study that could redefine the future of oncology medicine. The artificial intelligence system developed jointly by three European universities demonstrated diagnostic accuracy of 94.7% in early detection of 12 tumor types, exceeding the average of specialized oncologists by 12%.

The study, conducted on over 180,000 patients across 23 countries, represents the largest clinical validation ever performed for an AI-based diagnostic system. The model simultaneously analyzes imaging data, blood biomarkers, and genetic factors to produce an integrated risk assessment.

"This is not about replacing doctors, but equipping them with a tool that amplifies their capabilities," explained Professor Andrea Conti, study coordinator. "AI is particularly effective in borderline cases, where human diagnosis is more uncertain."`,
    category: "Technology",
    categoryColor: "#2980B9",
    author: "Giulia Marchetti",
    authorRole: "Science & Technology Editor",
    featured: 1,
    breaking: 0,
    readTime: 6,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663399083273/3dAGBac6MGitvNrWVvmyAK/bishouy-hero-tech-84qN2YaQfKXA65us9qtHUm.webp",
    tags: JSON.stringify(["Artificial Intelligence", "Medicine", "Research", "Oncology"]),
    publishedAt: new Date(),
  },
  {
    slug: "financial-markets-record-volatility",
    title: "Financial Markets: Record Volatility, Fund Managers Take Defensive Measures",
    excerpt: "The VIX index reached three-year highs as major stock markets register daily swings exceeding 3%.",
    content: `Global financial markets are experiencing exceptional volatility, with the fear index VIX touching 38 — the highest level since 2023 — and major stock exchanges registering daily swings exceeding 3%.

Behind the turbulence lies a combination of factors: uncertainty about monetary policies from major central banks, geopolitical tensions in various regions, and mixed macroeconomic data from advanced economies.

Institutional fund managers are adopting defensive strategies, increasing cash positions in portfolios and reducing exposure to riskier assets. According to a Bank of America survey, 67% of fund managers have reduced their equity overweight in the past two weeks.`,
    category: "Economy",
    categoryColor: "#27AE60",
    author: "Luca Bianchi",
    authorRole: "Financial Analyst",
    featured: 1,
    breaking: 0,
    readTime: 4,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663399083273/3dAGBac6MGitvNrWVvmyAK/bishouy-hero-economy-W5ThKktzEpiMxWv3GgWEet.webp",
    tags: JSON.stringify(["Finance", "Markets", "Economy", "Investments"]),
    publishedAt: new Date(),
  },
  {
    slug: "venice-film-festival-cinema-awards",
    title: "Venice Film Festival: Cinema from the Global South Triumphs",
    excerpt: "The Golden Lion goes to a Colombian film telling the story of an indigenous community. The jury rewards diversity and narrative authenticity.",
    content: `The 83rd Venice International Film Festival concluded with an awards ceremony marking a historic turning point: for the first time, the Golden Lion went to a film entirely produced in Colombia, "Tierra Roja" by Camila Restrepo, a work depicting the resistance of an Amazonian indigenous community against natural resource exploitation.

The jury, chaired by French director Claire Denis, justified the choice by highlighting "the extraordinary visual power and emotional depth of a film that speaks to the universal through the particular." The film, shot in Uitoto language with non-professional actors, received a twelve-minute standing ovation during its premiere.`,
    category: "Culture",
    categoryColor: "#8E44AD",
    author: "Sofia Romano",
    authorRole: "Film Critic",
    featured: 0,
    breaking: 0,
    readTime: 4,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663399083273/3dAGBac6MGitvNrWVvmyAK/bishouy-hero-culture-GQHAvUwFQRKWd5UgrsBmXZ.webp",
    tags: JSON.stringify(["Cinema", "Venice", "Culture", "Arts"]),
    publishedAt: new Date(),
  },
  {
    slug: "government-tax-reform-40-billion",
    title: "Tax Reform: Government Presents 40-Billion-Euro Plan",
    excerpt: "The Economy Minister outlines details of the plan providing income tax reduction for middle-income earners and introducing flat tax for businesses.",
    content: `The government presented today in the Council of Ministers the most ambitious tax reform plan in the past twenty years. The package, worth a total of 40 billion euros distributed over three years, includes significant income tax reduction for earners between 28,000 and 55,000 euros annually, introduction of a 15% flat tax for businesses with turnover up to 5 million euros, and enhanced deductions for families with children.

"This plan represents the greatest fiscal redistribution in republican history," declared the Economy Minister during the press conference. "Our goal is to restore purchasing power to the middle class and stimulate investment from small and medium enterprises."`,
    category: "Politics",
    categoryColor: "#C0392B",
    author: "Antonio Esposito",
    authorRole: "Parliamentary Correspondent",
    featured: 0,
    breaking: 0,
    readTime: 5,
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    tags: JSON.stringify(["Tax", "Government", "Economy", "Politics"]),
    publishedAt: new Date(),
  },
  {
    slug: "champions-league-semifinals-benfica",
    title: "Champions League: Four Semifinalists Confirmed. Benfica Surprise, Bayern Out",
    excerpt: "Benfica eliminates Bayern Munich on penalties in a historic night for Portuguese football. Real Madrid, PSG, and Inter complete the picture.",
    content: `An unforgettable night of football has determined the four Champions League semifinalists. The most striking result comes from Lisbon, where Benfica eliminated Bayern Munich on penalties after an extraordinary match that ended 2-2 after extra time.

Portuguese goalkeeper Diogo Costa was the absolute protagonist, saving three penalties in the final sequence and sparking celebrations across an entire nation. "It's the most beautiful night of my career," declared Benfica's captain at the final whistle.

The other three semifinalists are Real Madrid, who convincingly beat Manchester City 3-1, Paris Saint-Germain, who won 2-0 against Atlético Madrid, and Inter, who eliminated Borussia Dortmund thanks to a Lautaro Martínez brace.`,
    category: "Sports",
    categoryColor: "#E67E22",
    author: "Roberto Conti",
    authorRole: "Sports Editor",
    featured: 0,
    breaking: 0,
    readTime: 3,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    tags: JSON.stringify(["Champions League", "Football", "Sports", "Benfica"]),
    publishedAt: new Date(),
  },
];

async function seedDatabase() {
  try {
    const dbUrl = process.env.DATABASE_URL || "file:sqlite.db";
    const authToken = process.env.DATABASE_AUTH_TOKEN;
    const client = createClient({
      url: dbUrl,
      authToken: authToken || undefined
    });
    const db = drizzle(client);

    console.log("Seeding articles...");
    for (const article of articlesData) {
      await db.insert(articles).values(article);
      console.log(`✓ Inserted: ${article.title}`);
    }

    console.log("\n✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
