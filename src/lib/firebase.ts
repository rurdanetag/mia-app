"use client";

import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "billetera-mia",
  appId: "1:355120103264:web:c35aaddf2dc6210e492805",
  storageBucket: "billetera-mia.firebasestorage.app",
  apiKey: "AIzaSyCl1Y2SVllSuriJgNzCwEUyX3gzZU6mWOA",
  authDomain: "billetera-mia.firebaseapp.com",
  messagingSenderId: "355120103264",
};

// Initialize Firebase
const apps = getApps();
const app = apps.length ? apps[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };