"use client";

import { useEffect } from "react";

// Registriert den Service Worker, damit die App offline funktioniert.
export default function PwaSetup() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline-Modus ist ein Extra, kein Blocker.
      });
    }
  }, []);
  return null;
}
