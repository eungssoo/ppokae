import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, serverTimestamp, getDocs } from 'firebase/firestore';

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

const GEMINI_API_KEY = "AIzaSyDtDBLE5hjD8gJzAheQttUxWyNv5JwJ1mo";

const LEVELS = [
  { level: 1, desc: 'Level 1 (입문/초급)' },
  { level: 2, desc: 'Level 2 (실력 중급)' },
  { level: 3, desc: 'Level 3 (고득점 도약)' },
  { level: 4, desc: 'Level 4 (실전 마스터)' },
];

async function generateQuestions(diffDesc) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const systemPrompt = "당신은 최고 수준의 영어 1타 강사입니다. 주어진 난이도에 맞춰 영문법 객관식 문제를 정확히 15개 생성하세요. JSON 띄어쓰기 최소화, 설명은 20자 이내.";
  const userPrompt = `난이도: ${diffDesc}\n1~5형식 골고루 15개 생성. 빈칸은 반드시 "____" 1개. 4지선다, 보기별 feedback과 explanation(chunk_pattern, nuance) 필수.`;

  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            form: { type: "INTEGER" },
            sentence: { type: "STRING" },
            options: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  text: { type: "STRING" },
                  is_correct: { type: "BOOLEAN" },
                  feedback: { type: "STRING" }
                },
                required: ["text", "is_correct", "feedback"]
              }
            },
            answer: { type: "STRING" },
            translation: { type: "STRING" },
            explanation: {
              type: "OBJECT",
              properties: {
                chunk_pattern: { type: "STRING" },
                nuance: { type: "STRING" }
              },
              required: ["chunk_pattern", "nuance"]
            }
          },
          required: ["form", "sentence", "options", "answer", "translation", "explanation"]
        }
      }
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(raw);
}

async function main() {
  console.log('🚀 Starting DB Seed with Gemini 2.5 Flash...');
  
  for (const lvl of LEVELS) {
    try {
      console.log(`Generating 15 questions for ${lvl.desc}...`);
      const questions = await generateQuestions(lvl.desc);
      console.log(`Got ${questions.length} questions. Saving to Firestore...`);

      const batch = writeBatch(db);
      const qCol = collection(db, 'questions');
      for (const q of questions) {
        const ref = doc(qCol);
        batch.set(ref, {
          difficulty: lvl.desc,
          form: q.form || 3,
          sentence: q.sentence,
          options: q.options || [],
          answer: q.answer,
          translation: q.translation,
          explanation: q.explanation || { chunk_pattern: '기본 문형', nuance: '자연스러운 표현' },
          createdAt: serverTimestamp()
        });
      }
      await batch.commit();
      console.log(`✅ Saved ${lvl.desc}`);
    } catch (e) {
      console.error(`❌ Error on ${lvl.desc}:`, e);
    }
  }

  const finalSnap = await getDocs(collection(db, 'questions'));
  console.log(`🎉 DB Seed Complete! Total questions in Firestore: ${finalSnap.size}`);
}

main();
