import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';

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

async function purgeAll() {
  console.log("Authenticating...");
  await signInAnonymously(auth);
  console.log("Authenticated.");

  // 1. Delete all questions
  console.log("Fetching all questions from 'questions' collection...");
  const questionsSnap = await getDocs(collection(db, 'questions'));
  console.log(`Found ${questionsSnap.size} questions to delete.`);

  if (!questionsSnap.empty) {
    let batch = writeBatch(db);
    let count = 0;
    for (const docSnap of questionsSnap.docs) {
      batch.delete(docSnap.ref);
      count++;
      if (count % 400 === 0) {
        await batch.commit();
        batch = writeBatch(db);
        console.log(`Deleted ${count} questions so far...`);
      }
    }
    if (count % 400 !== 0) {
      await batch.commit();
    }
    console.log(`Successfully deleted all ${count} questions.`);
  }

  // 2. Delete all cached cycle challenges
  console.log("Fetching all cycle challenges...");
  const cycleSnap = await getDocs(collection(db, 'cycle_challenges'));
  console.log(`Found ${cycleSnap.size} cycle challenge docs.`);
  if (!cycleSnap.empty) {
    const batch = writeBatch(db);
    cycleSnap.forEach(d => batch.delete(d.ref));
    await batch.commit();
    console.log("Successfully cleared cycle challenges.");
  }

  // 3. Verify
  const verifySnap = await getDocs(collection(db, 'questions'));
  console.log(`Verification: Remaining questions count = ${verifySnap.size}`);
  console.log("Purge complete!");
  process.exit(0);
}

purgeAll().catch(err => {
  console.error("Purge Error:", err);
  process.exit(1);
});
