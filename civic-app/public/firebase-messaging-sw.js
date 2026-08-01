// Firebase Cloud Messaging Background Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDemoKeyCivicSolve2026AppConfig",
  authDomain: "civicsolve-demo.firebaseapp.com",
  projectId: "civicsolve-demo",
  storageBucket: "civicsolve-demo.appspot.com",
  messagingSenderId: "102938475610",
  appId: "1:102938475610:web:a1b2c3d4e5f6g7h8"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title || 'CivicSolve Notification';
  const notificationOptions = {
    body: payload.notification.body || 'New complaint update registered.',
    icon: payload.notification.icon || '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
