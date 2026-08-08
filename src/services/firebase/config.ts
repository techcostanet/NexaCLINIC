/// <reference types="vite/client" />
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { USE_MOCK } from './mockDb';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBPw7Z_nhz7osMlGcdw4wAqXGFUkH27kug",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nexa-index.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nexa-index",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nexa-index.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1089214920796",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1089214920796:web:120f3b158f599b0236ce99",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-JB7DJRKXV4"
};

if (!USE_MOCK) {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Firebase config is missing required environment variables. Please check your .env file.");
  }
}

export let app = {} as FirebaseApp;

if (!USE_MOCK) {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
}
