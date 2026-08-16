import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB3CCu_wIHC19PpMMfoV7O_SE_3nW9r0EQ",
  authDomain: "ppokae-app.firebaseapp.com",
  projectId: "ppokae-app",
  storageBucket: "ppokae-app.firebasestorage.app",
  messagingSenderId: "458839661742",
  appId: "1:458839661742:web:e52e5a49889c352134613f",
  measurementId: "G-PSPK6JQQHS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function shuffleArray(arr) {
  if (!Array.isArray(arr) || arr.length <= 1) return arr;
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

async function shuffleDbOptions() {
  console.log('Shuffling options for all questions in [questions] & [cycle_challenges]...');
  
  // 1. questions collection
  const questionsSnap = await getDocs(collection(db, 'questions'));
  if (!questionsSnap.empty) {
    const batch = writeBatch(db);
    let count = 0;
    questionsSnap.forEach(d => {
      const data = d.data();
      if (Array.isArray(data.options) && data.options.length > 1) {
        const shuffled = shuffleArray(data.options);
        batch.update(d.ref, { options: shuffled });
        count++;
      }
    });
    if (count > 0) {
      await batch.commit();
      console.log(`✅ Shuffled options for ${count} questions in [questions] collection!`);
    }
  }

  // 2. cycle_challenges collection
  const cyclesSnap = await getDocs(collection(db, 'cycle_challenges'));
  if (!cyclesSnap.empty) {
    const batch2 = writeBatch(db);
    let cycleCount = 0;
    cyclesSnap.forEach(d => {
      const data = d.data();
      if (Array.isArray(data.questions)) {
        const updatedQuestions = data.questions.map(q => ({
          ...q,
          options: shuffleArray(q.options)
        }));
        batch2.update(d.ref, { questions: updatedQuestions });
        cycleCount++;
      }
    });
    if (cycleCount > 0) {
      await batch2.commit();
      console.log(`✅ Shuffled options for ${cycleCount} cycles in [cycle_challenges] collection!`);
    }
  }

  console.log('🎉 All existing questions and ranking cycles have randomized option placements!');
}

shuffleDbOptions().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
