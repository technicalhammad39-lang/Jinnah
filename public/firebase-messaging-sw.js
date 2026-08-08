importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCYRcCVnd7YA_UYtfE8naP7W-a5fCiJWUo",
  authDomain: "jinnah-hardware-store.firebaseapp.com",
  projectId: "jinnah-hardware-store",
  storageBucket: "jinnah-hardware-store.firebasestorage.app",
  messagingSenderId: "1064074776262",
  appId: "1:1064074776262:web:14815df163d675210191c7",
  measurementId: "G-CVG7FG07GZ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.svg',
    data: payload.webpush?.fcmOptions?.link ? { url: payload.webpush.fcmOptions.link } : {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
