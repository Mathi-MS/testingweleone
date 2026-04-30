// Give the service worker access to Firebase Messaging.
// Note: These scripts must be hosted on your server and reachable by the browser.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyAofVjwc_mz4MqhKfKLVz36W-WMFA6_Vg0",
    authDomain: "wele-notification-service.firebaseapp.com",
    projectId: "wele-notification-service",
    storageBucket: "wele-notification-service.firebasestorage.app",
    messagingSenderId: "133460359227",
    appId: "1:133460359227:web:432201e2cb810fc4eb841e",
    measurementId: "G-2HNBHMBEP0"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png' // Ensure this exists or use a default
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
