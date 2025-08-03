// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import  { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAeiq9gUrehh2HQQAWIvwb6eFrEwMe-DLo",
  authDomain: "week7-yu.firebaseapp.com",
  projectId: "week7-yu",
  storageBucket: "week7-yu.firebasestorage.app",
  messagingSenderId: "304501324341",
  appId: "1:304501324341:web:d365e1af5d5081cc9fcf7c"
};

// Initialize Firebase
initializeApp(firebaseConfig);
const db = getFirestore()
export default db