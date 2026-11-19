/* ==========================================================
   ELEN AWARDS 2026 — THE 9 MONTHS EDITION
   JavaScript puro, sem dependências.

   COMO EDITAR:
   - Categorias ............ array AWARDS
   - Arquivo confidencial .. array FILES (fotos: assets/images/registro-00X.jpg)
   - Cenas animadas ........ assets/sprites/ceremony.js (tapete e palco)
   - Carta ................. dentro do index.html (#loveLetter)
   ========================================================== */
(() => {
  "use strict";

  const STORAGE_KEY = "elenAwards2026.progress.v2";
  const IMAGE_FOLDER = "assets/images/";

  /* ---------- CONTEÚDO: CATEGORIAS ---------- */
  const AWARDS = [
    {
      id: "protagonista", number: "01", trophy: "🏆",
      title: "Melhor Protagonista", winner: "ELEN", label: "VENCEDORA",
      tag: "DRAMA, COMÉDIA E TUDO MAIS",
      description: "Por ser a personagem principal de uma história que o protagonista masculino precisava viver.",
      joke: "Não existe concorrência, você sempre será a número 1.",
      message: "Você é a minha pessoa favorita."
    },
    {
      id: "origem", number: "02", trophy: "🎬",
      title: "Melhor Cena de Origem", winner: "LINKCE / UBER / POLICIA", label: "VENCEDORES",
      tag: "MELHOR COMEÇO DE HISTÓRIA",
      description: "Por dar início a uma sequência de acontecimentos que acabaria mudando completamente a história.",
      joke: "O roteiro parecia simples. Nem os maiores diretores pensariam nesse enredo.",
      message: "Eu repetiria aquele começo quantas vezes fosse preciso."
    },
    {
      id: "cinema", number: "03", trophy: "🍿",
      title: "Melhor Roteiro Cinematográfico", winner: "ZOOTOPIA 2", label: "VENCEDORA",
      tag: "22/02/2026",
      description: "Cinema, nervosismo, vários policiais por perto, uma pergunta importante e um SIM inesquecível. Data oficial: 22/02/2026.",
      joke: "A produção investiu em suspense. O protagonista quase teve um ataque cardíaco.",
      message: "22 de fevereiro de 2026: o dia em que ficou oficial."
    },
    {
      id: "hamburguer", number: "04", trophy: "🍔",
      title: "Melhor Produção Culinária", winner: "HAMBÚRGUER QUEIMADO", label: "VENCEDOR",
      tag: "EXPERIÊNCIA GASTRONÔMICA",
      description: "Uma produção gastronômica experimental que provou que nem toda receita precisa dar certo para virar uma grande lembrança.",
      joke: "O restaurante não recebeu estrelas Michelin, mas recebeu uma memória inesquecível.",
      message: "Até quando dá errado, com você vira boa lembrança."
    },
    {
      id: "confianca", number: "05", trophy: "🤝",
      title: "Melhor Demonstração de Confiança", winner: "SEGURAR A MÃO", label: "VENCEDORA",
      tag: "MELHOR MOMENTO SUTIL",
      description: "Um gesto simples que carregava muito mais significado do que parecia.",
      joke: "Uma mão segurada. Um coração fazendo coisas que não estavam no planejamento.",
      message: "Obrigado por confiar em mim e deixar eu ficar ao seu lado."
    },
    {
      id: "investimento", number: "06", trophy: "💝",
      title: "Melhor Investimento Emocional", winner: "PRESENTES, CARTAS E SURPRESAS", label: "VENCEDORES",
      tag: "DIREÇÃO DE ARTE",
      description: "Todos os presentes, cartas, sites, QR codes e experiências que preparei para você.",
      joke: "O orçamento foi baixo. O nível de dedicação foi completamente fora de controle.",
      message: "Cada detalhe foi uma tentativa de mostrar o quanto você é importante."
    },
    {
      id: "internacional", number: "07", trophy: "🌎",
      title: "Melhor Parceria Internacional", winner: "ELEN & CARLOS", label: "VENCEDORES",
      tag: "PRODUÇÃO MULTILÍNGUE",
      description: "Espanhol, francês, inglês e uma quantidade considerável de conversas que não precisam de tradução.",
      joke: "Você domina os idiomas. Eu ainda está baixando o pacote de idiomas.",
      message: "Que a gente ainda conheça muitos lugares juntos."
    },
    {
      id: "sintonia", number: "08", trophy: "✨",
      title: "Melhor Sintonia e Companheirismo", winner: "ELEN & CARLOS", label: "VENCEDORES",
      tag: "QUÍMICA & PARCERIA",
      description: "Por transformar qualquer dia comum, piada boba ou silêncio confortável no melhor momento da semana.",
      joke: "A banca de jurados calculou a probabilidade desse encontro: 0,0001%. O destino não aceitou recursos.",
      message: "Obrigado por ser minha melhor companhia em todos esses 9 meses."
    }
  ];

  /* ---------- CONTEÚDO: ARQUIVO CONFIDENCIAL ---------- */
  const FILES = [
    {
      id: "001",
      title: "Passeio no Shopping",
      status: "FLAGRANTE NO ESPELHO / LOOK APROVADO",
      text: "Um dia clássico de shopping com a minha princesa. Foto no espelho para registrar os looks: Eu tentando manter a pose segurando a bolsa, Você impecável e eu claramente hipnotizado pela sua beleza."
    },
    {
      id: "002",
      title: "Chá de Casa Nova: Zumbi & Vampira",
      status: "TEMA HALLOWEEN / DUPLA IMBATÍVEL",
      text: "O dia em que fomos para o chá de casa nova fantasiados no clima de Halloween: eu de zumbi e a bbzinha de vampira. A produção confirma que foi a dupla sobrenatural mais apaixonada e estilosa de toda a festa."
    },
    {
      id: "003",
      title: "Dia de Praia e Vento no Cabelo",
      status: "SOL, MAR E SORRISOS SINCEROS",
      text: "Dia de praia com muito sol, mar, areia(para uma caralho, inclusive) e o vento fazendo aquela bagunça no cabelo. Um momento leve, gostoso e com os sorrisos mais radiantes que esse arquivo confidencial já capturou."
    },
    {
      id: "004",
      title: "O Jardim Japonês e a Perseguição",
      status: "SUSPENSE: ATIVIDADE SUSPEITA NO JARDIM",
      text: "Nosso passeio pelo Jardim Japonês que parecia pura tranquilidade... até uma velha muito estranha cismar de seguir a gente por cada cantinho do lugar. Mas nem essa perseguição bizarra tirou a paz desse momento com você."
    },
    {
      id: "005",
      title: "A Corrida Noturna",
      status: "PARCERIA FITNESS EM DUPLA",
      text: "O registro do dia em que fomos correr juntos à noite. Parceria de verdade até no treino: fone de ouvido, suor, esforço e aquela certeza de que qualquer rotina fica mil vezes mais divertida ao seu lado."
    }
  ];

  const AWARD_COMMENTS = [
    "A banca avaliadora já tomou sua decisão. A banca é o namorado. A decisão é unânime.",
    "Primeira estatueta entregue. A concorrente continua sendo ela mesma.",
    "Duas categorias reveladas. Os jurados pedem um minuto para se recompor.",
    "Três prêmios. A produção informa que não existe plano B.",
    "Quatro de oito. O orçamento da cerimônia continua em zero reais e cem por cento de coração.",
    "Cinco prêmios. Quase lá. Alguém avisou o protagonista que respirar é opcional?",
    "Seis categorias reveladas. Ela já tem lugar reservado na história.",
    "Sete categorias. Falta apenas uma para liberar a grande revelação final!",
    "TODAS AS OITO CATEGORIAS REVELADAS! O 9º e maior prêmio foi liberado. Confira o Arquivo Confidencial antes!"
  ];

  /* ---------- ESTADO ---------- */
  const state = {
    opened: new Set(),
    files: new Set(),
    finalRevealed: false,
    letterOpened: false,
    sound: true,
    unlockAnnounced: false,
    typing: null,
    decrypting: false
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- PERSISTÊNCIA (localStorage) ---------- */
  function loadProgress() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      state.opened = new Set((data.opened || []).filter((id) => AWARDS.some((a) => a.id === id)));
      state.files = new Set(data.files || []);
      state.finalRevealed = !!data.finalRevealed;
      state.letterOpened = !!data.letterOpened;
    } catch (e) {
      state.opened = new Set();
      state.files = new Set();
    }
    state.unlockAnnounced = state.opened.size === AWARDS.length;
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        opened: [...state.opened],
        files: [...state.files],
        finalRevealed: state.finalRevealed,
        letterOpened: state.letterOpened
      }));
    } catch (e) { /* armazenamento indisponível: segue sem salvar */ }
  }

  function clearProgress() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignora */ }
  }

  /* ---------- ÁUDIO (gerado no navegador + palmas.mp3 realista) ---------- */
  const APPLAUSE_AUDIO_PATH = "assets/audio/palmas.mp3";
  let audioCtx = null;
  let realApplauseBuffer = null;
  let applauseLoading = false;
  let noiseBuf = null, applauseNode = null;
  let fallbackAudioEl = null;

  function getAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === "suspended") audioCtx.resume();
    if (!realApplauseBuffer && !applauseLoading) loadRealApplause();
    return audioCtx;
  }

  function loadRealApplause() {
    if (realApplauseBuffer || applauseLoading) return;
    applauseLoading = true;
    try {
      fetch(APPLAUSE_AUDIO_PATH)
        .then((res) => {
          if (!res.ok) throw new Error("Status " + res.status);
          return res.arrayBuffer();
        })
        .then((buf) => {
          const ctx = getAudio();
          if (!ctx) return null;
          return ctx.decodeAudioData(buf);
        })
        .then((decoded) => {
          if (decoded) {
            realApplauseBuffer = decoded;
            console.log("Áudio real de palmas carregado e pronto!");
          }
        })
        .catch((err) => {
          console.warn("Usando fallback de áudio para palmas:", err);
          if (!fallbackAudioEl && typeof Audio !== "undefined") {
            try {
              fallbackAudioEl = new Audio(APPLAUSE_AUDIO_PATH);
              fallbackAudioEl.preload = "auto";
            } catch (e) { /* ignora */ }
          }
        })
        .finally(() => {
          applauseLoading = false;
        });
    } catch (e) {
      applauseLoading = false;
    }
  }

  // Cada nota: [frequência Hz, início (s), duração (s), onda]
  const SFX = {
    click: [[440, 0, 0.08, "square"]],
    award: [[523.25, 0, 0.14, "square"], [659.25, 0.13, 0.14, "square"], [783.99, 0.26, 0.28, "square"]],
    unlock: [[392, 0, 0.12, "square"], [523.25, 0.12, 0.12, "square"], [659.25, 0.24, 0.12, "square"], [1046.5, 0.36, 0.4, "square"]],
    drum: [[110, 0, 0.1, "triangle"], [110, 0.25, 0.1, "triangle"], [110, 0.5, 0.1, "triangle"], [110, 0.75, 0.1, "triangle"], [110, 1.0, 0.1, "triangle"], [165, 1.3, 0.1, "triangle"], [165, 1.5, 0.1, "triangle"], [165, 1.7, 0.1, "triangle"]],
    fanfare: [[523.25, 0, 0.15, "square"], [523.25, 0.18, 0.15, "square"], [523.25, 0.36, 0.15, "square"], [659.25, 0.54, 0.3, "square"], [587.33, 0.9, 0.15, "square"], [783.99, 1.1, 0.7, "square"]],
    letter: [[523.25, 0, 0.25, "triangle"], [587.33, 0.25, 0.25, "triangle"], [659.25, 0.5, 0.25, "triangle"], [783.99, 0.75, 0.5, "triangle"]],
    step: [[330, 0, 0.06, "square"], [392, 0.06, 0.08, "square"]]
  };

  function sfx(name) {
    if (!state.sound) return;
    try {
      const ctx = getAudio();
      if (!ctx) return;
      (SFX[name] || SFX.click).forEach(([freq, offset, dur, wave]) => {
        const start = ctx.currentTime + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.07, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur + 0.02);
      });
    } catch (e) {
      console.warn("Som indisponível:", e);
    }
  }

  function makeNoise(ctx) {
    const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.1;
    for (let p = 0; p < 210; p++) {
      const pos = Math.floor(Math.random() * len), amp = 0.4 + Math.random() * 0.6, decay = 150 + Math.random() * 450;
      for (let k = 0; k < decay * 4 && pos + k < len; k++) d[pos + k] += (Math.random() * 2 - 1) * amp * Math.exp(-k / decay);
    }
    return buf;
  }

  function stopApplause(fadeDuration = 0.4) {
    if (applauseNode) {
      try {
        const { src, gain, ctx } = applauseNode, now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0.0001, now + fadeDuration);
        src.stop(now + fadeDuration + 0.05);
      } catch (e) { /* já parou */ }
      applauseNode = null;
    }
    if (fallbackAudioEl && !fallbackAudioEl.paused) {
      try {
        let v = fallbackAudioEl.volume;
        const fadeTimer = setInterval(() => {
          v = Math.max(0, v - 0.04);
          fallbackAudioEl.volume = v;
          if (v <= 0.01) {
            clearInterval(fadeTimer);
            fallbackAudioEl.pause();
            fallbackAudioEl.currentTime = 0;
          }
        }, 40);
      } catch (e) {
        fallbackAudioEl.pause();
      }
    }
  }

  function applause(seconds = 5, peak = 0.5) {
    if (!state.sound) return;
    try {
      const ctx = getAudio();
      if (!ctx) return;
      stopApplause(0.25);

      // Volume sutil, agradável e equilibrado (nunca alto ou estridente)
      const targetVolume = Math.min(0.22, 0.16 * peak);

      if (realApplauseBuffer) {
        const src = ctx.createBufferSource();
        src.buffer = realApplauseBuffer;
        src.loop = true;

        // Filtro passa-baixa para um som aveludado, orgânico e sem ruídos ásperos
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 8200;

        const gain = ctx.createGain();
        const now = ctx.currentTime;

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(targetVolume, now + 0.35); // entrada gradual

        if (seconds > 0) {
          const fadeStart = Math.max(now + 0.4, now + seconds - 1.0);
          gain.gain.setValueAtTime(targetVolume, fadeStart);
          gain.gain.linearRampToValueAtTime(0.0001, now + seconds);
          src.start(now);
          src.stop(now + seconds + 0.1);
        } else {
          src.start(now);
        }

        src.connect(lp);
        lp.connect(gain);
        gain.connect(ctx.destination);
        applauseNode = { src, gain, ctx };
      } else if (fallbackAudioEl) {
        fallbackAudioEl.volume = targetVolume;
        fallbackAudioEl.currentTime = 0;
        fallbackAudioEl.play().catch(() => {});
        if (seconds > 0) {
          setTimeout(() => stopApplause(0.8), Math.max(100, (seconds - 0.8) * 1000));
        }
      } else {
        if (!noiseBuf) noiseBuf = makeNoise(ctx);
        const src = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter(), gain = ctx.createGain();
        src.buffer = noiseBuf; src.loop = true;
        hp.type = "highpass"; hp.frequency.value = 700;
        lp.type = "lowpass"; lp.frequency.value = 6500;
        const now = ctx.currentTime, max = targetVolume * 1.1;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(max, now + 0.6);
        gain.gain.linearRampToValueAtTime(0.0001, now + seconds);
        src.connect(hp); hp.connect(lp); lp.connect(gain); gain.connect(ctx.destination);
        src.start(); src.stop(now + seconds + 0.1);
        applauseNode = { src, gain, ctx };
      }
    } catch (e) {
      console.warn("Aplausos indisponíveis:", e);
    }
  }

  function toggleSound() {
    state.sound = !state.sound;
    if (!state.sound) stopApplause();
    const btn = $("#soundToggle");
    btn.textContent = state.sound ? "♫ SOM: ON" : "♫ SOM: OFF";
    btn.setAttribute("aria-pressed", String(state.sound));
    sfx("click");
  }

  /* ---------- PARTÍCULAS (canvas #fx) ---------- */
  const fx = { canvas: null, ctx: null, parts: [], running: false };

  function fxResize() {
    if (!fx.canvas) return;
    fx.canvas.width = window.innerWidth;
    fx.canvas.height = window.innerHeight;
  }

  function burst(x, y, count = 60) {
    if (!fx.ctx) return;
    if (reducedMotion) count = Math.min(count, 12);
    const colors = ["#E8BD69", "#F2E8D5", "#fff0c8", "#e9a0b1", "#702D42"];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      fx.parts.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 3 + Math.floor(Math.random() * 3) * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 70 + Math.random() * 50
      });
    }
    if (!fx.running) {
      fx.running = true;
      requestAnimationFrame(fxLoop);
    }
  }

  const CONFETTI_COLORS = ["#E8BD69", "#F2E8D5", "#E9A0B1", "#ff5d7a", "#5ad1c4", "#8f7bff", "#ffd34d", "#702D42"].map((c) => c);

  /** Confete: dois canhões nos cantos de baixo + chuva vindo do topo. */
  function confettiShow(intensity = 1) {
    if (!fx.ctx) return;
    const w = window.innerWidth, h = window.innerHeight, k = reducedMotion ? 0.2 : intensity;
    const pick = () => CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const cannon = (x, dir) => {
      for (let i = 0; i < 55 * k; i++) {
        const ang = Math.random() * 0.7;
        fx.parts.push({
          x, y: h + 6, vx: dir * (3 + Math.random() * 8) * Math.cos(ang), vy: -(10 + Math.random() * 12),
          size: 5 + Math.floor(Math.random() * 5), color: pick(), life: 150 + Math.random() * 90,
          fl: Math.random() * 6, vmax: 2.4, drag: 0.985
        });
      }
    };
    cannon(0, 1); cannon(w, -1);
    for (let i = 0; i < 90 * k; i++) {        // chuva, escalonada no tempo
      setTimeout(() => {
        fx.parts.push({
          x: Math.random() * w, y: -10, vx: (Math.random() - 0.5) * 2, vy: 1 + Math.random() * 2,
          size: 5 + Math.floor(Math.random() * 5), color: pick(), life: 170 + Math.random() * 90,
          fl: Math.random() * 6, vmax: 2.2, drag: 0.99
        });
        if (!fx.running) { fx.running = true; requestAnimationFrame(fxLoop); }
      }, Math.random() * 1400);
    }
    if (!fx.running) { fx.running = true; requestAnimationFrame(fxLoop); }
  }

  function fxLoop() {
    const { ctx, canvas } = fx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fx.parts = fx.parts.filter((p) => p.life > 0);
    fx.parts.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18;
      p.vx *= p.drag || 0.99;
      p.life -= 1;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 40));
      ctx.fillStyle = p.color;
      if (p.fl !== undefined) {              // confete: gira (largura oscila) e cai devagar
        p.fl += 0.22;
        if (p.vy > p.vmax) p.vy = p.vmax;
        p.x += Math.sin(p.fl * 0.6) * 0.6;
        const w = Math.max(1, Math.round(p.size * Math.abs(Math.cos(p.fl))));
        ctx.fillRect(Math.round(p.x), Math.round(p.y), w, Math.round(p.size * 0.6) + 1);
      } else {
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size); // quadradinhos = pixels
      }
    });
    ctx.globalAlpha = 1;
    if (fx.parts.length) {
      requestAnimationFrame(fxLoop);
    } else {
      fx.running = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function celebrate(duration = 3500) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    burst(w / 2, h * 0.4, 90);
    const start = Date.now();
    const timer = setInterval(() => {
      burst(w * (0.15 + Math.random() * 0.7), h * (0.2 + Math.random() * 0.35), 35);
      if (Date.now() - start > duration) clearInterval(timer);
    }, 450);
  }

  /* ---------- UTILIDADES DE UI ---------- */
  function showScreen(id) {
    $$(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
    window.scrollTo({ top: 0, behavior: "auto" });
    if (id !== "walkScreen" && scenes.carpet) { scenes.carpet.stop(); stopSpeech(); }
    if (id !== "finalScreen" && scenes.stage) scenes.stage.stop();
    if (id !== "walkScreen" && id !== "awardsScreen" && id !== "finalScreen") stopApplause();
  }

  let toastTimer = null;
  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add("hidden"), 3200);
  }

  function typeText(el, text, speed = 16) {
    clearInterval(state.typing);
    if (reducedMotion) { el.textContent = text; return; }
    el.textContent = "";
    let i = 0;
    state.typing = setInterval(() => {
      i += 1;
      el.textContent = text.slice(0, i);
      if (i >= text.length) clearInterval(state.typing);
    }, speed);
  }

  function createStars() {
    const stage = $("#introStage");
    if (!stage) return;
    for (let i = 0; i < 46; i++) {
      const s = document.createElement("span");
      s.className = "star-dot";
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.animationDelay = `${(Math.random() * 3).toFixed(2)}s`;
      s.style.opacity = (0.35 + Math.random() * 0.65).toFixed(2);
      stage.appendChild(s);
    }
  }

  /* ---------- FALA DO CARLOS BOT: texto + "blips" (estilo Don't Starve) ----------
     Nos diálogos do tapete vermelho. Cada fala digita a um ritmo agradável,
     para ao terminar e aguarda o clique do usuário para avançar. */
  let speechTimer = null, lastBlip = 0;
  const VOICE_SCALE = [0, 2, 4, 7, 9]; // escala pentatônica: soa "musical", não irritante

  function blip(ch, next) {
    if (!state.sound) return;
    try {
      const ctx = getAudio();
      if (!ctx) return;
      const code = ch.toLowerCase().charCodeAt(0);
      let semi = VOICE_SCALE[code % 5] + (code % 3 === 0 ? 12 : 0) + (Math.random() < 0.25 ? 2 : 0);
      let f = 170 * Math.pow(2, semi / 12);
      if (next === "?") f *= 1.18; // pergunta sobe o tom
      const now = ctx.currentTime, dur = 0.075;
      const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      o1.type = "square"; o2.type = "triangle";
      o1.frequency.setValueAtTime(f, now); o1.frequency.linearRampToValueAtTime(f * 1.05, now + dur);
      o2.frequency.setValueAtTime(f * 2, now);
      lp.type = "lowpass"; lp.frequency.value = 1800;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(next === "!" ? 0.075 : 0.055, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(ctx.destination);
      o1.start(now); o2.start(now); o1.stop(now + dur + 0.02); o2.stop(now + dur + 0.02);
    } catch (e) { /* sem áudio: só o texto */ }
  }

  function stopSpeech() {
    clearTimeout(speechTimer);
    speechTimer = null;
  }

  /* Passos da conversa do tapete vermelho */
  const WALK_STEPS = [
    { targetT: 4.0, text: "Atenção, imprensa! A protagonista acaba de chegar. A produção solicita que ninguém pergunte como ela consegue ser tão bonita sem esforço." },
    { targetT: 7.2, text: "Indicada em todas as categorias. Não existe concorrente à altura dessa rainha." },
    { targetT: 9.4, text: "Os jurados tentaram manter a imparcialidade, mas o resultado já estava decidido." },
    { targetT: 14.5, text: "Ficha da indicada: fã de astronomia, apaixonada pela Espanha, fluente em espanhol, inglês e francês." },
    { targetT: 18.0, text: "Look oficial da noite: preto, naturalmente. One Direction aprova." },
    { targetT: 21.0, text: "E o apresentador oficial da noite aguarda no fim do tapete, com as mãos suando e o roteiro esquecido." }
  ];

  let walkIndex = 0;
  let isSpeaking = false;
  let currentWalkText = "";

  function speakWalk(text, onComplete) {
    stopSpeech();
    const el = $("#walkDialogue");
    if (!el) return;
    if (reducedMotion) {
      el.textContent = text;
      isSpeaking = false;
      onComplete && onComplete();
      return;
    }

    isSpeaking = true;
    el.textContent = "";
    let i = 0;
    let letters = 0;

    function tick() {
      if (!isSpeaking) return;
      if (i >= text.length) {
        isSpeaking = false;
        onComplete && onComplete();
        return;
      }

      const ch = text[i];
      i += 1;
      el.textContent = text.slice(0, i);

      if (/[A-Za-zÀ-ÿ0-9]/.test(ch)) {
        letters += 1;
        const now = performance.now();
        if (letters % 2 === 1 && now - lastBlip > 45) {
          blip(ch, text[i] || "");
          lastBlip = now;
        }
      }

      let delay = 24;
      if (/[.!?]/.test(ch)) delay = 200;
      else if (/[,:;]/.test(ch)) delay = 100;

      speechTimer = setTimeout(tick, delay);
    }

    tick();
  }

  function playWalkStep(idx) {
    if (idx >= WALK_STEPS.length) {
      goAwards(true);
      return;
    }
    walkIndex = idx;
    const step = WALK_STEPS[idx];
    currentWalkText = step.text;
    const isLast = (idx === WALK_STEPS.length - 1);

    const nextBtn = $("#walkNextBtn");
    if (nextBtn) {
      nextBtn.textContent = isLast ? "IR PARA A PREMIAÇÃO ▶" : "CONTINUAR ▶";
      nextBtn.classList.remove("pulse");
    }

    const prompt = $("#dialoguePrompt");
    if (prompt) prompt.classList.add("hidden");

    if (scenes.carpet) {
      scenes.carpet.glideTo(step.targetT, 1.0);
    }

    speakWalk(step.text, () => {
      isSpeaking = false;
      if (prompt) {
        prompt.textContent = isLast ? "CLIQUE PARA INICIAR A PREMIAÇÃO ▶" : "CLIQUE PARA CONTINUAR ▶";
        prompt.classList.remove("hidden");
      }
      if (isLast && nextBtn) {
        nextBtn.classList.add("pulse");
      }
    });
  }

  function handleWalkAdvance() {
    sfx("step");
    if (isSpeaking) {
      // Se clicou enquanto digita: mostra o texto completo imediatamente e para a fala
      stopSpeech();
      isSpeaking = false;
      const el = $("#walkDialogue");
      if (el) el.textContent = currentWalkText;
      const isLast = (walkIndex === WALK_STEPS.length - 1);
      const prompt = $("#dialoguePrompt");
      if (prompt) {
        prompt.textContent = isLast ? "CLIQUE PARA INICIAR A PREMIAÇÃO ▶" : "CLIQUE PARA CONTINUAR ▶";
        prompt.classList.remove("hidden");
      }
      const nextBtn = $("#walkNextBtn");
      if (isLast && nextBtn) nextBtn.classList.add("pulse");
      return;
    }

    // Texto já estava parado: passa para o próximo
    if (walkIndex < WALK_STEPS.length - 1) {
      playWalkStep(walkIndex + 1);
    } else {
      goAwards(true);
    }
  }

  function skipWalk() {
    stopSpeech();
    sfx("step");
    if (scenes.carpet) scenes.carpet.setTime(22);
    goAwards(true);
  }

  /* ---------- ATO 2: TAPETE VERMELHO (cena animada) ---------- */
  const scenes = { carpet: null, stage: null };

  function setupScenes() {
    if (!window.Ceremony) { console.warn("ceremony.js não carregou."); return; }
    scenes.carpet = Ceremony.mount($("#carpetCanvas"), "carpet", {
      reducedMotion,
      onEvent: (name) => {
        if (name === "applause") applause(17, 0.75);
        if (name === "arrive") { sfx("fanfare"); applause(7, 0.9); confettiShow(1.0); }
      }
    });
    scenes.stage = Ceremony.mount($("#stageCanvas"), "stage", {
      reducedMotion,
      onEvent: (name) => {
        if (name === "drum") sfx("drum");
        if (name === "reveal") {
          sfx("fanfare");
          applause(12, 0.85);
          confettiShow(1.6);
        }
        if (name === "trophy") {
          sfx("award");
          celebrate(2500);
          applause(8, 0.8);
        }
      },
      onEnd: () => {
        $("#winnerReveal").classList.remove("hidden");
        state.finalRevealed = true;
        saveProgress();
        confettiShow(1.2);
        applause(6, 0.75);
      }
    });
  }

  function startWalk() {
    stopSpeech();
    walkIndex = 0;
    isSpeaking = false;
    currentWalkText = "";
    const el = $("#walkDialogue");
    if (el) el.textContent = "";
    const prompt = $("#dialoguePrompt");
    if (prompt) prompt.classList.add("hidden");
    const nextBtn = $("#walkNextBtn");
    if (nextBtn) {
      nextBtn.textContent = "CONTINUAR ▶";
      nextBtn.classList.remove("pulse");
    }
    showScreen("walkScreen");
    if (scenes.carpet) {
      scenes.carpet.reset();
      applause(17, 0.7);
    }
    playWalkStep(0);
  }

  /* ---------- ATO 3: CATEGORIAS ---------- */
  function renderAwards() {
    const grid = $("#awardsGrid");
    grid.innerHTML = "";
    AWARDS.forEach((a) => {
      const done = state.opened.has(a.id);
      const card = document.createElement("button");
      card.type = "button";
      card.className = "award-card" + (done ? " completed" : "");
      card.dataset.id = a.id;
      card.innerHTML =
        `<span class="medal">${done ? a.trophy : "❔"}</span>` +
        `<span class="award-info"><strong>CATEGORIA ${a.number}</strong>${a.title}` +
        `<small>${done ? "✓ REVELADO: " + a.winner : "▶ CLIQUE PARA REVELAR"}</small></span>`;
      card.addEventListener("click", () => openAward(a.id));
      grid.appendChild(card);
    });
    updateProgress();
  }

  function updateProgress() {
    const total = AWARDS.length;
    const done = state.opened.size;
    $("#progressText").textContent = `${done} / ${total}`;
    $("#progressBar").style.width = `${Math.round((done / total) * 100)}%`;
    $("#awardComment").textContent = AWARD_COMMENTS[Math.min(done, AWARD_COMMENTS.length - 1)];

    const btn = $("#finalBtn");
    const unlocked = done === total;
    btn.disabled = !unlocked;
    btn.textContent = unlocked ? "★ GRANDE PRÊMIO ★" : "GRANDE PRÊMIO 🔒";
    btn.classList.toggle("pulse", unlocked);
  }

  function openAward(id) {
    const a = AWARDS.find((x) => x.id === id);
    if (!a) return;
    state.opened.add(a.id);
    saveProgress();

    $("#modalEyebrow").textContent = `CATEGORIA ${a.number} / AND THE AWARD GOES TO...`;
    $("#modalTrophy").textContent = a.trophy;
    $("#modalTitle").textContent = a.title;
    $("#modalWinnerLabel").textContent = `${a.label} OFICIAL`;
    $("#modalWinner").textContent = a.winner;
    $("#modalDescription").textContent = a.description;
    $("#modalJoke").textContent = a.joke;
    $("#modalSecret").textContent = `✦ ${a.message}`;
    $("#awardModal").classList.remove("hidden");
    $("#modalContinue").focus();

    sfx("award");
    confettiShow(state.opened.size === AWARDS.length ? 1.8 : 1);   // a oitava categoria ganha confete extra
    renderAwards();
  }

  function closeAward() {
    const modal = $("#awardModal");
    if (modal.classList.contains("hidden")) return;
    modal.classList.add("hidden");

    // Desbloqueio depois de revelar todas as 8 categorias
    if (state.opened.size === AWARDS.length && !state.unlockAnnounced) {
      state.unlockAnnounced = true;
      sfx("unlock");
      confettiShow(1.8);
      toast("★ Todas as 8 categorias reveladas! O 9º Prêmio e o Arquivo Confidencial estão liberados.");
    }
  }

  /* ---------- ATO 4: ARQUIVO CONFIDENCIAL ---------- */
  function renderArchive() {
    const grid = $("#archiveGrid");
    grid.innerHTML = "";
    FILES.forEach((f) => {
      const open = state.files.has(f.id);
      const card = document.createElement("button");
      card.type = "button";
      card.className = "archive-card " + (open ? "open" : "locked");
      card.dataset.file = f.id;
      card.innerHTML =
        `<span class="file-icon">${open ? "▣" : "▤"}</span>` +
        `<strong>REGISTRO ${f.id}</strong><span>${f.title}</span>` +
        `<small>${open ? "✓ DESCRIPTOGRAFADO" : "🔒 CONFIDENCIAL"}</small>`;
      card.addEventListener("click", () => openFile(f.id));
      grid.appendChild(card);
    });

    const finalArchiveBtn = $("#goToFinalFromArchiveBtn");
    if (finalArchiveBtn) {
      const unlocked = state.opened.size === AWARDS.length;
      finalArchiveBtn.classList.toggle("hidden", !unlocked);
      finalArchiveBtn.classList.toggle("pulse", unlocked);
    }
  }

  function openFile(id) {
    if (state.decrypting) return;
    const f = FILES.find((x) => x.id === id);
    if (!f) return;
    sfx("click");

    if (state.files.has(id)) {
      renderFileDetail(f);
      return;
    }

    // Efeito de terminal: "descriptografando..."
    state.decrypting = true;
    const box = $("#archiveDetail");
    box.innerHTML = `<span class="speaker">SISTEMA DE ARQUIVOS</span><p class="terminal" id="decryptLine"></p>`;
    const line = $("#decryptLine");
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      line.textContent = `> DESCRIPTOGRAFANDO REGISTRO ${f.id}... [${"█".repeat(step)}${"░".repeat(8 - step)}]`;
      if (step >= 8) {
        clearInterval(timer);
        state.decrypting = false;
        state.files.add(id);
        saveProgress();
        sfx("unlock");
        confettiShow(0.85);
        renderArchive();
        renderFileDetail(f);
      }
    }, reducedMotion ? 10 : 110);
  }

  function renderFileDetail(f) {
    const box = $("#archiveDetail");
    box.innerHTML =
      `<span class="speaker">REGISTRO ${f.id} / CONFIDENCIAL</span>` +
      `<figure class="photo-slot empty" id="photoSlot">` +
        `<img alt="Foto do registro ${f.id}" src="${IMAGE_FOLDER}registro-${f.id}.jpg">` +
        `<span class="stamp">CONFIDENCIAL</span>` +
        `<figcaption class="photo-hint">COLOQUE A FOTO EM<br>assets/images/registro-${f.id}.jpg</figcaption>` +
      `</figure>` +
      `<h3 class="archive-title">${f.title}</h3>` +
      `<p class="archive-meta">STATUS: ${f.status}</p>` +
      `<p class="archive-text" id="archiveText"></p>`;

    const img = $("#photoSlot img");
    const slot = $("#photoSlot");
    img.addEventListener("load", () => slot.classList.remove("empty"));
    img.addEventListener("error", () => { img.remove(); slot.classList.add("empty"); });

    typeText($("#archiveText"), f.text, 14);
    box.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" });
  }

  /* ---------- NAVEGAÇÃO ENTRE ATOS ---------- */
  function startCeremony() {
    getAudio(); // desbloqueia o áudio com o gesto do usuário
    sfx("unlock");
    applause(14, 0.75);
    startWalk();
  }

  function goAwards(fromWalk = false) {
    renderAwards();
    showScreen("awardsScreen");
    if (fromWalk) {
      applause(5, 0.65);
    }
  }

  function goArchive() {
    renderArchive();
    showScreen("archiveScreen");
  }

  /* ---------- ATO 5: O GRANDE PRÊMIO ---------- */
  function resetFinalView() {
    $("#revealRow").classList.remove("hidden");
    $("#winnerBlock").classList.add("hidden");
    $("#winnerReveal").classList.add("hidden");
    $("#finalEnvelope").classList.add("hidden");
    $("#loveLetter").classList.add("hidden");
    $("#credits").classList.add("hidden");
    $("#toLetterBtn").classList.remove("hidden");
    if (scenes.stage) scenes.stage.reset();
  }

  function goFinal() {
    if (state.opened.size !== AWARDS.length) {
      toast(`Ainda faltam ${AWARDS.length - state.opened.size} categoria(s) para liberar o 9º prêmio.`);
      return;
    }
    resetFinalView();
    showScreen("finalScreen");
    if (scenes.stage) scenes.stage.show(); // palco em espera, com plateia

    // Se ela já viu o resultado antes (recarregou a página), restaura o ponto
    if (state.finalRevealed) {
      $("#revealRow").classList.add("hidden");
      $("#winnerBlock").classList.remove("hidden");
      $("#winnerReveal").classList.remove("hidden");
      if (scenes.stage) scenes.stage.finish();
      applause(5, 0.6);
      if (state.letterOpened) {
        $("#toLetterBtn").classList.add("hidden");
        $("#loveLetter").classList.remove("hidden");
        $("#credits").classList.remove("hidden");
      }
    }
  }

  function revealWinner() {
    $("#revealRow").classList.add("hidden");
    $("#winnerBlock").classList.remove("hidden"); // o bloco do resultado aparece quando a cena termina
    if (scenes.stage) scenes.stage.play();
    else $("#winnerReveal").classList.remove("hidden");
  }

  /* ---------- ATO 6: A CARTA ---------- */
  function showEnvelope() {
    $("#toLetterBtn").classList.add("hidden");
    const env = $("#finalEnvelope");
    env.classList.remove("hidden");
    sfx("click");
    env.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
  }

  function openLetter() {
    $("#finalEnvelope").classList.add("hidden");
    const letter = $("#loveLetter");
    letter.classList.remove("hidden");
    sfx("letter");
    confettiShow(1.4);
    letter.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    state.letterOpened = true;
    saveProgress();
    setTimeout(() => $("#credits").classList.remove("hidden"), reducedMotion ? 0 : 2500);
  }

  /* ---------- REINICIAR ---------- */
  function restart() {
    if (!confirm("Reiniciar a cerimônia? Todos os prêmios e registros voltarão a ficar bloqueados.")) return;
    state.opened.clear();
    state.files.clear();
    state.finalRevealed = false;
    state.letterOpened = false;
    state.unlockAnnounced = false;
    clearProgress();
    $("#awardModal").classList.add("hidden");
    $("#archiveDetail").innerHTML =
      `<span class="speaker">SISTEMA DE ARQUIVOS</span><p>Selecione um registro. Aviso: alguns arquivos podem causar sorrisos involuntários.</p>`;
    resetFinalView();
    renderAwards();
    renderArchive();
    stopApplause();
    if (scenes.carpet) scenes.carpet.reset();
    showScreen("introScreen");
  }

  /* ---------- LIGAÇÃO DOS EVENTOS ---------- */
  function bind(id, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", handler);
    else console.warn(`Elemento #${id} não encontrado no HTML.`);
  }

  function setupEvents() {
    bind("startBtn", startCeremony);
    bind("walkNextBtn", handleWalkAdvance);
    bind("walkDialogueBox", handleWalkAdvance);
    bind("walkSkipBtn", skipWalk);
    bind("secretBtn", () => { sfx("click"); goArchive(); });
    bind("backToAwardsBtn", () => { sfx("click"); goAwards(); });
    bind("backToAwardsFromFinalBtn", () => { sfx("click"); goAwards(); });
    bind("backToAwardsFromRevealBtn", () => { sfx("click"); goAwards(); });
    bind("backToAwardsFromWinnerBtn", () => { sfx("click"); goAwards(); });
    bind("goToFinalFromArchiveBtn", () => { sfx("click"); goFinal(); });
    bind("finalBtn", goFinal);
    bind("revealWinnerBtn", revealWinner);
    bind("toLetterBtn", showEnvelope);
    bind("openLetterBtn", openLetter);
    bind("restartBtn", restart);
    bind("resetBtn", restart);
    bind("soundToggle", toggleSound);
    bind("modalClose", closeAward);
    bind("modalContinue", closeAward);

    // Desbloqueia áudio no primeiro gesto do usuário
    const unlockAudio = () => { if (state.sound) getAudio(); };
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    $("#awardModal").addEventListener("click", (e) => {
      if (e.target.id === "awardModal") closeAward();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAward();
    });
    window.addEventListener("resize", fxResize);
  }

  /* ---------- INICIALIZAÇÃO ---------- */
  function init() {
    fx.canvas = $("#fx");
    fx.ctx = fx.canvas ? fx.canvas.getContext("2d") : null;
    fxResize();

    loadProgress();
    loadRealApplause();
    createStars();
    renderAwards();
    renderArchive();
    setupEvents();
    setupScenes();

    const soundBtn = $("#soundToggle");
    if (soundBtn) {
      soundBtn.textContent = state.sound ? "♫ SOM: ON" : "♫ SOM: OFF";
      soundBtn.setAttribute("aria-pressed", String(state.sound));
    }

    console.log("%c ELEN AWARDS 2026 ", "background:#100D13;color:#E8BD69;padding:8px;font-weight:bold;");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
