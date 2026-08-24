import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDpi5lq6dGqQ4ETzFao2mBWn3z62TJ1-os",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "trattoriabarcantone.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "trattoriabarcantone",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "trattoriabarcantone.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "269428390980",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:269428390980:web:b9fc64179bab78a9985011",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-H5FMXXGKQB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
