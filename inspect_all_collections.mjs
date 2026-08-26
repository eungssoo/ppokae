import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
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
const auth = getAuth(app);
const db = getFirestore(app);

async function inspectAll() {
  await signInAnonymously(auth);
  const collections = [
    'questions',
    'cycle_challenges',
    'personal_questions',
    'incorrect_questions',
    'bookmarks',
    'weaknesses',
    'expressions',
    'custom_questions'
  ];

  for (const c of collections) {
    try {
      const snap = await getDocs(collection(db, c));
      console.log(`[${c}]: ${snap.size} documents`);
    } catch (e) {
      console.log(`[${c}]: error or subcollections - ${e.message}`);
    }
  }

  // Also check custom_questions subcollections for Level 1, 2, 3, 4
  for (const lvl of ['Level 1', 'Level 2', 'Level 3', 'Level 4']) {
    try {
      const snap = await getDocs(collection(db, 'custom_questions', lvl, 'items'));
      console.log(`[custom_questions / ${lvl} / items]: ${snap.size} documents`);
    } catch (e) {
      console.log(`[custom_questions / ${lvl} / items]: ${e.message}`);
    }
  }
}

inspectAll();
