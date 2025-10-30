import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAm7bYgAGs26GmDyI3P1hnMTcTUXgXjJoM",
  authDomain: "blyza-2767e.firebaseapp.com",
  projectId: "blyza-2767e",
  storageBucket: "blyza-2767e.firebasestorage.app",
  messagingSenderId: "312532709432",
  appId: "1:312532709432:web:6f1add8b846806258c76cd",
  measurementId: "G-R0RBTD0DBB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
