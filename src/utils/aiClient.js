/**
 * aiClient.js — Centralized AI utility with automatic Gemini → Groq fallback.
 *
 * Usage:
 *   import { askAI } from '../utils/aiClient';
 *   const result = await askAI(prompt);          // returns parsed JSON
 *   const result = await askAI(prompt, 'text');  // returns raw text
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GROQ_KEY   = import.meta.env.VITE_GROQ_API_KEY;

// ─── Gemini call ────────────────────────────────────────────────────
async function callGemini(prompt, wantJson) {
  if (!GEMINI_KEY || GEMINI_KEY.includes('placeholder')) {
    throw new Error('Gemini key missing');
  }
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  const config = wantJson
    ? { responseMimeType: 'application/json' }
    : {};
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: config,
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ─── Groq call ──────────────────────────────────────────────────────
async function callGroq(prompt, wantJson) {
  if (!GROQ_KEY || GROQ_KEY.includes('placeholder')) {
    throw new Error('Groq key missing');
  }
  const body = {
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
  };
  if (wantJson) body.response_format = { type: 'json_object' };

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

// ─── Public API ─────────────────────────────────────────────────────
/**
 * Ask an LLM. Tries Gemini first, falls back to Groq.
 * @param {string} prompt  – the full prompt (include JSON instructions if needed)
 * @param {'json'|'text'} format – 'json' (default) parses the response as JSON
 * @returns {Promise<object|string>}
 */
export async function askAI(prompt, format = 'json') {
  const wantJson = format === 'json';
  let rawText = '';
  let providerUsed = 'gemini';

  try {
    rawText = await callGemini(prompt, wantJson);
  } catch (geminiErr) {
    console.warn('[aiClient] Gemini failed, falling back to Groq:', geminiErr.message);
    providerUsed = 'groq';
    try {
      rawText = await callGroq(prompt, wantJson);
    } catch (groqErr) {
      console.error('[aiClient] Both providers failed.');
      throw new Error(`AI unavailable: Gemini (${geminiErr.message}), Groq (${groqErr.message})`);
    }
  }

  if (!wantJson) return { text: rawText, provider: providerUsed };

  // Clean markdown fences if present
  let clean = rawText.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();
  }

  return { data: JSON.parse(clean), provider: providerUsed };
}
