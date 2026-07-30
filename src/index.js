/*
  src/index.js — this IS the Cloudflare Worker now (not a Pages Function
  anymore). Cloudflare's current platform ("Workers with static assets")
  merges what used to be two separate products (Pages + Workers) into
  one: your HTML/CSS/JS sit in public/, and this one file runs on
  Cloudflare's servers to handle anything that isn't a plain static file
  — in our case, just the /tutor chat endpoint.

  This tutor tries three Gemini models before giving up (see handleTutor
  below), ordered by daily free quota size (biggest first) since
  Flash-Lite quality is plenty for straightforward Morse Q&A/quizzes:
    1. gemini-3.5-flash-lite (~500 free requests/day)
    2. gemini-3.1-flash-lite (~500 free requests/day, separate bucket)
    3. gemini-flash-latest / 3.6 Flash (~20/day, better quality, bonus attempt)
  ~1,020 combined free requests/day. If all three fail (rare), the
  frontend (script.js) falls back to its offline rule-based tutor so the
  chat never just breaks.
*/

const MAX_HISTORY_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 800; // guard against someone pasting a huge wall of text

const SYSTEM_PROMPT = `You are DotDash AI, a friendly and knowledgeable Morse code tutor embedded inside the DotDash AI web app.

CAPABILITIES:
- Explain why any letter, number, or punctuation mark has its specific Morse code pattern (dots/dashes), referencing that common letters like E (.) and T (-) got the shortest codes as a 19th-century frequency-based optimization.
- Generate short quizzes (e.g. "what's the Morse for these 3 letters") and check answers the user provides.
- Suggest practice words appropriate to a beginner, intermediate, or advanced learner.
- Share accurate history of Morse code (invented 1830s by Samuel Morse & Alfred Vail, international standard from 1865, SOS adopted 1908, still used by amateur radio operators today).
- Help decode or encode short Morse snippets when asked directly.
- Give encouragement and learning tips (learn by sound/rhythm, start with E/T, practice in short daily sessions).

RESPONSE STYLE:
- Keep answers concise — a few short paragraphs at most, not long essays.
- Use plain text (the app auto-highlights Morse patterns like ".-.." for you — don't wrap them in markdown code blocks).
- Be warm and encouraging, never condescending.
- If asked something totally unrelated to Morse code, learning, or the app, gently steer back to Morse code topics.

HARD CONSTRAINTS:
- Never claim to be a different AI product or company.
- Don't generate content unrelated to Morse code / learning / this app's features.
- Keep replies under ~150 words unless the user explicitly asks for something longer (like a full history rundown).`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/tutor') {
      if (request.method !== 'POST') {
        return json({ error: 'Method not allowed' }, 405);
      }
      return handleTutor(request, env);
    }

    // Normally requests for real files never reach this file at all
    // (Cloudflare serves them straight from public/). This ASSETS.fetch
    // fallback just covers edge cases (e.g. a 404) so nothing breaks.
    return env.ASSETS.fetch(request);
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}

async function handleTutor(request, env) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const message = String(payload.message || '').slice(0, MAX_MESSAGE_LENGTH).trim();
  if (!message) return json({ error: 'Message is required' }, 400);

  // Only keep the last few turns, and only role + text — never trust or
  // forward anything else the client might have sent.
  const historyRaw = Array.isArray(payload.history) ? payload.history.slice(-MAX_HISTORY_MESSAGES) : [];

  // TIER 1 & 2: The two Flash-Lite models — each has its own ~500/day free
  // quota bucket (much bigger than the full Flash model's ~20/day), and
  // Flash-Lite quality is plenty for straightforward Morse Q&A/quizzes.
  const GEMINI_MODELS_IN_ORDER = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

  if (env.GEMINI_API_KEY) {
    for (const model of GEMINI_MODELS_IN_ORDER) {
      try {
        const reply = await askGemini(env.GEMINI_API_KEY, model, message, historyRaw);
        if (reply) return json({ reply, source: model });
      } catch (err) {
        console.error(`${model} failed, trying next tier:`, err.message);
      }
    }
  } else {
    console.error('GEMINI_API_KEY not set');
  }

  // All three Gemini tiers failed (rare — ~1,020 combined free requests/day)
  // — the frontend catches this and shows the offline rule-based tutor
  // instead of breaking.
  return json({ error: 'AI tutor is temporarily unavailable.' }, 502);
}

async function askGemini(apiKey, model, message, historyRaw) {
  const contents = [
    ...historyRaw.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(h.text || '').slice(0, MAX_MESSAGE_LENGTH) }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          maxOutputTokens: 700,
          temperature: 0.7,
          thinkingConfig: { thinkingLevel: 'low' }, // less invisible "reasoning" = faster + leaves more token budget for the actual reply
        },
      }),
    }
  );

  if (!resp.ok) {
    throw new Error(`${model} API error: ${resp.status} ${await resp.text()}`);
  }

  const data = await resp.json();
  const reply = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
  if (!reply) throw new Error(`${model} returned an empty reply`);
  return reply;
}
