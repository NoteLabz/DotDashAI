# DotDash AI 

A Morse code learning web app — learn the alphabet, practice both directions (text ↔ Morse), race the clock in a speed challenge, and ask an AI tutor questions, all in a clean dark-mode interface.

Built entirely with **plain HTML, CSS, and JavaScript — no framework, no build step.**

---

## Features

- **Learn** — full A–Z / 0–9 / punctuation grid. Tap any character to hear it, see its dot/dash pattern, and mark it as mastered.
- **Practice** — quiz mode in both directions (word → Morse and Morse → word), with hints, live scoring, and accuracy tracking.
- **Converter** — live, two-way Text ↔ Morse translator with a playable audio signal and waveform display.
- **Challenge** — a 30/60/120-second speed round with streak bonuses and a saved high score.
- **AI Tutor** — a real chat-based tutor for Morse code questions (history, quizzes, tips), backed by Google's Gemini API through a safe serverless proxy (see [How the AI Tutor works](#how-the-ai-tutor-works) below). Falls back to an offline rule-based tutor if the AI service is ever unavailable.
- **Daily Challenge** — one new decode-the-Morse puzzle every day, based on the calendar date.
- **Progress** — tracks total practice, accuracy over time, weak/mastered letters, and high score, all saved locally in the browser.
- **About** — a short history of Morse code, from its 1830s invention to today.

## Tech stack

| Layer | What's used |
|---|---|
| Structure | Plain HTML5 |
| Styling | Plain CSS (custom properties/variables, flexbox, grid — no framework) |
| Behavior | Plain JavaScript (ES6+, no framework, no build tools) |
| AI backend | A single Cloudflare Worker function, calling Google's Gemini API |
| Hosting | Cloudflare Workers (static assets + serverless function in one deploy) |
| Data storage | Browser `localStorage` (progress/stats) — no database |

## Project structure

```
dotdash-ai/
├── public/
│   ├── index.html      → page structure (all 9 "pages" live here, JS shows/hides them)
│   ├── style.css        → all styling
│   └── script.js        → all interactivity and logic
├── src/
│   └── index.js          → Cloudflare Worker: serves the site + handles the /tutor API route
├── wrangler.jsonc         → tells Cloudflare how the static site and Worker fit together
├── SETUP.md               → full step-by-step deployment guide
└── README.md              → this file
```

## How the AI Tutor works

The chat doesn't call Google's API directly from the browser — that would expose the API key to anyone who opens DevTools. Instead:

1. The browser sends your question to `/tutor`, a route handled by our own Worker (`src/index.js`).
2. The Worker attaches the real Gemini API key (stored as an encrypted secret in the Cloudflare dashboard — never in the code) and forwards the question to Google.
3. The Worker tries three Gemini models in order of daily free quota (largest first), so the tutor keeps working even if one model's quota is hit that day.
4. If all three fail, the frontend automatically switches to a built-in offline rule-based tutor, so the chat never simply breaks.

The API key is never sent to, or visible from, the browser at any point.

## Running it locally

No build step needed — just open `public/index.html` directly in a browser to try the site (the AI Tutor will use its offline fallback until it's deployed, since the `/tutor` route only exists once the Worker is running).

## Deploying it live

Full instructions — creating the GitHub repo, connecting Cloudflare, adding the API key safely — are in [`SETUP.md`](./SETUP.md).

## Known limitations

- The AI Tutor's offline fallback gives shorter, rule-based answers rather than fully dynamic AI responses.
- Progress and high scores are stored per-browser (`localStorage`), not per-account — they won't sync across devices.
- Free-tier Gemini quotas reset daily; on a very high-traffic day, the AI Tutor could briefly fall back to the offline tutor before quotas reset.

## Author

Made by Abhinav as a personal/academic project.
