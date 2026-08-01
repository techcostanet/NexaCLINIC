// Firebase config and connection setup
// Toggle USE_MOCK to true to run fully in-memory/localStorage.
// Change to false to connect to your real Google Firebase instance.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { USE_MOCK } from './services/firebase/mockDb';

// Real Firebase credentials supplied by the user
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

if (!USE_MOCK) {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Firebase config is missing required environment variables. Please check your .env file.");
  }
}

// Initialize Firebase App
export let app;
if (!USE_MOCK) {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
}

import * as authFunctions from './services/firebase/authService';
import * as patientFunctions from './services/firebase/patientService';
import * as stockFunctions from './services/firebase/stockService';
import * as financialFunctions from './services/firebase/financialService';
import * as hrFunctions from './services/firebase/hrService';
import * as clinicalFunctions from './services/firebase/clinicalService';
import * as systemFunctions from './services/firebase/systemService';

// Standard exports for the rest of the application
export const authService = {
  ...authFunctions
};

export const dbService = {
  ...patientFunctions,
  ...stockFunctions,
  ...financialFunctions,
  ...hrFunctions,
  ...clinicalFunctions,
  ...systemFunctions,
};
