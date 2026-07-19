import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Firebase konsolundan aldığın güncel bilgilerin
const firebaseConfig = {
    apiKey: "AIzaSyBZkojeO4o_gc_uPen1W7tpEN2SakukePk",
    authDomain: "purple-clicker-pro-e43b1.firebaseapp.com",
    databaseURL: "https://purple-clicker-pro-e43b1-default-rtdb.firebaseio.com",
    projectId: "purple-clicker-pro-e43b1",
    storageBucket: "purple-clicker-pro-e43b1.firebasestorage.app",
    messagingSenderId: "717789942715",
    appId: "1:717789942715:web:47b30f431de0c1458e2a9e"
};

// Firebase'i başlatıyoruz
const app = initializeApp(firebaseConfig);

// app.js içinde kullanabilmek için dışa aktarıyoruz
export const auth = getAuth(app);
export const db = getDatabase(app);
