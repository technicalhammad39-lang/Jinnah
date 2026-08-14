"use client";

import { useEffect, useRef } from "react";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { app } from "@/lib/firebase";

export default function PushNotificationManager() {
  const initialized = useRef(false);

  useEffect(() => {
    const setupNotifications = async () => {
      if (initialized.current) return;
      
      try {
        if (typeof window !== "undefined" && "Notification" in window) {
          const supported = await isSupported();
          if (!supported) return;

          // Check if already granted, otherwise we must wait for user gesture
          if (Notification.permission === "granted") {
            initialized.current = true;
            await registerToken();
          }
        }
      } catch (error) {
        console.error("Error checking notifications:", error);
      }
    };

    const registerToken = async () => {
      try {
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
          }).catch(console.error);
        }
      } catch (e) {
        console.error("Failed to register token", e);
      }
    };

    const handleUserInteraction = async () => {
      if (initialized.current) return;
      
      if (typeof window !== "undefined" && "Notification" in window) {
        const supported = await isSupported();
        if (supported && Notification.permission !== "denied" && Notification.permission !== "granted") {
          try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
              initialized.current = true;
              await registerToken();
            }
          } catch (e) {
            console.error("Permission request failed", e);
          }
        }
      }
      
      // Remove listeners after first interaction
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("scroll", handleUserInteraction);
    };

    setupNotifications();

    // Attach to user interactions to trigger permission request
    document.addEventListener("click", handleUserInteraction, { once: true });
    document.addEventListener("scroll", handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("scroll", handleUserInteraction);
    };
  }, []);

  return null;
}
