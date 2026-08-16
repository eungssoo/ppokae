import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB3CCu_wIHC19PpMMfoV7O_SE_3nW9r0EQ",
  authDomain: "ppokae-app.firebaseapp.com",
  projectId: "ppokae-app",
  storageBucket: "ppokae-app.firebasestorage.app",
  messagingSenderId: "458839661742",
  appId: "1:458839661742:web:e52e5a49889c352134613f",
  measurementId: "G-PSPK6JQQHS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
