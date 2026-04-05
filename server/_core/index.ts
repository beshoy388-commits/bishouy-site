import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import compression from "compression";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import multer from "multer";
import { storagePut } from "../storage";
import {
  cleanupExpiredVerificationCodes,
  cleanupExpiredResetTokens,
} from "../db";
import { syncRSSFeeds } from "../rss";
import { sendDailyNewsletter } from "../newsletter_job";
import { ipBlacklistMiddleware } from "../security";
import cron from "node-cron";
import { ENV } from "./env";

// Global SEO Helpers
const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return c;
    }
  });
};
const getBaseUrl = () => ENV.appUrl.endsWith("/") ? ENV.appUrl.slice(0, -1) : ENV.appUrl;

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Security headers (helmet) — Optimized for performance and Best Practices audit
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "script-src": [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://apis.google.com",
            "https://*.googlesyndication.com",
            "https://*.google.com",
            "https://*.doubleclick.net",
            "https://*.googletagmanager.com",
            "https://fundingchoicesmessages.google.com",
            "https://js.stripe.com",
          ],
          "script-src-attr": ["'unsafe-inline'"],
          "connect-src": [
            "'self'",
            "http://localhost:*",
            "http://127.0.0.1:*",
            "ws://localhost:*",
            "ws://127.0.0.1:*",
            "https://api.openrouter.ai",
            "https://pollinations.ai",
            "https://*.pollinations.ai",
            "https://*.googlesyndication.com",
            "https://*.google.com",
            "https://*.doubleclick.net",
            "https://*.render.com",
            "https://vitals.vercel-insights.com",
            "https://www.googletagmanager.com",
            "https://*.google-analytics.com",
            "https://*.analytics.google.com",
            "https://*.googletagmanager.com",
            "https://api.stripe.com",
          ],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "https://*",
            "http://*",
            "https://www.google-analytics.com",
            "https://www.googletagmanager.com",
          ],
          "style-src": [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          "font-src": ["'self'", "https://fonts.gstatic.com"],
          "frame-src": [
            "'self'",
            "https://*.google.com",
            "https://*.doubleclick.net",
            "https://*.googlesyndication.com",
            "https://js.stripe.com",
            "https://hooks.stripe.com",
          ],
          ...(ENV.isProduction ? { "upgrade-insecure-requests": [] } : {}),
        },
      },
      crossOriginEmbedderPolicy: false, // allows embeds (images, iframes)
      hsts: ENV.isProduction ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      } : false,
    })
  );

  // CORS - Crucial for Safari local development and cross-origin preflights
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const host = req.headers.host;
    
    // Only apply CORS if there is an origin and it's not the same as the host
    if (origin) {
      const isAllowed = origin.includes("localhost") || origin.includes("127.0.0.1") || origin === ENV.appUrl;
      
      if (isAllowed) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Credentials", "true");
      } else if (process.env.NODE_ENV !== "production") {
        // In dev, be more permissive if needed, but avoid * with credentials
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Credentials", "true");
      }
      
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS,PATCH");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With, trpc-batch-mode, x-trpc-source");
      
      // Handle Preflight
      if (req.method === "OPTIONS") {
        return res.status(200).end();
      }
    }
    
    next();
  });

  // Gzip compression — reduces bandwidth by ~60-80%
  app.use(compression());

  // Static assets caching (1 month for JS, CSS, fonts, images)
  app.use((req, res, next) => {
    if (req.url.match(/\.(js|css|woff2?|png|jpg|jpeg|gif|svg|ico|webp)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    }
    next();
  });

  // Global IP Blacklist Protection
  app.use(ipBlacklistMiddleware);
  
  // Stripe Webhook (MUST be before general JSON body parser)
  app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
    const signature = req.headers["stripe-signature"] as string;
    let event;

    const { stripe } = await import("./stripe");

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        ENV.stripeWebhookSecret
      );
    } catch (err: any) {
      console.error(`[Stripe Webhook] Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const { updateUser, getUserById, getUserByStripeCustomerId } = await import("../db");

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as any;
          const userId = parseInt(session.metadata.userId);
          const tier = session.metadata.tier as "premium" | "founder";
          
          // Get priceId from line_items if possible, or use defaults
          let priceId = "";
          try {
            const items = await stripe.checkout.sessions.listLineItems(session.id);
            priceId = items.data[0]?.price?.id || "";
          } catch (e) {
            priceId = tier === "premium" ? ENV.stripePriceIdPremium : ENV.stripePriceIdFounder;
          }
          
          await updateUser(userId, {
            subscriptionTier: tier,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            stripePriceId: priceId,
            subscriptionStatus: "active",
          });
          console.log(`[Stripe Webhook] Checkout completed for user ${userId} (Tier: ${tier})`);
          break;
        }
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as any;
          const user = await getUserByStripeCustomerId(subscription.customer);
          if (user) {
            const status = subscription.status;
            let tier: "free" | "premium" | "founder" = "free";
            const priceId = subscription.items?.data?.[0]?.price?.id || "";
            
            if (status === "active" || status === "trialing") {
               const { ENV } = await import("./env");
               if (priceId === ENV.stripePriceIdPremium) {
                 tier = "premium";
               } else if (priceId === ENV.stripePriceIdFounder) {
                 tier = "founder";
               } else {
                 tier = "premium"; // Default to premium fallback
               }
            } else if (status === "past_due") {
               // Optional: keep tier for 'past_due' or set to 'free' (currently free for safety)
               tier = "free";
            } else {
               tier = "free";
            }
            
            await updateUser(user.id, {
              subscriptionStatus: status,
              subscriptionTier: tier,
              stripeSubscriptionId: subscription.id,
              stripePriceId: priceId,
            });
            console.log(`[Stripe Webhook] Subscription ${event.type.split('.').pop()} for user ${user.id}: ${status} (Tier: ${tier})`);
          }
          break;
        }
        case "invoice.payment_failed": {
          const invoice = event.data.object as any;
          const user = await getUserByStripeCustomerId(invoice.customer);
          if (user) {
             await updateUser(user.id, {
               subscriptionStatus: "past_due",
               subscriptionTier: "free" // Lockdown on failure
             });
             console.log(`[Stripe Webhook] Payment failed for user ${user.id}. Access restricted.`);
          }
          break;
        }
      }
      res.json({ received: true });
    } catch (err) {
      console.error(`[Stripe Webhook] Database Error:`, err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Apple Pay Domain Verification
  app.get("/.well-known/apple-developer-merchantid-domain-association", (req, res) => {
    const filePath = path.join(process.cwd(), "apple-developer-merchantid-domain-association");
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("Verification file not found. Please upload it to the server root.");
    }
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // SEO: 301 Redirect from old Italian URLs to English
  app.get("/articolo/:slug", (req, res) => {
    const { slug } = req.params;
    res.redirect(301, `/article/${slug}`);
  });

  // Global SEO: Normalize URLs by removing trailing slashes (Point 17)
  app.use((req, res, next) => {
    if (req.path.length > 1 && req.path.endsWith('/')) {
        const query = req.url.slice(req.path.length);
        const safePath = req.path.slice(0, -1);
        res.redirect(301, safePath + query);
    } else {
        next();
    }
  });

  // SEO: 301 Redirect for legacy date-based Blogger URLs (/2024/09/article-title)
  // These often appear in Google Index during platform transitions.
  app.get("/:year([0-9]{4})/:month([0-9]{2})/:slug", (req, res) => {
    const { slug } = req.params;
    // Remove trailing .html if present (common in Blogger)
    const cleanSlug = slug.replace(/\.html$/, '');
    res.redirect(301, `/article/${cleanSlug}`);
  });

  // One-click newsletter unsubscribe endpoint
  app.get("/api/unsubscribe", async (req, res) => {
    const token = req.query.token as string;
    if (!token) {
      return res.redirect("/?unsubscribe=invalid");
    }
    try {
      const { unsubscribeByToken } = await import("../db");
      const success = await unsubscribeByToken(token);
      if (success) {
        return res.redirect("/unsubscribe?status=success");
      } else {
        return res.redirect("/unsubscribe?status=notfound");
      }
    } catch (err) {
      console.error("[Unsubscribe] Error:", err);
      return res.redirect("/unsubscribe?status=error");
    }
  });

  // File upload endpoint
  const upload = multer({ storage: multer.memoryStorage() });
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({ error: "Only image files are allowed" });
      }

      if (req.file.size > 5 * 1024 * 1024) {
        return res
          .status(400)
          .json({ error: "File size must be less than 5MB" });
      }

      const width = parseInt(req.query.width as string) || 1200;
      const height = parseInt(req.query.height as string) || 800;
      const fit = (req.query.fit as "cover" | "contain" | "fill" | "inside" | "outside") || "inside";

      // Compress and optimize the image before saving it
      const compressedBuffer = await sharp(req.file.buffer)
        .rotate()
        .resize(width, height, {
          fit,
          withoutEnlargement: true,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp({ quality: 80 })
        .toBuffer();

      const b64 = compressedBuffer.toString("base64");
      const url = `data:image/webp;base64,${b64}`;

      res.json({
        url,
        filename: req.file.originalname,
        format: "webp",
        size: compressedBuffer.length,
        dimensions: { width, height }
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // SEO: Standard RSS Feed (Point 3 & 17)
  app.get("/api/rss", async (req, res) => {
    try {
      const { getAllArticles } = await import("../db");
      const articles = await getAllArticles(false, undefined, 40); // Standard feed: latest 40
      const baseUrl = ENV.appUrl.endsWith("/") ? ENV.appUrl.slice(0, -1) : ENV.appUrl;

      let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>BISHOUY — News Intelligence</title>
    <link>${baseUrl}</link>
    <description>Premium Analytical News Ecosystem</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`;

      for (const article of articles) {
        const url = `${baseUrl}/article/${article.slug}`;
        rss += `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(article.createdAt || new Date()).toUTCString()}</pubDate>
      <description><![CDATA[${article.excerpt}]]></description>
    </item>`;
      }
      rss += `\n  </channel>\n</rss>`;
      res.header("Content-Type", "application/xml");
      res.send(rss);
    } catch (err) {
      res.status(500).send("RSS generation failure");
    }
  });

  // SEO: Google News RSS Feed
  app.get("/feed/google-news", async (req, res) => {
    try {
      const { getAllArticles } = await import("../db");
      const articles = await getAllArticles(false, undefined, 20); // Get latest 20 published articles
      const baseUrl = ENV.appUrl.endsWith("/")
        ? ENV.appUrl.slice(0, -1)
        : ENV.appUrl;

      let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Bishouy</title>
    <link>${baseUrl}</link>
    <description>Premium AI-Driven Global News &amp; Culture</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`;

      for (const article of articles) {
        const articleUrl = `${baseUrl}/article/${article.slug}`;
        const pubDate = new Date(article.createdAt || new Date()).toUTCString();
        
        // Ensure image URL is absolute and not a data URI
        let imageUrl = "";
        if (article.image && !article.image.startsWith('data:')) {
          imageUrl = article.image.startsWith('http') ? article.image : `${baseUrl}${article.image.startsWith('/') ? '' : '/'}${article.image}`;
        }

        rss += `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator><![CDATA[${article.author}]]></dc:creator>
      <description><![CDATA[${article.excerpt}]]></description>
      <content:encoded><![CDATA[${article.content}]]></content:encoded>
      ${imageUrl ? `<media:content url="${imageUrl}" medium="image" />` : ""}
    </item>`;
      }

      rss += `
  </channel>
</rss>`;

      res.header("Content-Type", "application/xml");
      res.send(rss);
    } catch (err) {
      console.error("[RSS Feed] Generation failed:", err);
      res.status(500).send("Error generating RSS feed");
    }
  });

  // SEO: Dynamic Sitemap Generation (Standard)
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const { getAllArticles } = await import("../db");
      const articles = await getAllArticles(false); // only published
      const baseUrl = getBaseUrl();

      // Helper to generate a valid, non-data URI image URL for SEO
      const getSitemapImageUrl = (img: string | null | undefined) => {
        if (!img || img.startsWith('data:')) return null;
        if (img.startsWith('http')) return escapeXml(img);
        const cleanPath = img.startsWith('/') ? img : `/${img}`;
        return escapeXml(`${baseUrl}${cleanPath}`);
      };

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

      // 1. Static Pages
      const staticPages = [
        { path: '/', priority: '1.0', changefreq: 'daily' },
        { path: '/about', priority: '0.5', changefreq: 'monthly' },
        { path: '/editorial-team', priority: '0.4', changefreq: 'monthly' },
        { path: '/mission-values', priority: '0.4', changefreq: 'monthly' },
        { path: '/code-of-ethics', priority: '0.4', changefreq: 'monthly' },
        { path: '/fact-checking', priority: '0.4', changefreq: 'monthly' },
        { path: '/contact', priority: '0.4', changefreq: 'monthly' },
        { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
        { path: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
      ];

      for (const page of staticPages) {
        xml += `
  <url>
    <loc>${escapeXml(baseUrl + (page.path === '/' ? '' : page.path))}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
      }

      // 2. Categories
      const categories = ["world", "politics", "economy", "technology", "culture", "sports"];
      for (const cat of categories) {
        xml += `
  <url>
    <loc>${escapeXml(`${baseUrl}/category/${cat}`)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
      }

      // 3. Articles
      for (const article of articles) {
        const lastMod = (article.updatedAt || article.createdAt || new Date()).toISOString().split("T")[0];
        const imageUrl = getSitemapImageUrl(article.image);
        
        xml += `
  <url>
    <loc>${escapeXml(`${baseUrl}/article/${article.slug}`)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    ${imageUrl ? `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title><![CDATA[${article.title}]]></image:title>
    </image:image>` : ''}
  </url>`;
      }

      xml += `\n</urlset>`;

      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (err) {
      console.error("[Sitemap] Generation failed:", err);
      res.status(500).send("Error generating sitemap");
    }
  });

  // SEO: Google News Sitemap (Specific format for fast indexing)
  app.get("/sitemap-news.xml", async (req, res) => {
    try {
      const { getAllArticles } = await import("../db");
      // Google News requires articles from the last 2 days
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const allArticles = await getAllArticles(false);
      const newsArticles = allArticles.filter(a => {
        const pubDate = new Date(a.publishedAt || a.createdAt);
        return pubDate >= twoDaysAgo;
      });

      const baseUrl = getBaseUrl();
      const siteName = "BISHOUY";

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

      for (const article of newsArticles) {
        const pubDate = (article.publishedAt || article.createdAt || new Date()).toISOString();
        xml += `
  <url>
    <loc>${escapeXml(`${baseUrl}/article/${article.slug}`)}</loc>
    <news:news>
      <news:publication>
        <news:name><![CDATA[${siteName}]]></news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title><![CDATA[${article.title}]]></news:title>
    </news:news>
  </url>`;
      }

      xml += `\n</urlset>`;

      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (err) {
      console.error("[News Sitemap] Generation failed:", err);
      res.status(500).send("Error generating news sitemap");
    }
  });

  // SEO: Robots.txt
  app.get("/robots.txt", (req, res) => {
    const baseUrl = ENV.appUrl.endsWith("/")
      ? ENV.appUrl.slice(0, -1)
      : ENV.appUrl;
    const robots = `User-agent: *
Allow: /
Allow: /api/rss
Allow: /api/trpc/articles.getBySlug
Allow: /feed/google-news
Disallow: /login
Disallow: /register
Disallow: /admin/
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-news.xml`;
    res.header("Content-Type", "text/plain");
    res.send(robots);
  });

  // Admin catch-all for SPA routing (Point 13)
  app.get("/admin/*", (req, res, next) => {
    if (req.url.startsWith('/admin') && !req.url.includes('.')) {
        res.sendFile(path.resolve(import.meta.dirname, "../../client/dist/index.html"));
    } else {
        next();
    }
  });

  // System Keep-Alive (Point 20: Mitigation for Render free tier sleep)
  app.get("/api/health-check", (req, res) => {
    res.json({ status: "operational", timestamp: new Date().toISOString() });
  });

  // SEO: ads.txt
  app.get("/ads.txt", (req, res) => {
    const adsTxtPath = path.resolve(import.meta.dirname, "../..", "client", "public", "ads.txt");
    if (fs.existsSync(adsTxtPath)) {
      res.header("Content-Type", "text/plain");
      return res.sendFile(adsTxtPath);
    }
    // Fallback if not in client/public (e.g. production build path)
    const prodAdsPath = path.resolve(import.meta.dirname, "public", "ads.txt");
    if (fs.existsSync(prodAdsPath)) {
      res.header("Content-Type", "text/plain");
      return res.sendFile(prodAdsPath);
    }
    res.status(404).send("ads.txt not found");
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

// Run cleanups on startup
cleanupExpiredVerificationCodes();
cleanupExpiredResetTokens();

// Set up background intervals
// Database cleanups: every 1 hour
setInterval(
  () => {
    cleanupExpiredVerificationCodes();
    cleanupExpiredResetTokens();
  },
  60 * 60 * 1000
);

// High-Precision Daily Newsletter (Every morning at 7:00 AM)
// Schedule: 0 7 * * * (Minutes, Hours, Day of Month, Month, Day of Week)
cron.schedule("0 7 * * *", () => {
  console.log("[CRON] Executing scheduled Editorial Briefing at 7:00 AM...");
  sendDailyNewsletter().catch(err => {
    console.error("[CRON] Newsletter Error:", err);
  });
});

// FULL AUTONOMOUS MODE ACTIVATED: Background News Research & Synthesis
// Runs every 6 hours to ensure freshest content across all intelligence segments.
cron.schedule("0 */6 * * *", () => {
  console.log("[CRON] Autonomous News Research Cycle Initiated...");
  syncRSSFeeds().catch(err => {
    console.error("[CRON] RSS Sync Error:", err);
  });
});

// Production Startup Check: If we deploy/restart between 6 AM and 8:30 AM 
// and no newsletter was sent today, consider sending it.
if (process.env.NODE_ENV === "production") {
  const currentHour = new Date().getHours();
  if (currentHour >= 6 && currentHour <= 8) {
    console.log("[Startup] Detected morning startup. Initiating Editorial Briefing...");
    sendDailyNewsletter().catch(console.error);
  }
}
