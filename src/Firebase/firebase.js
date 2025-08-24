import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAskkj2A6MCk7SFDE_BUrSZptQO3urMkVU",
  authDomain: "wellnesstracker-6c54b.firebaseapp.com",
  projectId: "wellnesstracker-6c54b",
  storageBucket: "wellnesstracker-6c54b.firebasestorage.app",
  messagingSenderId: "946735662746",
  appId: "1:946735662746:web:cd65d1fe3b252ff7cbc123",
  measurementId: "G-LHKGWKKH7M"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);