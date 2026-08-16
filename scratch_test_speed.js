const start = Date.now();

async function test() {
  const schema = {
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
  };

  const res = await fetch('https://ppokae.vercel.app/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemini-3.5-flash-lite',
      payload: {
        contents: [{ parts: [{ text: '수능/토익 영문법 10문제를 4지선다 JSON 배열로 생성하세요.' }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.2
        }
      }
    })
  });

  const data = await res.json();
  if (data.error) {
    console.error('API ERROR:', data);
    return;
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error('NO TEXT IN CANDIDATES:', data);
    return;
  }
  const parsed = JSON.parse(text);
  console.log(`⚡ 10 Questions with Schema generated in ${((Date.now() - start) / 1000).toFixed(2)}s. Total questions: ${parsed.length}`);
}

test().catch(console.error);
