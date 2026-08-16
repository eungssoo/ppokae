import { Question } from '../types';
import { callGeminiProxy } from './geminiService';

export interface EnglishExplanation {
  translation_en: string;
  chunk_pattern: string;
  nuance: string;
  option_feedbacks: Record<string, string>;
}

// In-Memory Cache for ultra-fast 0ms retrieval
const memoryCache = new Map<string, EnglishExplanation>();

// Helper to generate a stable unique key for a question
export function getQuestionKey(question: Question): string {
  if (question.id) return `q_${question.id}`;
  // Generate simple hash from sentence + answer
  const base = `${question.sentence}_${question.answer}`.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }
  return `q_hash_${Math.abs(hash)}`;
}

// Check local storage for cached translation
function getFromLocalStorage(key: string): EnglishExplanation | null {
  try {
    const raw = localStorage.getItem(`ppokae_en_exp_${key}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

// Save to local storage
function saveToLocalStorage(key: string, data: EnglishExplanation): void {
  try {
    localStorage.setItem(`ppokae_en_exp_${key}`, JSON.stringify(data));
  } catch {}
}

/**
 * ⚡ Get or asynchronously fetch English explanation on-demand with 0ms cache.
 */
export async function getOrFetchEnglishExplanation(
  question: Question
): Promise<EnglishExplanation | null> {
  const key = getQuestionKey(question);

  // 1. Check in-memory cache (0ms)
  if (memoryCache.has(key)) {
    return memoryCache.get(key)!;
  }

  // 2. Check localStorage cache (0ms)
  const localData = getFromLocalStorage(key);
  if (localData) {
    memoryCache.set(key, localData);
    return localData;
  }

  // 3. Fallback: If question already has embedded explanation_en
  if ((question as any).explanation_en) {
    const enExp = (question as any).explanation_en;
    const result: EnglishExplanation = {
      translation_en: (question as any).translation_en || question.sentence,
      chunk_pattern: enExp.chunk_pattern || '',
      nuance: enExp.nuance || '',
      option_feedbacks: enExp.option_feedbacks || {}
    };
    memoryCache.set(key, result);
    saveToLocalStorage(key, result);
    return result;
  }

  // 4. On-Demand Fetch via ultra-lightweight Gemini Flash Lite (0.5s)
  const models = [
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash-8b',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];

  const systemPrompt = `You are a world-class English grammar master and ESL curriculum writer.
Convert the given Korean grammar quiz explanation into clear, concise, professional English for ESL learners.

[RULES]:
1. "translation_en": Provide a plain, natural English paraphrase/meaning breakdown of the target sentence.
2. "chunk_pattern": State the core grammatical pattern in English (e.g. "Subject + Transitive Verb + Object + Object Complement (to-infinitive)").
3. "nuance": Explain the native nuance, usage context, and why this grammar point is critical.
4. "option_feedbacks": Provide a clear 1-sentence English explanation for why each option is correct or incorrect.`;

  const userPrompt = `
[QUESTION]:
Sentence: ${question.sentence}
Correct Answer: ${question.answer}
Form: ${question.form}형식
Original Korean Translation: ${question.translation}
Original Chunk Pattern: ${question.explanation?.chunk_pattern || ''}
Original Nuance: ${question.explanation?.nuance || ''}
Options:
${question.options.map((opt: any) => `- Option: "${typeof opt === 'object' ? opt.text : opt}" | IsCorrect: ${typeof opt === 'object' ? opt.is_correct : opt === question.answer} | Korean Feedback: ${typeof opt === 'object' ? opt.feedback : ''}`).join('\n')}

Generate a clean JSON object matching the required schema.`;

  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          translation_en: { type: "STRING" },
          chunk_pattern: { type: "STRING" },
          nuance: { type: "STRING" },
          option_feedbacks: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                option_text: { type: "STRING" },
                feedback: { type: "STRING" }
              },
              required: ["option_text", "feedback"]
            }
          }
        },
        required: ["translation_en", "chunk_pattern", "nuance", "option_feedbacks"]
      },
      temperature: 0.2
    }
  };

  for (const model of models) {
    try {
      const resultData = await callGeminiProxy(model, payload);
      const rawText = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        
        const feedbacksMap: Record<string, string> = {};
        if (Array.isArray(parsed.option_feedbacks)) {
          parsed.option_feedbacks.forEach((item: any) => {
            if (item.option_text) {
              feedbacksMap[item.option_text] = item.feedback;
            }
          });
        }

        const formatted: EnglishExplanation = {
          translation_en: parsed.translation_en || question.sentence,
          chunk_pattern: parsed.chunk_pattern || question.explanation?.chunk_pattern || '',
          nuance: parsed.nuance || question.explanation?.nuance || '',
          option_feedbacks: feedbacksMap
        };

        // Cache in memory and localStorage
        memoryCache.set(key, formatted);
        saveToLocalStorage(key, formatted);
        return formatted;
      }
    } catch (e) {
      console.warn(`[EnglishExplanationService] Failed with model ${model}, trying next...`, e);
    }
  }

  return null;
}

/**
 * 🚀 Pre-fetch English explanation in the background while user is solving the question.
 * Non-blocking, completely transparent.
 */
export function prefetchEnglishExplanation(question: Question | null): void {
  if (!question) return;
  const key = getQuestionKey(question);
  if (memoryCache.has(key) || getFromLocalStorage(key)) return;

  // Fire and forget in background
  getOrFetchEnglishExplanation(question).catch(() => {});
}
