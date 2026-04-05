// Service Worker for Bishouy Breaking News Push Notifications
// Placed at /public/sw.js for root scope

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: "BISHOUY — Breaking News",
      body: event.data.text(),
      url: "/",
    };
  }

  const options = {
    body: payload.body || "New breaking news from Bishouy.",
    icon: payload.icon || "/og-image.jpg",
    badge: "/og-image.jpg",
    tag: payload.tag || "bishouy-breaking",
    renotify: true,
    requireInteraction: false,
    data: { url: payload.url || "/" },
    actions: [
      { action: "read", title: "Read Now" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || "BISHOUY — Breaking", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
