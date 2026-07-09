import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBhRj-HtvpaTkCzXd0CKUO1e3ux3Tsc21A",
    authDomain: "mrcashbd-7e7e6.firebaseapp.com",
    projectId: "mrcashbd-7e7e6",
    storageBucket: "mrcashbd-7e7e6.firebasestorage.app",
    messagingSenderId: "102350116678",
    appId: "1:102350116678:web:796c8db3933dcef15eb747",
    measurementId: "G-63YN20J1RH"
  };

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export { app, db };
