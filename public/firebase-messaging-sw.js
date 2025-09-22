/* eslint-disable no-undef */
// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA7K_wWp7C-YvosqksA4oykPb0Slr06J1E",
  authDomain: "careeradvsor.firebaseapp.com",
  projectId: "careeradvsor",
  storageBucket: "careeradvsor.firebasestorage.app",
  messagingSenderId: "1008998821490",
  appId: "1:1008998821490:web:63982d177a88b0e3589ceb",
  measurementId: "G-LKXTBE210R"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification?.title || 'Reminder';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
