import { router } from "../_core/trpc";
import { authRouter } from "./auth.router";
import { usersRouter } from "./users.router";
import { articlesRouter } from "./articles.router";
import { systemRouter } from "./system.router";
import { socialRouter } from "./social.router";
import { likesRouter } from "./likes.router";
import { extraRouter } from "./extra.router";
import { analyticsRouter } from "./analytics.router";
import { stripeRouter } from "./stripe.router";
import { pushRouter } from "./push.router";

export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  articles: articlesRouter,
  system: systemRouter,
  social: socialRouter,
  likes: likesRouter,
  analytics: analyticsRouter,
  stripe: stripeRouter,
  push: pushRouter,
  notifications: extraRouter.notifications,
  bookmarks: extraRouter.bookmarks,
  comments: extraRouter.comments,
  ads: extraRouter.ads,
  advertisements: extraRouter.ads,
  newsletter: extraRouter.newsletter,
  ai: extraRouter.ai,
  settings: extraRouter.settings,
  security: extraRouter.security,
});

export type AppRouter = typeof appRouter;
