import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission | "default";
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

/**
 * Hook to manage Web Push notification subscription for breaking news alerts.
 * Integrates with the server push router via tRPC.
 */
export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "default">("default");
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const { data: vapidData } = trpc.push.getVapidPublicKey.useQuery();

  const subscribeMutation = trpc.push.subscribe.useMutation({
    onSuccess: () => {
      setIsSubscribed(true);
      toast.success("Breaking News Alerts enabled", {
        description: "You'll receive instant notifications for critical events.",
      });
    },
    onError: (err) => {
      toast.error("Failed to enable alerts", { description: err.message });
    },
  });

  const unsubscribeMutation = trpc.push.unsubscribe.useMutation({
    onSuccess: () => {
      setIsSubscribed(false);
      toast.info("Breaking News Alerts disabled");
    },
    onError: (err) => {
      toast.error("Failed to disable alerts", { description: err.message });
    },
  });

  // Register Service Worker on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setIsSupported(supported);
    setPermission((Notification?.permission as NotificationPermission) ?? "default");

    if (!supported) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        setRegistration(reg);
        // Check if already subscribed
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
        });
      })
      .catch(console.error);
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from(Array.from(rawData).map((c) => c.charCodeAt(0)));
  };

  const subscribe = useCallback(async () => {
    if (!registration || !vapidData?.publicKey) {
      toast.error("Push not available", {
        description: "Service Worker or VAPID key not ready.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        toast.error("Permission denied", {
          description: "Please allow notifications in your browser settings.",
        });
        return;
      }

      const applicationServerKey = urlBase64ToUint8Array(vapidData.publicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const subJson = subscription.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      await subscribeMutation.mutateAsync({ subscription: subJson });
    } catch (err: any) {
      console.error("[Push] Subscribe error:", err);
      toast.error("Subscription failed", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [registration, vapidData, subscribeMutation]);

  const unsubscribe = useCallback(async () => {
    if (!registration) return;
    setIsLoading(true);
    try {
      const sub = await registration.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      await unsubscribeMutation.mutateAsync();
    } catch (err: any) {
      console.error("[Push] Unsubscribe error:", err);
      toast.error("Failed to unsubscribe", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [registration, unsubscribeMutation]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
  };
}
