"use client"

import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  initializeFirestore,
  disableNetwork,
  enableNetwork,
  collection,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyCYucGdHEZjlcoF1NkNhG4dAsIa5T8PKTY",
  authDomain: "mobileapp-9c154.firebaseapp.com",
  projectId: "mobileapp-9c154",
  storageBucket: "mobileapp-9c154.appspot.com",
  messagingSenderId: "668909984456",
  appId: "1:668909984456:android:7c3c5296473287609163fd",
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Handle persistence based on platform
const persistence =
  Platform.OS === "web"
    ? browserLocalPersistence // Use browserLocalPersistence for web
    : getReactNativePersistence(AsyncStorage); // Use AsyncStorage for React Native

// Initialize Auth with appropriate persistence
export const auth = initializeAuth(app, {
  persistence,
});

// Initialize Firestore with persistent cache
export const db = initializeFirestore(app, {
});

export const storage = getStorage(app);

// Collections
export const usersCollection = collection(db, "users")
export const interestsCollection = collection(db, "interests")
export const categoriesCollection = collection(db, "categories")
export const spacesCollection = collection(db, "spaces")
export const postsCollection = collection(db, "posts")
export const eventsCollection = collection(db, "events")
export const connectionsCollection = collection(db, "connections")
export const chatsCollection = collection(db, "chats")
export const notificationsCollection = collection(db, "notifications")
export const searchHistoryCollection = collection(db, "searchHistory")

// Track network state
let isNetworkEnabled = true;
let networkEnablingInProgress = false;
let lastNetworkEnableTime = 0;

// Function to manually disable Firestore network access
export const disableFirestoreNetwork = async () => {
  if (!isNetworkEnabled) return; // Already disabled

  try {
    isNetworkEnabled = false; // Set this first to prevent race conditions
    await disableNetwork(db);
    console.log("Firestore network disabled");
  } catch (error) {
    console.error("Error disabling Firestore network:", error);
    isNetworkEnabled = true; // Revert if failed
  }
};

// Function to manually enable Firestore network access
export const enableFirestoreNetwork = async () => {
  if (isNetworkEnabled || networkEnablingInProgress) return; // Already enabled or in progress

  try {
    networkEnablingInProgress = true;

    // Add a small delay to ensure the network is actually ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Try to enable network
    await enableNetwork(db);
    isNetworkEnabled = true;
    lastNetworkEnableTime = Date.now();
    console.log("Firestore network enabled");
  } catch (error) {
    console.error("Error enabling Firestore network:", error);
  } finally {
    networkEnablingInProgress = false;
  }
};

// Function to check if Firestore network is enabled
export const isFirestoreNetworkEnabled = () => isNetworkEnabled;

// Function to check if it's safe to make Firestore requests
export const canMakeFirestoreRequests = () => {
  // Only allow requests if network is enabled and it's been at least 3 seconds since enabling
  return isNetworkEnabled && (Date.now() - lastNetworkEnableTime > 3000 || lastNetworkEnableTime === 0);
};

// Simplified reinitialize function that just toggles network
export const reinitializeFirestore = async () => {
  console.log("Attempting to reset Firestore network connection...");

  try {
    // First disable network
    await disableNetwork(db);
    isNetworkEnabled = false;

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Then enable network
    await enableNetwork(db);
    isNetworkEnabled = true;
    lastNetworkEnableTime = Date.now();

    console.log("Firestore network connection reset successfully");
  } catch (error) {
    console.error("Error resetting Firestore network connection:", error);
    // Try to ensure network is enabled even if there was an error
    try {
      await enableNetwork(db);
      isNetworkEnabled = true;
      lastNetworkEnableTime = Date.now();
    } catch (innerError) {
      console.error("Failed to re-enable network after reset error:", innerError);
    }
  }
};

export default app;