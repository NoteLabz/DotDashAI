/*
  src/index.js — this IS the Cloudflare Worker now (not a Pages Function
  anymore). Cloudflare's current platform ("Workers with static assets")
  merges what used to be two separate products (Pages + Workers) into
  one: your HTML/CSS/JS sit in public/, and this one file runs on
  Cloudflare's servers to handle anything that isn't a plain static file
  — in our case, just the /tutor chat endpoint.

  This tutor tries three AI tiers before giving up (see handleTutor below):
    1. Google Gemini — gemini-flash-latest (env.GEMINI_API_KEY secret)
    2. Google Gemini — gemini-3.5-flash-lite (same key, separate daily quota)
    3. Cloudflare Workers AI (env.AI binding) — Cloudflare's own hosted
       Llama model, no external key at all, separate free quota
  If all three fail, the frontend (script.js) falls back to its offline
  rule-based tutor so the chat never just breaks.
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

  // TIER 1: Google Gemini — best quality, ~20 free requests/day on this key
  if (env.GEMINI_API_KEY) {
    try {
      const reply = await askGemini(env.GEMINI_API_KEY, 'gemini-flash-latest', message, historyRaw);
      if (reply) return json({ reply, source: 'gemini-flash-latest' });
    } catch (err) {
      console.error('gemini-flash-latest failed, trying gemini-3.5-flash-lite:', err.message);
    }

    // TIER 2: A second, separate Gemini model — its own independent daily
    // quota bucket, so if the first model's quota is used up this one
    // often still has room.
    try {
      const reply = await askGemini(env.GEMINI_API_KEY, 'gemini-3.5-flash-lite', message, historyRaw);
      if (reply) return json({ reply, source: 'gemini-3.5-flash-lite' });
    } catch (err) {
      console.error('gemini-3.5-flash-lite also failed, falling back to Workers AI:', err.message);
    }
  } else {
    console.error('GEMINI_API_KEY not set — skipping straight to Workers AI');
  }

  // TIER 3: Cloudflare Workers AI (Llama 3.1 8B) — runs on Cloudflare's own
  // servers, no external API key at all, and has its own separate free
  // quota (10,000 neurons/day) completely independent of both Gemini models.
  if (env.AI) {
    try {
      const reply = await askWorkersAI(env.AI, message, historyRaw);
      if (reply) return json({ reply, source: 'workers-ai' });
    } catch (err) {
      console.error('Workers AI also failed:', err.message);
    }
  }

  // All three AI tiers failed (or none configured) — the frontend catches
  // this and shows the offline rule-based tutor instead of breaking.
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

async function askWorkersAI(ai, message, historyRaw) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...historyRaw.map(h => ({
      role: h.role === 'user' ? 'user' : 'assistant',
      content: String(h.text || '').slice(0, MAX_MESSAGE_LENGTH),
    })),
    { role: 'user', content: message },
  ];

  const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', { messages, max_tokens: 500 });
  const reply = (result?.response || '').trim();
  if (!reply) throw new Error('Workers AI returned an empty reply');
  return reply;
}
