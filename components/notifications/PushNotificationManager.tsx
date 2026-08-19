"use client";

import { useEffect, useRef } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const initialized = useRef(false);

  useEffect(() => {
    const setupNotifications = async () => {
      if (initialized.current) return;
      
      try {
        if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
          if (Notification.permission === "granted") {
            initialized.current = true;
            await registerSubscription();
          }
        }
      } catch (error) {
        console.error("Error checking notifications:", error);
      }
    };

    const registerSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (!publicVapidKey) {
            console.error("VAPID public key not found");
            return;
          }
          
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          });
        }

        if (subscription) {
          await fetch("/api/notifications/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscription }),
          }).catch(console.error);
        }
      } catch (e) {
        console.error("Failed to register push subscription", e);
      }
    };

    const handleUserInteraction = async () => {
      if (initialized.current) return;
      
      if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
        if (Notification.permission !== "denied" && Notification.permission !== "granted") {
          try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
              initialized.current = true;
              await registerSubscription();
            }
          } catch (e) {
            console.error("Permission request failed", e);
          }
        }
      }
      
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("scroll", handleUserInteraction);
    };

    setupNotifications();

    document.addEventListener("click", handleUserInteraction, { once: true });
    document.addEventListener("scroll", handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("scroll", handleUserInteraction);
    };
  }, []);

  return null;
}
