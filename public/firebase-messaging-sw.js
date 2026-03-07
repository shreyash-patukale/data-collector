// firebase-messaging-sw.js
// This file must be in /public and served from the root

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            self.FIREBASE_API_KEY            || '__FIREBASE_API_KEY__',
  authDomain:        self.FIREBASE_AUTH_DOMAIN        || '__FIREBASE_AUTH_DOMAIN__',
  projectId:         self.FIREBASE_PROJECT_ID         || '__FIREBASE_PROJECT_ID__',
  storageBucket:     self.FIREBASE_STORAGE_BUCKET     || '__FIREBASE_STORAGE_BUCKET__',
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID|| '__FIREBASE_MESSAGING_SENDER_ID__',
  appId:             self.FIREBASE_APP_ID             || '__FIREBASE_APP_ID__',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'HydroTrack', {
    body:  body || 'You have pending readings to log.',
    icon:  '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag:   'hydro-reminder',
    data:  { url: payload.fcmOptions?.link || '/dashboard' },
  });
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(clients.openWindow(url));
});
