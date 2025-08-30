import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "volunteertime",
  appId: "1:51265831804:web:2d52fbeb94bb906ee11af9",
  storageBucket: "volunteertime.firebasestorage.app",
  apiKey: "AIzaSyD4ozgXb3N861jbbYok1NO3XBWkLK9D4zo",
  authDomain: "volunteertime.firebaseapp.com",
  messagingSenderId: "51265831804"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
