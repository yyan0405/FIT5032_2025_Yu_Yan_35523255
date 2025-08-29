// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// Use environment variables for production deployment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAcv1e-JHSWOGeIrzS6VIhTpMFrzlJ0ndQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fit5032-a3-83d8a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fit5032-a3-83d8a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fit5032-a3-83d8a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "499392313564",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:499392313564:web:87e65ebeb6ed9e99c81c19"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;