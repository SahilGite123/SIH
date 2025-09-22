import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyA7K_wWp7C-YvosqksA4oykPb0Slr06J1E",
  authDomain: "careeradvsor.firebaseapp.com",
  projectId: "careeradvsor",
  storageBucket: "careeradvsor.firebasestorage.app",
  messagingSenderId: "1008998821490",
  appId: "1:1008998821490:web:63982d177a88b0e3589ceb",
  measurementId: "G-LKXTBE210R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// Guard analytics for browser environments only
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    // Analytics may fail in unsupported environments, ignore gracefully
    analytics = null;
  }
}

// Initialize Firebase Cloud Messaging
let messaging = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  messaging = getMessaging(app);
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  if (!messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const vapidKey = process.env.REACT_APP_FCM_VAPID_KEY || undefined;
      const token = await getToken(messaging, { vapidKey });
      return token;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
  }
  return null;
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { auth, db, storage, analytics, messaging };
