import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function LiveAnalyticsTracker() {
    const [location] = useLocation();
    const heartbeatMutation = trpc.analytics.heartbeat.useMutation();

    useEffect(() => {
        // Generate or retrieve a persistent session ID for this browser
        let sessionId = localStorage.getItem("visitor_session_id");
        if (!sessionId) {
            sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem("visitor_session_id", sessionId);
        }

        const currentSessionId = sessionId;

        const sendHeartbeat = () => {
            try {
                heartbeatMutation.mutate({
                    sessionId: currentSessionId,
                    currentPath: window.location.pathname,
                });
            } catch (e) {
                // Silent fail for analytics
            }
        };

        // Send immediate heartbeat on mount or path change
        sendHeartbeat();

        // Set up interval for background heartbeat
        const interval = setInterval(sendHeartbeat, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, [location]);

    return null;
}
