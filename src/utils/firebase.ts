import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyAofVjwc_mz4MqhKfKLVz36W-WMFA6_Vg0",
    authDomain: "wele-notification-service.firebaseapp.com",
    projectId: "wele-notification-service",
    storageBucket: "wele-notification-service.firebasestorage.app",
    messagingSenderId: "133460359227",
    appId: "1:133460359227:web:432201e2cb810fc4eb841e",
    measurementId: "G-2HNBHMBEP0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestForToken = async () => {
    if (!messaging) return null;

    try {
        // Explicitly request permission first
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('Notification permission denied');
            return null;
        }

        // Register service worker explicitly for more stability across browsers
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service Worker registered with scope:', registration.scope);

            const currentToken = await getToken(messaging, {
                vapidKey: "BDCRxzWiZSBWgmsd4TF4Jfh6Dxl164SMQMTW4IYPtDx4nNyYMcecaiUDlfns9ZwhjVj9HnkgVsSw2vfBvn2L9F4",
                serviceWorkerRegistration: registration
            });

            if (currentToken) {
                console.log('FCM Token retrieved:', currentToken);
                return currentToken;
            }
        }

        console.log('No registration token available or Service Worker support missing.');
        return null;
    } catch (err) {
        console.log('An error occurred while retrieving token: ', err);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return;
        onMessage(messaging, (payload: any) => {
            console.log("Foreground message received:", payload);
            resolve(payload);
        });
    });
