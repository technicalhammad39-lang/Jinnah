"use client";

import { useEffect } from "react";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { app } from "@/lib/firebase";

export default function PushNotificationManager() {
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        if (typeof window !== "undefined" && "Notification" in window) {
          const supported = await isSupported();
          if (!supported) return;

          // Request permission
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            console.log("Notification permission not granted.");
            return;
          }

          const messaging = getMessaging(app);
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });

          if (currentToken) {
            // Send token to our server to subscribe to the "all" topic
            await fetch("/api/notifications/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: currentToken }),
            });
          }
        }
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    // Give it a small delay so we don't spam the user immediately on page load
    const timer = setTimeout(setupNotifications, 5000);
    return () => clearTimeout(timer);
  }, []);

  return null; // This is a background component, renders nothing
}
