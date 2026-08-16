async function testQuality() {
  const prompt = `당신은 대한민국 최고의 수능/EBS/토익 1타 강사이자 영문법 국가대표 출제위원장입니다.

[🚨 엄격한 고품격 출제 헌장]
1. 🚫 [유치한 초등 예문 절대 금지]
   - 'Tom', 'Jane', 'reads books in the library', 'ate an apple' 같은 초등학생 교과서식의 진부하고 유치한 문장은 엄격히 금지합니다.
2. ✨ [실전 수능/토익급 세련된 문맥 필수]
   - 실제 수능특강, 고교 모의고사, 토익 800+, 비즈니스, 테크, 문화, 학술 맥락의 자연스럽고 품격 있는 현대 영어 문장으로만 출제하세요.
3. 🎯 [Level 1 (기초 실전) 예시 수준]
   - "The software development team _____ the critical server bug yesterday." (정답: fixed)
   - "All conference attendees must _____ their identification badges at the front desk." (정답: wear)

다음 JSON 형식으로 Level 1 문제 3개를 생성하세요:
[
  {
    "form": 3,
    "sentence": "The marketing department _____ the quarterly sales report last night.",
    "options": [
      {"text": "finalized", "is_correct": true, "feedback": "과거 시점 부사(last night)와 어울리는 단순 과거 시제 'finalized'가 정답입니다."},
      {"text": "has finalized", "is_correct": false, "feedback": "현재완료는 명백한 과거 부사(last night)와 결합할 수 없습니다."},
      {"text": "finalizes", "is_correct": false, "feedback": "현재 시제는 과거 시점 부사와 시제가 불일치합니다."},
      {"text": "finalizing", "is_correct": false, "feedback": "동사 자리에 준동사(-ing) 단독으로 쓰일 수 없습니다."}
    ],
    "answer": "finalized",
    "translation": "마케팅 부서는 어젯밤 분기별 매출 보고서를 최종 완료했다.",
    "explanation": {
      "chunk_pattern": "S + finalized + the quarterly sales report + last night",
      "nuance": "실전 비즈니스 및 수능/토익 빈출 과거 시제 문형"
    }
  }
]`;

  const res = await fetch('https://ppokae.vercel.app/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemini-3.5-flash',
      payload: {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.5
        }
      }
    })
  });

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log('✨ GENERATED HIGH-QUALITY QUESTIONS:\n', text);
}
testQuality().catch(console.error);
