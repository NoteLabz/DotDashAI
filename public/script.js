/*
  DotDash AI — script.js
  Plain JavaScript (no framework/build step). Wrapped in an IIFE so
  its variables stay private to this file.
*/
(() => {
  'use strict';

  // ICONS
  const ICONS = {
    doc: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>',
    radio: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="15" r="2"/><path d="M8.5 11.5a5 5 0 0 1 7 0M5.5 8.5a9 9 0 0 1 13 0"/><path d="M4 15H2M22 15h-2"/></svg>',
    bolt: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 11 14 9 22 21 10 13 10 13 2"/></svg>',
    flame: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c1.2 3.2-2.1 4.3-2.1 7.4a4.1 4.1 0 0 0 8.2 0c0-1.8-.8-2.8-.8-2.8s1.9 1.9 1.9 5.6a6.2 6.2 0 1 1-12.4 0c0-4.4 3.4-6.3 5.2-10.2z"/></svg>',
    trophy: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 5H3v2a4 4 0 0 0 4 4M17 5h4v2a4 4 0 0 1-4 4"/><path d="M8 21h8M12 17v4"/></svg>',
    star: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15 9 22 9.5 16.5 14 18.5 21 12 17 5.5 21 7.5 14 2 9.5 9 9"/></svg>',
    target: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/></svg>',
    chart: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="20" x2="4" y2="12"/><line x1="10" y1="20" x2="10" y2="6"/><line x1="16" y1="20" x2="16" y2="14"/><line x1="21" y1="20" x2="21" y2="4"/></svg>',
    pencil: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    sparkle: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2"/></svg>',
    music: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    type: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
  };

  // MORSE DATA
  const MORSE = {
    A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",
    I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",
    Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",
    Y:"-.--",Z:"--..",
    "0":"-----","1":".----","2":"..---","3":"...--","4":"....-",
    "5":".....","6":"-....","7":"--...","8":"---..","9":"----.",
    ".":".-.-.-",",":"--..--","?":"..--..","'":".----.",
    "!":"-.-.--","/":"-..-.","(":"-.--.",")":"-.--.-",
    "&":".-...",":":"---...",";":"-.-.-.","=":"-...-",
    "+":".-.-.","-":"-....-","_":"..--.-",'"':".-..-.","@":".--.-.","$":"...-..-",
  };
  const RMORSE = Object.fromEntries(Object.entries(MORSE).map(([k,v]) => [v,k]));

  // Turns normal text into Morse code.
  function textToMorse(t) {
    return t.toUpperCase().split("").map(c => MORSE[c] || (c === " " ? "/" : c)).join(" ");
  }
  // Turns Morse code back into text (the reverse of the function above).
  function morseToText(m) {
    return m.trim().split(" / ").map(w => w.split(" ").map(c => RMORSE[c] || c).join("")).join(" ");
  }

  const PRACTICE_WORDS = [
    "HELLO","WORLD","MORSE","CODE","RADIO","SIGNAL","ALPHA","BRAVO","DELTA",
    "ECHO","FOXTROT","GOLF","HOTEL","INDIA","KILO","LIMA","MIKE","NOVEMBER",
    "OSCAR","PAPA","ROMEO","SIERRA","TANGO","UNIFORM","VICTOR","WHISKEY","YANKEE",
    "ZULU","SOS","TEST","LEARN","DOTS","DASH","WAVE","BEAM","PULSE","CYBER",
    "NET","HAM","CALL","TRANSMIT","RECEIVE","STATION","FREQUENCY","BAND","SPARK",
  ];

  const CHAR_TIPS = {
    A:"Short-long: dit-dah",B:"B for Bang: -...  (gun shape)",C:"Rhythm: di-dah-di-dah",
    D:"D for Dog: -.. (short leash)",E:"E is the dot — most common letter",
    F:"..-.  F for Fax",G:"--. G for Go Go",H:".... 4 dots, like 4 fingers of an H",
    I:".. Two dots = two eyes of an I",J:".--- J-A-Y",K:"-.- Key opens a lock",
    L:".-.. L for Luck",M:"-- Two dashes, M has two humps",N:"-. Night",
    O:"--- Three dashes, circle shape",P:".--. P for Project",Q:"--.- Q (Queen)",
    R:".-. R for Radio rhythm",S:"... SOS starts with S!",T:"- T is just a dash",
    U:"..- U for Underwater",V:"...-  V for Victory (Beethoven's 5th!)",
    W:".-- W for Win",X:"-..- X marks the spot",Y:"-.-- Y = yes",Z:"--.. Z for Zzz",
    "0":"-----  5 dashes = 0 fingers","1":".----","2":"..---","3":"...--",
    "4":"....-","5":".....","6":"-....","7":"--...","8":"---..","9":"----.",
  };

  // Picks "today's" daily-challenge word. It turns today's date
  function getDailyWord() {
    const d = new Date();
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    return PRACTICE_WORDS[seed % PRACTICE_WORDS.length];
  }

  // AUDIO ENGINE
  class MorseAudio {
    constructor() {
      this.ctx = null;
      this.wpm = 18; // wpm = words per minute (speed)
    }
    // Audio can only start after the browser allows it (usually
    ensure() {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // "unit" is the length of one dot in seconds, calculated from
    get unit() {
      return 1200 / this.wpm / 1000;
    }
    // Plays a full Morse string (e.g. "... --- ...") as beeping sound.
    async play(code) {
      this.ensure();
      if (this.ctx.state === "suspended") await this.ctx.resume();
      const U = this.unit;
      let t = this.ctx.currentTime + 0.02;
      for (const sym of code.split("")) {
        if (sym === ".") {
          this._beep(t, U);
          t += U + U * 0.5;
        } else if (sym === "-") {
          this._beep(t, U * 3);
          t += U * 3 + U * 0.5;
        } else if (sym === " ") {
          t += U * 2;
        } else if (sym === "/") {
          t += U * 5;
        }
      }
    }
    _beep(start, dur) {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = "sine"; o.frequency.value = 600;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.3, start + 0.005);
      g.gain.setValueAtTime(0.3, start + dur - 0.005);
      g.gain.linearRampToValueAtTime(0, start + dur);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(start); o.stop(start + dur + 0.01);
    }
  }
  const audioEngine = new MorseAudio();

  // CONFETTI
  function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * W, y: Math.random() * H - H,
      r: Math.random() * 6 + 3,
      vx: (Math.random() - 0.5) * 4, vy: Math.random() * 4 + 2,
      color: ["#00FF9D","#00C8FF","#FFD700","#FF6B6B","#A855F7"][Math.floor(Math.random() * 5)],
      spin: Math.random() * Math.PI * 2, dSpin: (Math.random() - 0.5) * 0.2,
      life: 1,
    }));
    let frame;
    function tick() {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.spin += p.dSpin; p.life -= 0.008;
        if (p.life > 0 && p.y < H + 20) alive = true;
        ctx.save(); ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y); ctx.rotate(p.spin);
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        ctx.restore();
      });
      if (alive) frame = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    }
    tick();
  }

  // PARTICLE BACKGROUND
  function initParticleBG() {
    const canvas = document.getElementById('particleBG');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.8 + 1,
    }));
    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.fillStyle = "rgba(0,255,157,0.35)";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 140) {
          ctx.strokeStyle = `rgba(0,255,157,${0.18 * (1 - d / 140)})`;
          ctx.lineWidth = 0.6; ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }));
      requestAnimationFrame(draw);
    }
    draw();
    const ro = new ResizeObserver(() => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    });
    ro.observe(canvas);
  }

  // OSCILLOSCOPE
  function initOscilloscope(canvas, getState) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth || 400;
    const H = canvas.height = 40;
    let phase = 0;
    function draw() {
      const { playing } = getState();
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = playing ? "#00FF9D" : "rgba(0,255,157,0.35)";
      ctx.lineWidth = playing ? 1.5 : 1;
      ctx.shadowBlur = playing ? 8 : 0; ctx.shadowColor = "#00FF9D";
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const t = x / W;
        const p = phase + t * 8;
        const wave = Math.sin(p * Math.PI * 2) * 0.4 + Math.sin(p * Math.PI * 4.7) * 0.15 + Math.sin(p * Math.PI * 1.3) * 0.1;
        const y = H / 2 + wave * (playing ? H * 0.38 : H * 0.12);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.shadowBlur = 0;
      if (playing) phase += 0.025;
      requestAnimationFrame(draw);
    }
    draw();
  }

  // TOAST SYSTEM
  function showToast(msg, type = "success", dur = 2800) {
    const container = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    const icon = type === "success" ? "✓" : type === "error" ? "✗" : "ℹ";
    el.innerHTML = `<span>${icon}</span><span></span>`;
    el.querySelectorAll('span')[1].textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), dur);
  }

  // PROGRESS STORE
  function defaultProg() {
    return {
      totalPractice: 0,
      totalCorrect: 0,
      masteredLetters: [],
      letterAccuracy: {},
      dailyStreak: 0,
      recentAccuracy: [],
      highScore: 0,
    };
  }
  function loadProg() {
    try {
      const s = localStorage.getItem("dotdash_v2");
      return s ? JSON.parse(s) : defaultProg();
    } catch {
      return defaultProg();
    }
  }
  function saveProg(p) {
    try {
      localStorage.setItem("dotdash_v2", JSON.stringify(p));
    } catch {
      // localStorage can fail (private browsing, storage full) — safe to ignore
    }
  }
  let prog = loadProg();
  function updateProg(fn) {
    prog = fn({ ...prog });
    saveProg(prog);
  }

  // NAV / ROUTING
  const pages = document.querySelectorAll('.page');
  function nav(id) {
    pages.forEach(p => { p.hidden = p.dataset.page !== id; });
    document.querySelectorAll('.nav__link, .nav__mobile button').forEach(b => {
      b.classList.toggle('is-active', b.dataset.nav === id);
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.getElementById('navMobile').classList.remove('is-open');
    document.getElementById('burgerBtn').classList.remove('is-open');
    if (id === 'progress') renderProgress();
    if (id === 'daily') renderDaily();
  }
  document.addEventListener('click', e => {
    const target = e.target.closest('[data-nav]');
    if (target) nav(target.dataset.nav);
  });

  // build mobile nav mirror
  const navMobile = document.getElementById('navMobile');
  document.querySelectorAll('#navLinks .nav__link').forEach(btn => {
    const clone = document.createElement('button');
    clone.textContent = btn.textContent;
    clone.dataset.nav = btn.dataset.nav;
    navMobile.appendChild(clone);
  });
  document.getElementById('burgerBtn').addEventListener('click', () => {
    navMobile.classList.toggle('is-open');
    document.getElementById('burgerBtn').classList.toggle('is-open');
  });
  window.addEventListener('scroll', () => {
    document.getElementById('nav').classList.toggle('is-scrolled', window.scrollY > 20);
  });

  // HOME SECTION
  function initHome() {
    const words = ["SOS", "HI", "CQ", "DE"];
    let wordIdx = 0;
    const label = document.getElementById('signalLabel');
    const bars = document.getElementById('signalBars');

    async function playWord() {
      const w = words[wordIdx % words.length];
      wordIdx++;
      label.textContent = w + ':';
      const code = textToMorse(w);
      const syms = code.split('');
      bars.innerHTML = '';
      const barEls = syms.map(s => {
        if (s === ' ') {
          const gap = document.createElement('span');
          gap.style.width = '6px';
          bars.appendChild(gap);
          return null;
        }
        const el = document.createElement('div');
        el.className = 'signal-bar';
        el.style.width = (s === '.' ? '10px' : '28px');
        bars.appendChild(el);
        return el;
      });
      for (let i = 0; i < syms.length; i++) {
        const s = syms[i];
        if (barEls[i]) barEls[i].classList.add('is-lit');
        await new Promise(r => setTimeout(r, s === '.' ? 200 : s === '-' ? 500 : 100));
        if (barEls[i]) barEls[i].classList.remove('is-lit');
        await new Promise(r => setTimeout(r, 100));
      }
      await new Promise(r => setTimeout(r, 1200));
      playWord();
    }
    setTimeout(playWord, 600);

    const features = [
      { id: "converter", icon: "⇄", title: "Text ↔ Morse Converter", desc: "Live bidirectional conversion with one-click copy and audio playback.", color: "green" },
      { id: "learn", icon: "◈", title: "Interactive Learn Mode", desc: "Full A–Z, 0–9, punctuation — tap any character to hear it, see the waveform.", color: "green" },
      { id: "practice", icon: "✎", title: "Drill Mode", desc: "Randomized word drills with instant scoring and mastery tracking.", color: "green" },
      { id: "challenge", icon: ICONS.bolt, title: "Speed Challenge", desc: "Race the clock — 30s/60s/120s. Beat your high score, build streaks.", color: "blue" },
      { id: "ai-tutor", icon: "◎", title: "AI Tutor", desc: "Ask why K is '-.-', get quizzes, history, tips.", color: "green" },
      { id: "daily", icon: "◷", title: "Daily Challenge", desc: "One fresh puzzle every day. Build your streak and sharpen recall.", color: "blue" },
    ];
    const grid = document.getElementById('featureGrid');
    features.forEach(f => {
      const card = document.createElement('div');
      card.className = `feature-card${f.color === 'blue' ? ' feature-card--blue' : ''}`;
      card.dataset.nav = f.id;
      card.innerHTML = `
        <div class="feature-card__shimmer"></div>
        <div class="feature-card__icon">${f.icon}</div>
        <div class="feature-card__title">${f.title}</div>
        <div class="feature-card__desc">${f.desc}</div>
        <div class="feature-card__arrow">→</div>`;
      grid.appendChild(card);
    });
  }

  // CONVERTER SECTION
  function initConverter() {
    const textInput = document.getElementById('textInput');
    const morseInput = document.getElementById('morseInput');
    const textCount = document.getElementById('textCount');
    const morseCount = document.getElementById('morseCount');
    const oscCard = document.getElementById('oscilloscopeCard');
    const oscCanvas = document.getElementById('oscilloscope');
    let playing = false;
    initOscilloscope(oscCanvas, () => ({ playing }));

    // Each box only ever converts INTO the other box — it never rewrites
    // itself. (An earlier "auto-detect Morse-shaped text" version caused
    // a bug: typing a single "." or "-" as plain text is valid Morse for
    // E/T, so it kept overwriting the Plain Text box the moment you typed
    // it. Keeping each box one-directional avoids that entirely.)
    function syncCounts() {
      textCount.textContent = `${textInput.value.length} chars`;
      morseCount.textContent = `${morseInput.value.length} chars`;
      oscCard.style.display = morseInput.value ? 'block' : 'none';
    }

    textInput.addEventListener('input', () => {
      morseInput.value = textInput.value ? textToMorse(textInput.value) : '';
      syncCounts();
    });
    morseInput.addEventListener('input', () => {
      textInput.value = morseInput.value ? morseToText(morseInput.value) : '';
      syncCounts();
    });

    document.getElementById('copyText').addEventListener('click', () => {
      navigator.clipboard.writeText(textInput.value).then(() => showToast('Copied!', 'success'));
    });
    document.getElementById('copyMorse').addEventListener('click', () => {
      navigator.clipboard.writeText(morseInput.value).then(() => showToast('Copied!', 'success'));
    });
    document.getElementById('clearBoth').addEventListener('click', () => {
      textInput.value = ''; morseInput.value = '';
      textCount.textContent = '0 chars'; morseCount.textContent = '0 chars';
      oscCard.style.display = 'none';
    });
    document.getElementById('playConverter').addEventListener('click', async () => {
      if (!morseInput.value || playing) return;
      playing = true;
      await audioEngine.play(morseInput.value);
      playing = false;
    });
  }

  // LEARN SECTION
  function renderLearnGrid(filter = 'all') {
    const grid = document.getElementById('learnGrid');
    const allChars = Object.keys(MORSE); // every key in the MORSE lookup table, e.g. ["A","B","C",...]
    let filtered = allChars;
    // .filter() keeps only the characters that pass a test.
    if (filter === 'alpha') filtered = allChars.filter(c => /[A-Z]/.test(c));
    else if (filter === 'nums') filtered = allChars.filter(c => /[0-9]/.test(c));
    else if (filter === 'punct') filtered = allChars.filter(c => !/[A-Z0-9]/.test(c));
    else if (filter === 'mastered') filtered = allChars.filter(c => prog.masteredLetters.includes(c));

    grid.innerHTML = ''; // wipe out whatever tiles were there before
    // Build one tile <div> per character and drop it into the grid.
    filtered.forEach(c => {
      const mastered = prog.masteredLetters.includes(c);
      const tile = document.createElement('div'); // makes a new, empty HTML element in memory
      tile.className = `learn-tile${mastered ? ' is-mastered' : ''}`;
      tile.innerHTML = `
        ${mastered ? '<span class="learn-tile__check">✓</span>' : ''}
        <div class="learn-tile__char">${c}</div>
        <div class="learn-tile__code">${MORSE[c]}</div>`;
      tile.addEventListener('click', () => openLearnModal(c)); // clicking this tile opens the pop-up
      grid.appendChild(tile); // actually place it on the page
    });
  }

  // Fills in and opens the pop-up box for one character.
  function openLearnModal(c) {
    const modal = document.getElementById('learnModal');
    document.getElementById('modalChar').textContent = c;
    document.getElementById('modalCode').textContent = MORSE[c];
    const visual = document.getElementById('modalVisual');
    visual.innerHTML = '';
    // Draw one little bar per dot/dash — short bar for ".", long bar for "-".
    MORSE[c].split('').forEach(sym => {
      const bar = document.createElement('div');
      bar.className = 'morse-bar';
      bar.style.width = sym === '.' ? '14px' : '38px';
      visual.appendChild(bar);
    });
    document.getElementById('modalTip').textContent = CHAR_TIPS[c] || '';
    const masterBtn = document.getElementById('modalMaster');
    const isMastered = prog.masteredLetters.includes(c);
    masterBtn.textContent = isMastered ? '✗ Unmark' : '✓ Mark Mastered';
    masterBtn.className = `btn ${isMastered ? 'btn--danger' : 'btn--secondary'}`;
    // Toggle mastered on/off, save it, then redraw the modal + grid
    masterBtn.onclick = () => {
      if (prog.masteredLetters.includes(c)) {
        updateProg(p => ({ ...p, masteredLetters: p.masteredLetters.filter(x => x !== c) }));
        showToast(`${c} removed from mastered`, 'info');
      } else {
        updateProg(p => ({ ...p, masteredLetters: [...p.masteredLetters, c] }));
        showToast(`${c} marked as mastered! ✓`, 'success');
      }
      openLearnModal(c);
      renderLearnGrid(document.querySelector('#learnFilters .chip.is-active').dataset.filter);
    };
    document.getElementById('modalHear').onclick = () => audioEngine.play(MORSE[c]);
    modal.hidden = false; // un-hide the pop-up (it starts `hidden` in the HTML)
  }

  // Switches the Learn page on: draws the first grid and wires up
  function initLearn() {
    renderLearnGrid('all');
    document.getElementById('learnFilters').addEventListener('click', e => {
      // e.target is whatever exact element was clicked; .closest('.chip')
      const btn = e.target.closest('.chip');
      if (!btn) return;
      document.querySelectorAll('#learnFilters .chip').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      renderLearnGrid(btn.dataset.filter);
    });
    // Clicking the dark overlay behind the modal (but not the modal
    document.getElementById('learnModal').addEventListener('click', e => {
      if (e.target.id === 'learnModal') document.getElementById('learnModal').hidden = true;
    });
    document.getElementById('modalClose').addEventListener('click', () => {
      document.getElementById('learnModal').hidden = true;
    });
  }

  // PRACTICE SECTION
  function initPractice() {
    // "state" variables — plain variables that remember the current
    let mode = 'word-to-morse';
    let word = PRACTICE_WORDS[Math.floor(Math.random() * PRACTICE_WORDS.length)]; // pick any random word from the list
    let correct = 0;
    let total = 0;
    let showHint = false;

    const qEl = document.getElementById('practiceQuestion');
    const playBtn = document.getElementById('practicePlay');
    const hintBox = document.getElementById('practiceHint');
    const answerLabel = document.getElementById('practiceAnswerLabel');
    const input = document.getElementById('practiceInput');
    const feedback = document.getElementById('practiceFeedback');
    const correctEl = document.getElementById('practiceCorrect');
    const totalEl = document.getElementById('practiceTotal');
    const accEl = document.getElementById('practiceAcc');

    // What to SHOW as the question depends on which mode we're in.
    function question() { return mode === 'word-to-morse' ? word : textToMorse(word); }
    // What the CORRECT answer should be — the opposite of question().
    function expected() { return mode === 'word-to-morse' ? textToMorse(word) : word; }

    // Repaints the question box, labels, and hint to match current state.
    function render() {
      qEl.textContent = question();
      qEl.classList.toggle('is-morse', mode === 'morse-to-word');
      playBtn.hidden = mode !== 'word-to-morse';
      answerLabel.textContent = mode === 'word-to-morse' ? 'YOUR MORSE CODE:' : 'YOUR WORD:';
      input.placeholder = mode === 'word-to-morse' ? 'Type Morse code (dots, dashes, spaces)...' : 'Type the word...';
      hintBox.hidden = !showHint;
      hintBox.textContent = 'Hint: ' + expected();
      feedback.hidden = true;
    }

    // Picks a fresh random word and resets the input box for round 2, 3, 4...
    function newWord() {
      word = PRACTICE_WORDS[Math.floor(Math.random() * PRACTICE_WORDS.length)];
      input.value = ''; showHint = false;
      render();
      input.focus();
    }

    // Grades the current answer, updates the scoreboard, and saves
    function check() {
      const a = input.value.trim().toUpperCase(); // what the user typed
      const e = expected().trim().toUpperCase();   // the correct answer
      const ok = a === e;
      feedback.hidden = false;
      feedback.className = `feedback-box ${ok ? 'feedback-box--correct' : 'feedback-box--wrong'}`;
      feedback.textContent = ok ? '✓ Correct! Great job!' : '✗ Not quite — ' + expected();
      total++;
      const letter = word[0]; // track accuracy per starting-letter, used on the Progress page
      updateProg(p => ({
        ...p, // "..." (spread) copies every existing field, then we override a few below
        totalPractice: p.totalPractice + 1,
        totalCorrect: p.totalCorrect + (ok ? 1 : 0),
        letterAccuracy: { ...p.letterAccuracy, [letter]: {
          t: (p.letterAccuracy[letter]?.t || 0) + 1, // t = times tried; the ?. means "if it doesn't exist yet, don't crash"
          c: (p.letterAccuracy[letter]?.c || 0) + (ok ? 1 : 0), // c = times correct
        } },
        recentAccuracy: [...p.recentAccuracy.slice(-19), (ok ? 100 : 0)], // keep only the last 20 results
      }));
      if (ok) {
        correct++;
        showToast('Correct! ✓', 'success');
        launchConfetti();
      } else {
        showToast(`Nope — answer: ${expected()}`, 'error', 4000);
        audioEngine.play('...');
      }
      correctEl.textContent = correct;
      totalEl.textContent = total;
      accEl.textContent = total > 0 ? Math.round(correct / total * 100) + '%' : '—';
    }

    // Wire up the "Word → Morse" / "Morse → Word" tab buttons.
    document.querySelectorAll('.tab-switch__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-switch__btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        mode = btn.dataset.mode;
        newWord();
      });
    });
    playBtn.addEventListener('click', () => audioEngine.play(textToMorse(word)));
    document.getElementById('practiceCheck').addEventListener('click', check);
    document.getElementById('practiceNext').addEventListener('click', newWord);
    document.getElementById('practiceHintBtn').addEventListener('click', e => {
      showHint = !showHint;
      hintBox.hidden = !showHint;
      e.target.textContent = showHint ? 'Hide Hint' : 'Show Hint';
    });
    // Let the Enter key submit the answer, same as clicking "Check Answer".
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        check();
      }
    });

    render(); // paint the very first question as soon as the page loads
  }

  // CHALLENGE SECTION
  function initChallenge() {
    // State for this page: how long the round is, time left, whether
    let duration = 30;
    let timeLeft = 30;
    let running = false;
    let word = '';
    let score = 0;
    let correct = 0;
    let total = 0;
    let streak = 0;
    let timerId = null; // holds the ID returned by setInterval, so we can stop it later

    const timerDisplay = document.getElementById('timerDisplay');
    const wordBox = document.getElementById('challengeWordBox');
    const wordEl = document.getElementById('challengeWord');
    const streakEl = document.getElementById('challengeStreak');
    const input = document.getElementById('challengeInput');
    const scoreEl = document.getElementById('challengeScore');
    const correctEl = document.getElementById('challengeCorrect');
    const totalEl = document.getElementById('challengeTotal');
    const accEl = document.getElementById('challengeAcc');
    const highEl = document.getElementById('challengeHigh');

    highEl.textContent = prog.highScore; // show the saved high score right away

    function getWord() { return PRACTICE_WORDS[Math.floor(Math.random() * PRACTICE_WORDS.length)]; }
    // Turns a number of seconds into "M:SS" text, e.g. 90 -> "1:30".
    function fmt(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }

    // Repaints every number/label on the page from the current state.
    function updateDisplay() {
      timerDisplay.textContent = fmt(timeLeft);
      timerDisplay.classList.toggle('is-danger', timeLeft <= 10 && running); // turns the clock red under 10s
      wordBox.classList.toggle('is-running', running);
      wordEl.textContent = word || 'Press Start to begin';
      streakEl.textContent = streak;
      scoreEl.textContent = score; correctEl.textContent = correct; totalEl.textContent = total;
      accEl.textContent = total > 0 ? Math.round(correct / total * 100) + '%' : '—';
      input.disabled = !running;
      input.placeholder = running ? 'Type Morse code and press Enter…' : 'Start the challenge first…';
      input.style.opacity = running ? 1 : 0.5;
    }

    // Begins a new timed round.
    function start() {
      word = getWord(); input.value = '';
      timeLeft = duration; running = true;
      score = 0; correct = 0; total = 0; streak = 0;
      updateDisplay(); input.focus();
      clearInterval(timerId); // stop any leftover timer from a previous round first
      // setInterval repeats the function inside every 1000ms (1 second)
      timerId = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
          clearInterval(timerId); running = false; timeLeft = 0;
          updateDisplay();
          // Time's up — check if this run beat the saved high score.
          if (score > prog.highScore) {
            updateProg(p => ({ ...p, highScore: score }));
            highEl.textContent = score;
            showToast(`New high score: ${score}!`, 'success', 4000);
            launchConfetti();
          } else if (score > 0) {
            showToast(`Challenge done! Score: ${score}`, 'info', 3000);
          }
          return;
        }
        updateDisplay();
      }, 1000);
    }

    // Stops the round early and puts everything back to zero.
    function reset() {
      clearInterval(timerId); running = false;
      timeLeft = duration; word = ''; score = 0; correct = 0; total = 0; streak = 0;
      updateDisplay();
    }

    // The 30s / 60s / 120s duration picker buttons.
    document.querySelectorAll('[data-duration]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (running) return; // don't allow changing duration mid-round
        document.querySelectorAll('[data-duration]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        duration = Number(btn.dataset.duration);
        timeLeft = duration;
        updateDisplay();
      });
    });

    document.getElementById('challengeStart').addEventListener('click', start);
    document.getElementById('challengeReset').addEventListener('click', reset);
    // Pressing Enter in the answer box submits it — same idea as Practice mode.
    input.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (!running || !word) return;
      const expected = textToMorse(word).toUpperCase();
      const a = input.value.trim().toUpperCase();
      const ok = a === expected;
      total++;
      if (ok) {
        // Each correct answer is worth more the longer your current
        correct++; score += 10 + streak * 2; streak++;
        showToast(`+${10 + (streak - 1) * 2} pts! Streak: ${streak}`, 'success', 1200);
      } else {
        streak = 0; // a wrong answer resets the streak back to 0
        showToast(`✗ ${expected}`, 'error', 2000);
      }
      word = getWord(); input.value = '';
      updateDisplay();
    });

    updateDisplay(); // paint the initial "Press Start" state
  }

  // AI TUTOR SECTION
  // Talks to Google's Gemini via our own Cloudflare Worker (see
  // src/index.js) — the API key never reaches the browser.
  // localTutorReply() further below is only an offline fallback if that
  // call fails (Worker not deployed yet, no internet, quota hit, etc).
  async function fetchAIReply(message, history) {
    const res = await fetch('/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) throw new Error(`Tutor function responded with ${res.status}`);
    const data = await res.json();
    if (!data.reply) throw new Error('Tutor function returned no reply');
    return data.reply;
  }

  function initAITutor() {
    const chatWindow = document.getElementById('chatWindow');
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSend');
    const suggestionsEl = document.getElementById('suggestions');

    const history = []; // just a running log of the conversation (not sent anywhere)

    // Adds one chat bubble to the window. `role` is either 'user' or 'ai',
    function addMessage(role, text) {
      history.push({ role, text });
      const row = document.createElement('div');
      row.className = `chat-msg ${role === 'user' ? 'chat-msg--user' : ''}`;
      const avatar = document.createElement('div');
      avatar.className = `chat-avatar chat-avatar--${role === 'ai' ? 'ai' : 'user'}`;
      avatar.innerHTML = role === 'ai' ? ICONS.bolt : 'U';
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble chat-bubble--${role === 'ai' ? 'ai' : 'user'}`;
      bubble.innerHTML = formatMsg(text);
      row.appendChild(avatar); row.appendChild(bubble);
      chatWindow.appendChild(row);
      chatWindow.scrollTop = chatWindow.scrollHeight; // auto-scroll down to the newest message
    }

    // Turns plain reply text into safe HTML: escapes any stray < > &
    function formatMsg(t) {
      const escaped = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      // Strip stray markdown the model sometimes adds despite being told to use plain text
      const noMd = escaped
        .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold**
        .replace(/\*(.+?)\*/g, '$1')       // *italic*
        .replace(/^#{1,6}\s+/gm, '')       // # headers
        .replace(/^\s*[-*]\s+/gm, '• ');   // markdown bullets -> a plain bullet char
      const withCode = noMd.replace(/([.\-]{2,}(?:\s[.\-]+)*)/g, m => {
        if (/^[.\- /]+$/.test(m)) return `<span class="morse-inline">${m}</span>`;
        return m;
      });
      return withCode.replace(/\n/g, '<br>');
    }

    // Shows the little bouncing "..." bubble while we "think" (see send()
    function showTyping() {
      const row = document.createElement('div');
      row.className = 'chat-msg';
      row.id = 'typingRow';
      row.innerHTML = `<div class="chat-avatar chat-avatar--ai">${ICONS.bolt}</div><div class="chat-bubble chat-bubble--ai chat-typing"><span></span><span></span><span></span></div>`;
      chatWindow.appendChild(row);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
    function hideTyping() { document.getElementById('typingRow')?.remove(); }

    // ---- THE "AI" ITSELF ----
    function localTutorReply(msg) {
      const m = msg.toLowerCase(); // compare everything in lowercase so "SOS" and "sos" both match

      // Looks for phrasing like "why is K" or "K is -.-"
      const letterMatch = m.match(/why is\s+([a-z0-9])\b/i) || m.match(/\b([a-z0-9])\s+is\s+[.\-]/i);
      if (letterMatch) {
        const ch = letterMatch[1].toUpperCase();
        if (MORSE[ch]) {
          const tip = CHAR_TIPS[ch] ? ` ${CHAR_TIPS[ch]}.` : '';
          return `${ch} is ${MORSE[ch]} in Morse code.${tip}\n\nCommon letters like E and T get the shortest codes (. and -), while rarer letters get longer ones — a Huffman-like optimization from 1836.`;
        }
      }

      if (/quiz/.test(m)) {
        const chars = Object.keys(MORSE).filter(c => /[A-Z]/.test(c));
        const picks = [];
        while (picks.length < 3) { // keep picking random letters until we have 3 different ones
          const c = chars[Math.floor(Math.random() * chars.length)];
          if (!picks.includes(c)) picks.push(c);
        }
        return `Quick quiz — what's the Morse code for each?\n\n1. ${picks[0]}\n2. ${picks[1]}\n3. ${picks[2]}\n\nType your answers separated by spaces, and I'll check them if you paste the codes back!`;
      }

      if (/sos/.test(m)) {
        return `SOS is ... --- ... — three dots, three dashes, three dots.\n\nIt was adopted in 1908 as the international distress signal because the rhythm is easy to recognize even under noisy or weak radio conditions — not because it stands for "Save Our Ship" (that's a myth, it was chosen purely for its simple, unmistakable pattern).`;
      }

      if (/tip|beginner|start|how to learn/.test(m)) {
        return `A few tips for learning Morse:\n\n1. Learn by sound, not by looking at dots and dashes — your ear picks up rhythm faster than your eye.\n2. Start with E (.) and T (-), the two shortest codes, then build outward.\n3. Practice in short daily sessions rather than long cramming sessions.\n4. Use the Practice and Challenge modes here to build muscle memory both ways: text→Morse and Morse→text.`;
      }

      if (/history|invent|1836|1844|titanic/.test(m)) {
        return `Morse code was developed in the 1830s by Samuel Morse and Alfred Vail for the electric telegraph. The first long-distance message, "What hath God wrought," was sent in 1844. It became the international standard in 1865, and famously carried the Titanic's distress call in 1912. Commercial Morse use ended around 1999, but it's still used today by amateur radio operators.`;
      }

      if (/practice word/.test(m)) {
        const picks = [];
        while (picks.length < 5) {
          const w = PRACTICE_WORDS[Math.floor(Math.random() * PRACTICE_WORDS.length)];
          if (!picks.includes(w)) picks.push(w);
        }
        return `Here are 5 words to practice:\n\n${picks.join(', ')}\n\nTry converting each to Morse in the Practice tab, then check yourself.`;
      }

      // None of the keyword checks above matched — fall back to a generic reply.
      return `I can help explain why a letter has its code, give you a quiz, share Morse history, or suggest practice words. Try asking something like "Why is K -.-?" or "Give me a quiz."`;
    }

    // Handles sending a message: show it, call the real AI tutor via the
    async function send(msg) {
      const m = (msg ?? input.value).trim(); // use the suggestion-chip text if given, otherwise the textbox
      if (!m) return;
      input.value = '';
      addMessage('user', m);
      showTyping();

      let reply;
      try {
        // Send the last 10 messages of history so far (before this one)
        const historyForApi = history.slice(0, -1).slice(-10);
        reply = await fetchAIReply(m, historyForApi);
      } catch (err) {
        console.warn('AI tutor call failed, using offline fallback:', err);
        await new Promise(r => setTimeout(r, 300 + Math.random() * 300)); // small pause so it doesn't feel instant
        reply = localTutorReply(m);
      }

      hideTyping();
      addMessage('ai', reply);
    }

    // Build the row of quick-question suggestion buttons.
    const suggestions = ["Why is SOS ... --- ...?", "Give me a quiz", "Why is K -.-?", "Beginner tips", "Morse code history", "Practice words for beginners"];
    suggestions.forEach(s => {
      const chip = document.createElement('button');
      chip.className = 'suggestion-chip';
      chip.textContent = s;
      chip.addEventListener('click', () => send(s)); // clicking a chip sends it as if you'd typed it
      suggestionsEl.appendChild(chip);
    });

    addMessage('ai', "Hello! I'm DotDash AI, your Morse code tutor.\n\nI can explain why letters have specific codes, create quizzes, help you decode messages, and share practice tips.\n\nWhat would you like to learn today?");

    sendBtn.addEventListener('click', () => send());
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
  }

  // DAILY SECTION
  function renderDaily() {
    const word = getDailyWord(); // same word for everyone, changes at midnight
    const morse = textToMorse(word);
    const today = new Date().toDateString(); // e.g. "Sun Jul 26 2026" — used as a simple "which day is it" key
    let done = localStorage.getItem('dotdash_daily') === today; // did we already solve TODAY's puzzle?

    document.getElementById('dailyDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('dailyMorse').textContent = morse;
    initOscilloscope(document.getElementById('dailyOscilloscope'), () => ({ playing: false }));

    const input = document.getElementById('dailyInput');
    const doneBox = document.getElementById('dailyDone');
    const doneTitle = document.getElementById('dailyDoneTitle');
    const inputRow = input.closest('.daily-input-row');

    input.value = '';
    input.disabled = done; // lock the input if already solved today
    doneBox.hidden = !done;
    if (done) doneTitle.textContent = `Completed! It was "${word}"`;

    const checkBtn = document.getElementById('dailyCheck');
    checkBtn.disabled = done;
    checkBtn.onclick = () => {
      const a = input.value.trim().toUpperCase();
      if (!a) {
        showToast('Enter your answer!', 'info');
        return;
      }
      if (a === word) {
        // Correct! Remember today's date so refreshing the page (or
        localStorage.setItem('dotdash_daily', today);
        input.disabled = true; checkBtn.disabled = true;
        doneBox.hidden = false;
        doneTitle.textContent = `Completed! It was "${word}"`;
        showToast('Daily challenge completed!', 'success', 4000);
        launchConfetti();
      } else {
        // Wrong — do a little "shake" animation on the input row for feedback.
        inputRow.classList.add('is-shaking');
        showToast('Not quite! Keep trying.', 'error');
        setTimeout(() => inputRow.classList.remove('is-shaking'), 400);
      }
    };
    input.onkeydown = e => { if (e.key === 'Enter') checkBtn.click(); };
    document.getElementById('dailyPlay').onclick = () => audioEngine.play(morse);
  }

  // PROGRESS SECTION
  function renderProgress() {
    const acc = prog.totalPractice > 0 ? Math.round(prog.totalCorrect / prog.totalPractice * 100) : 0;

    // The 4 big stat cards at the top — build them from a small
    const statsGrid = document.getElementById('progressStats');
    statsGrid.innerHTML = '';
    [
      [ICONS.pencil, prog.totalPractice, 'Total Practice', 'var(--green)'],
      [ICONS.target, acc + '%', 'Overall Accuracy', 'var(--green)'],
      [ICONS.star, prog.masteredLetters.length, 'Mastered', 'var(--gold)'],
      [ICONS.trophy, prog.highScore, 'High Score', 'var(--blue)'],
    ].forEach(([icon, val, label, color]) => {
      const card = document.createElement('div');
      card.className = 'glass-card stat-card';
      card.innerHTML = `<div class="stat-card__icon">${icon}</div><div class="stat-card__val" style="color:${color}">${val}</div><div class="stat-card__label">${label}</div>`;
      statsGrid.appendChild(card);
    });

    // The little bar chart: one bar per recent practice result (0-100%).
    const bars = prog.recentAccuracy.length > 0 ? prog.recentAccuracy.slice(-10) : [0, 0, 0, 0, 0];
    document.getElementById('accuracySpan').textContent = `(last ${bars.length} sessions)`;
    const barChart = document.getElementById('accuracyBars');
    barChart.innerHTML = '';
    bars.forEach((v, i) => {
      const col = document.createElement('div');
      col.className = 'bar-col';
      col.innerHTML = `<div class="bar-col__fill" style="height:${Math.max(4, v)}%"></div><div class="bar-col__idx">${i + 1}</div>`;
      barChart.appendChild(col);
    });

    // "Weak" letters = tried at least twice with under 60% accuracy,
    const weakLetters = Object.entries(prog.letterAccuracy)
      .filter(([, v]) => v.t >= 2 && (v.c / v.t) < 0.6)
      .sort(([, a], [, b]) => (a.c / a.t) - (b.c / b.t)).slice(0, 8);
    const weakEl = document.getElementById('weakLetters');
    weakEl.innerHTML = weakLetters.length === 0
      ? '<p>No weak letters yet. Keep practicing to see insights here!</p>'
      : weakLetters.map(([ch, v]) => `<div class="pill--weak"><span>${ch}</span>${Math.round(v.c / v.t * 100)}% accuracy</div>`).join('');

    const masteredEl = document.getElementById('masteredLetters');
    masteredEl.innerHTML = prog.masteredLetters.length === 0
      ? '<p>Mark letters as mastered in Learn mode!</p>'
      : prog.masteredLetters.map(c => `<div class="pill--mastered">${c} ${MORSE[c]}</div>`).join('');
  }

  // Wires up the single "Reset All Progress" button on this page.
  function initProgress() {
    document.getElementById('progressReset').addEventListener('click', () => {
      if (!confirm('Reset all progress? Cannot be undone.')) return; // confirm() is a built-in browser popup
      updateProg(() => defaultProg()); // wipe saved stats back to the starting defaults
      showToast('Progress reset', 'info');
      renderProgress(); // repaint the page immediately with the now-empty stats
    });
  }

  // ABOUT SECTION
  function initAbout() {
    // Quick facts row (36 characters, 600 Hz tone, etc.)
    const facts = document.getElementById('aboutFacts');
    [["36", "Characters in full Morse"], ["600 Hz", "Standard tone frequency"], ["1:3", "Dot to dash ratio"], ["1200 WPM", "Max Morse speed recorded"]]
      .forEach(([v, l]) => {
        const row = document.createElement('div');
        row.className = 'fact-row';
        row.innerHTML = `<span class="fact-row__l">${l}</span><span class="fact-row__v">${v}</span>`;
        facts.appendChild(row);
      });

    // History timeline — an array of {year, event, desc} objects.
    const timeline = [
      { year: "1836", event: "Morse & Vail invent", desc: "Samuel Morse and Alfred Vail develop the first practical electric telegraph and create the original Morse code." },
      { year: "1844", event: "First telegraph message", desc: '"What hath God wrought" — first long-distance Morse message sent from Washington D.C. to Baltimore.' },
      { year: "1865", event: "International standard", desc: "The International Morse Code is established at the Paris Telegraph Conference, still used today." },
      { year: "1912", event: "SOS saves lives", desc: "RMS Titanic operators transmit the iconic SOS distress signal — Morse code's most famous use." },
      { year: "1999", event: "Commercial era ends", desc: "The last commercial Morse radio station (KPH) broadcasts its final message." },
      { year: "2025", event: "DotDash AI launches", desc: "AI-powered Morse learning arrives — interactive, intelligent, and built for the modern learner." },
    ];
    const tlEl = document.getElementById('timeline');
    timeline.forEach((t, i) => {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      item.innerHTML = `
        <div class="timeline-item__rail">
          <div class="timeline-item__dot"></div>
          ${i < timeline.length - 1 ? '<div class="timeline-item__line"></div>' : ''}
        </div>
        <div>
          <div class="timeline-item__year">${t.year}</div>
          <div class="timeline-item__event">${t.event}</div>
          <div class="timeline-item__desc">${t.desc}</div>
        </div>`;
      // No connecting line after the very last timeline entry.
      item.style.paddingBottom = i < timeline.length - 1 ? '28px' : '0';
      tlEl.appendChild(item);
    });

    // Fun facts cards at the bottom of the page.
    const funFacts = [
      { e: ICONS.type, t: "E and T have the shortest codes (. and -) because they're the most common letters in English — a Huffman-like optimization from 1836." },
      { e: ICONS.radio, t: "Amateur radio operators still use Morse today. It can work at signal strengths too weak for voice communication." },
      { e: ICONS.music, t: "The standard CW (continuous wave) Morse frequency is 600 Hz, close to a musical D♭ note." },
      { e: ICONS.bolt, t: "The fastest Morse operator recorded could send at 75+ words per minute — nearly as fast as average typing." },
    ];
    const ffEl = document.getElementById('funFacts');
    funFacts.forEach(f => {
      const card = document.createElement('div');
      card.className = 'glass-card fun-fact';
      card.innerHTML = `<div class="fun-fact__emoji">${f.e}</div><div class="fun-fact__text">${f.t}</div>`;
      ffEl.appendChild(card);
    });
  }

  // INIT
  document.addEventListener('DOMContentLoaded', () => {
    initParticleBG();
    initHome();
    initConverter();
    initLearn();
    initPractice();
    initChallenge();
    initAITutor();
    initProgress();
    initAbout();
    nav('home');
  });
})(); // <- end of the big wrapper function from line 1; the site is now live.
