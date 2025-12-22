
// import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
// import { getAnalytics, isSupported, Analytics } from "firebase/analytics";


// firebase/config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyC7qz88EJBlWlREjBYT2Tw6bsCtn_mCJ38",
    authDomain: "skorpion-5d7ba.firebaseapp.com",
    databaseURL: "https://skorpion-5d7ba-default-rtdb.firebaseio.com",
    projectId: "skorpion-5d7ba",
    storageBucket: "skorpion-5d7ba.firebasestorage.app",
    messagingSenderId: "252026157098",
    appId: "1:252026157098:web:569e3ffb1aebbb2037eb53",
    measurementId: "G-8BN6DT1V2E"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let analytics: Analytics | null = null;

/**
 * Initialize Firebase Analytics (client-side only)
 */
export const initAnalytics = async () => {
  if (typeof window === "undefined") return;

  const supported = await isSupported();
  if (supported && !analytics) {
    analytics = getAnalytics(app);
  }
};

/**
 * Get analytics instance safely
 */
export const getAnalyticsInstance = () => analytics;

export { app };
