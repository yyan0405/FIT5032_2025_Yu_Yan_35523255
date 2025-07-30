import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'


const app = createApp(App)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(router)

app.mount('#app')
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(firebaseApp);

// Export for use in other components
export { db };