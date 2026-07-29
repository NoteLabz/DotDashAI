/*
  src/index.js — this IS the Cloudflare Worker now (not a Pages Function
  anymore). Cloudflare's current platform ("Workers with static assets")
  merges what used to be two separate products (Pages + Workers) into
  one: your HTML/CSS/JS sit in public/, and this one file runs on
  Cloudflare's servers to handle anything that isn't a plain static file
  — in our case, just the /tutor chat endpoint.
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
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    // Site owner hasn't set the environment variable/secret yet — not a visitor error.
    return json({ error: 'AI tutor is not configured on the server yet.' }, 500);
  }

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
  const history = Array.isArray(payload.history)
    ? payload.history.slice(-MAX_HISTORY_MESSAGES).map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(h.text || '').slice(0, MAX_MESSAGE_LENGTH) }],
      }))
    : [];

  const contents = [...history, { role: 'user', parts: [{ text: message }] }];

  try {
    const resp = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
        }),
      }
    );

    if (!resp.ok) {
      console.error('Gemini API error:', resp.status, await resp.text());
      return json({ error: 'AI tutor is temporarily unavailable.' }, 502);
    }

    const data = await resp.json();
    const reply = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
    if (!reply) return json({ error: 'AI tutor returned an empty reply.' }, 502);

    return json({ reply });
  } catch (err) {
    console.error('Tutor function error:', err);
    return json({ error: 'Something went wrong talking to the AI tutor.' }, 500);
  }
}
