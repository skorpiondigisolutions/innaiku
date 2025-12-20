
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
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


// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics (only on client side)
let analytics: Analytics | undefined;
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

// Set app_name globally
if (typeof window !== 'undefined') {
    // Shim gtag if it doesn't exist yet
    if (typeof (window as any).gtag !== 'function') {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).gtag = function (...args: any[]) {
            (window as any).dataLayer.push(args);
        };
    }

    (window as any).gtag('config', firebaseConfig.measurementId, {
        app_name: 'innaiku'
    });
}

export { app, analytics };


