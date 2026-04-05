import webpush from "web-push";
import { ENV } from "./_core/env";

// Initialize web-push VAPID keys.
// If VAPID keys are not set in env, generate and log them once, then set them.
if (ENV.vapidPublicKey && ENV.vapidPrivateKey) {
  webpush.setVapidDetails(
    `mailto:${ENV.vapidEmail || "admin@bishouy.com"}`,
    ENV.vapidPublicKey,
    ENV.vapidPrivateKey
  );
} else {
  console.warn("[WebPush] VAPID keys not set. Push notifications will not work.");
  console.warn("[WebPush] Generate keys with: node -e \"const w=require('web-push'); const k=w.generateVAPIDKeys(); console.log('VAPID_PUBLIC_KEY='+k.publicKey); console.log('VAPID_PRIVATE_KEY='+k.privateKey);\"");
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

/**
 * Send a Push Notification to a single subscription.
 */
export async function sendPushNotification(
  subscriptionJson: string,
  payload: PushPayload
): Promise<void> {
  if (!ENV.vapidPublicKey || !ENV.vapidPrivateKey) {
    console.warn("[WebPush] Cannot send push: VAPID keys not configured.");
    return;
  }

  try {
    const subscription = JSON.parse(subscriptionJson) as webpush.PushSubscription;
    const payloadStr = JSON.stringify(payload);

    await webpush.sendNotification(subscription, payloadStr, {
      TTL: 3600, // 1 hour
      urgency: "high",
    });
    console.log("[WebPush] Notification sent successfully.");
  } catch (err: any) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      // Subscription is gone, caller should remove it from db
      throw new Error("SUBSCRIPTION_EXPIRED");
    }
    console.error("[WebPush] Error sending notification:", err.message);
    throw err;
  }
}

/**
 * Broadcast a Breaking News push to all subscribed users.
 * Returns number of successes.
 */
export async function broadcastBreakingNewsPush(
  subscriptions: { userId: number; pushSubscription: string }[],
  payload: PushPayload
): Promise<number> {
  let successCount = 0;
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub.pushSubscription, payload))
  );
  results.forEach((r) => {
    if (r.status === "fulfilled") successCount++;
  });
  return successCount;
}
