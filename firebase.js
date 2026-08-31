// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDNqHcSfzszSSBf35cRQd8u7mANp9gpFgY",
  authDomain: "evil-firebase.firebaseapp.com",
  projectId: "evil-firebase",
  storageBucket: "evil-firebase.firebasestorage.app",
  messagingSenderId: "287948317918",
  appId: "1:287948317918:web:5435f05f57615f9f838e4f",
  measurementId: "G-EGY3P33YW7"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
