import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, getDocs } from 'firebase/firestore';

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

function sanitizeForm(form) {
  const num = parseInt(String(form), 10);
  if (!isNaN(num) && num >= 1 && num <= 5) {
    return num;
  }
  return 3;
}

async function fixCollection(colName) {
  console.log(`Checking collection [${colName}]...`);
  const snap = await getDocs(collection(db, colName));
  if (snap.empty) {
    console.log(`Collection [${colName}] is empty.`);
    return;
  }

  const batch = writeBatch(db);
  let updatedCount = 0;

  snap.forEach(d => {
    const data = d.data();
    if (colName === 'cycle_challenges') {
      let changed = false;
      const questions = (data.questions || []).map(q => {
        const cleanForm = sanitizeForm(q.form);
        if (cleanForm !== q.form) {
          changed = true;
          return { ...q, form: cleanForm };
        }
        return q;
      });
      if (changed) {
        batch.update(d.ref, { questions });
        updatedCount++;
      }
    } else {
      const cleanForm = sanitizeForm(data.form);
      if (cleanForm !== data.form) {
        batch.update(d.ref, { form: cleanForm });
        updatedCount++;
      }
    }
  });

  if (updatedCount > 0) {
    await batch.commit();
    console.log(`✅ Updated ${updatedCount} documents in [${colName}].`);
  } else {
    console.log(`All documents in [${colName}] already have valid 1~5 forms.`);
  }
}

async function main() {
  await fixCollection('questions');
  await fixCollection('personal_questions');
  await fixCollection('weaknesses');
  await fixCollection('cycle_challenges');
  console.log('\n🎉 Form Fix Complete! All questions strictly normalized to 1~5 forms.');
}

main();
