import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    getAuth,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyCDt6YbRifr3qT8kA_BpRLtqvZiUzSOmlU",
    authDomain: "precioshl.firebaseapp.com",
    projectId: "precioshl",
    storageBucket: "precioshl.firebasestorage.app",
    messagingSenderId: "285446992641",
    appId: "1:285446992641:web:1481d8f2daeddaf39e2100"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

// Mantener la sesión iniciada
setPersistence(auth, browserLocalPersistence);


export {
    db,
    auth
};