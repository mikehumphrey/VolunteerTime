
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Securely log the status of the API key
if (typeof window === 'undefined') { // Only run on the server
    console.log("Firebase config check:");
    if (firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith('AIza')) {
        console.log("  - Firebase API Key: [Loaded successfully]");
    } else {
        console.log("  - Firebase API Key: [MISSING or INVALID]");
        console.error("CRITICAL: Firebase API Key is not configured. Check your .env.local file or App Hosting secrets.");
    }
     if (!firebaseConfig.projectId) {
        console.log("  - Firebase Project ID: [MISSING]");
    } else {
        console.log(`  - Firebase Project ID: [${firebaseConfig.projectId}]`);
    }
}


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// If we're in development, connect to the emulators
if (process.env.NODE_ENV === 'development') {
    try {
        console.log("Connecting to Firebase Firestore Emulator...");
        connectFirestoreEmulator(db, '127.0.0.1', 8080);
        console.log("Firestore is now connected to the local emulator.");
    } catch (error) {
        console.error("Error connecting to Firebase Firestore Emulator:", error);
    }
} else {
    console.log("Running in production mode. Connecting to live Firebase services.");
}


export { app, auth, db };
