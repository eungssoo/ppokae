import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyClxA4i0G4ATpxLrJ3uSNmVFsS_Qs9U-Wk",
  authDomain: "daybreak-72ea7.firebaseapp.com",
  projectId: "daybreak-72ea7",
  storageBucket: "daybreak-72ea7.firebasestorage.app",
  messagingSenderId: "452098908230",
  appId: "1:452098908230:web:e8c32ae4f68893cf5baa47",
  measurementId: "G-CJB2MJKT27"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspect() {
  const snap = await getDocs(collection(db, 'questions'));
  console.log(`Total in Firestore: ${snap.size}`);
  const levels = {};
  snap.forEach(d => {
    const data = d.data();
    const l = data.difficulty || 'unknown';
    levels[l] = (levels[l] || 0) + 1;
  });
  console.log('Levels in DB:', JSON.stringify(levels, null, 2));
}

inspect();
