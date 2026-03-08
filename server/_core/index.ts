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
import cron from "node-cron";
import { ENV } from "./env";

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
            "https://pagead2.googlesyndication.com",
            "https://adservice.google.com",
          ],
          "connect-src": [
            "'self'",
            "https://api.openrouter.ai",
            "https://pollinations.ai",
            "https://*.pollinations.ai",
            "https://loremflickr.com",
            "https://*.loremflickr.com",
            "wss://*.render.com",
            "https://*.render.com",
            "https://vitals.vercel-insights.com",
            "https://pagead2.googlesyndication.com",
            "https://googleads.g.doubleclick.net",
          ],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "https://*",
            "http://*",
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
            "https://googleads.g.doubleclick.net",
            "https://tpc.googlesyndication.com",
          ],
          "upgrade-insecure-requests": [],
        },
      },
      crossOriginEmbedderPolicy: false, // allows embeds (images, iframes)
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // Gzip compression — reduces bandwidth by ~60-80%
  app.use(compression());

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
  // SEO: Dynamic Sitemap Generation
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const { getAllArticles } = await import("../db");
      const articles = await getAllArticles(false); // only published
      const baseUrl = ENV.appUrl.endsWith("/")
        ? ENV.appUrl.slice(0, -1)
        : ENV.appUrl;

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms-of-service</loc>
    <priority>0.3</priority>
  </url>`;

      for (const article of articles) {
        xml += `
  <url>
    <loc>${baseUrl}/article/${article.slug}</loc>
    <lastmod>${article.updatedAt.toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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

  // SEO: Robots.txt
  app.get("/robots.txt", (req, res) => {
    const baseUrl = ENV.appUrl.endsWith("/")
      ? ENV.appUrl.slice(0, -1)
      : ENV.appUrl;
    const robots = `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml`;
    res.header("Content-Type", "text/plain");
    res.send(robots);
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

// CRITICAL: BACKGROUND SYNC DISABLED AS PER USER REQUEST
// ONLY MANUAL SYNC VIA ADMIN CONSOLE IS ALLOWED
// cron.schedule("0 */2 * * *", () => {
//   console.log("[CRON] Initiating Autonomous Editorial Cycle...");
//   syncRSSFeeds().catch(err => {
//     console.error("[CRON] RSS Sync Error:", err);
//   });
// });

// Production Startup Check: If we deploy/restart between 6 AM and 8:30 AM 
// and no newsletter was sent today, consider sending it.
if (process.env.NODE_ENV === "production") {
  const currentHour = new Date().getHours();
  if (currentHour >= 6 && currentHour <= 8) {
    console.log("[Startup] Detected morning startup. Initiating Editorial Briefing...");
    sendDailyNewsletter().catch(console.error);
  }
}
