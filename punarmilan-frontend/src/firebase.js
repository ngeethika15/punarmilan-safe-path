import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCRfWBUCrqH5zB8r5r-dQ0BpNIvJLcSv3g",
  authDomain: "punar-milan-657bf.firebaseapp.com",
  projectId: "punar-milan-657bf",
  storageBucket: "punar-milan-657bf.firebasestorage.app",
  messagingSenderId: "142495849401",
  appId: "1:142495849401:web:7d6ec5932596a75265f468",
  measurementId: "G-5L0BN19PMM"
};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);