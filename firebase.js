import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBR8gdEYCgXGi_oQKadJG0fFDHdUVXTf-E",
  authDomain: "bluewhales-on-tour.firebaseapp.com",
  projectId: "bluewhales-on-tour",
  storageBucket: "bluewhales-on-tour.firebasestorage.app",
  messagingSenderId: "157344006436",
  appId: "1:157344006436:web:11e20fbee12a117406f3b1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
