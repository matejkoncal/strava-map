import { initializeApp } from "firebase/app";
import { getFunctions } from "firebase/functions";

// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4T8R6II0r5UmDO4OPVV136A4cRNQpubE",
  authDomain: "justdorecap.firebaseapp.com",
  projectId: "justdorecap",
  storageBucket: "justdorecap.firebasestorage.app",
  messagingSenderId: "594386188116",
  appId: "1:594386188116:web:221cda6f4d4aa2f576bac1",
  measurementId: "G-04X5JS2L5D",
};

const app = initializeApp(firebaseConfig);
export const functions = getFunctions(app);
