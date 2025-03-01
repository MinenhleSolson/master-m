// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { collection, getDocs } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAzQijaWaY7Qk9TwBmzp6qoi1TTqofu9RQ",
    authDomain: "master-m-7.firebaseapp.com",
    projectId: "master-m-7",
    storageBucket: "master-m-7.firebasestorage.app",
    messagingSenderId: "307760811922",
    appId: "1:307760811922:web:e64246a0bd106278cefb4b"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

export type Song = {
  id: string;
  title: string;
  artist: string;
  url: string;
  artwork: string;
  duration?: number; // Optional if you want to store it
};

export const fetchSongs = async () => {
    const querySnapshot = await getDocs(collection(db, "songs"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
}; 