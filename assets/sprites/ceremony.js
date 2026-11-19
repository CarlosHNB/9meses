/* ==========================================================
   CEREMONY.JS — motor de pixel art das cenas animadas
   ----------------------------------------------------------
   - Tudo é desenhado pixel a pixel em um buffer 384x216 e
     ampliado pelo CSS (image-rendering: pixelated).
   - Cada cena é uma função do tempo: render(buffer, t, at)
       t  = tempo da história (segundos desde o play)
       at = relógio ambiente (sempre correndo)
   - Sem dependências. Funciona no navegador e no Node.
   ========================================================== */
(function (root) {
  "use strict";

  const W = 384, H = 216;

  /* ---------- utilidades de cor / matemática ---------- */
  const pack = (r, g, b, a = 255) => (((a << 24) | (b << 16) | (g << 8) | r) >>> 0);
  const hex = (s) => { const n = parseInt(s.slice(1), 16); return pack((n >> 16) & 255, (n >> 8) & 255, n & 255); };
  const cR = (c) => c & 255, cG = (c) => (c >>> 8) & 255, cB = (c) => (c >>> 16) & 255;
  const mix = (c1, c2, a) => pack(
    Math.round(cR(c1) + (cR(c2) - cR(c1)) * a),
    Math.round(cG(c1) + (cG(c2) - cG(c1)) * a),
    Math.round(cB(c1) + (cB(c2) - cB(c1)) * a));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

  function hash(n) {
    n = n | 0;
    n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
    n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
    n = n ^ (n >>> 16);
    return (n >>> 0) / 4294967296;
  }
  const h2 = (x, y, s = 0) => hash(Math.imul(x | 0, 73856093) ^ Math.imul(y | 0, 19349663) ^ Math.imul(s | 0, 83492791));

  /* ---------- paleta do projeto ---------- */
  const C = {
    black: hex("#100D13"), plum: hex("#21172B"), gold: hex("#E8BD69"), wine: hex("#702D42"), cream: hex("#F2E8D5"),
    goldD: hex("#B88A3A"), goldL: hex("#FFF0C8"), outline: hex("#0b0810"), pink: hex("#E58FB1"), white: hex("#FFFFFF")
  };

  /* ---------- buffer de pixels ---------- */
  class Buf {
    constructor(w, h) { this.w = w; this.h = h; this.d = new Uint32Array(w * h); }
    clear(c = 0) { this.d.fill(c); }
    px(x, y, c) { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = c; }
    rect(x, y, w, h, c) {
      x |= 0; y |= 0; w |= 0; h |= 0;
      const x0 = Math.max(0, x), y0 = Math.max(0, y), x1 = Math.min(this.w, x + w), y1 = Math.min(this.h, y + h);
      for (let j = y0; j < y1; j++) { const row = j * this.w; for (let i = x0; i < x1; i++) this.d[row + i] = c; }
    }
    blendPx(x, y, c, a) {
      x |= 0; y |= 0;
      if (a <= 0 || x < 0 || y < 0 || x >= this.w || y >= this.h) return;
      const i = y * this.w + x, o = this.d[i], ia = 1 - a;
      this.d[i] = ((255 << 24) | (Math.round(cB(o) * ia + cB(c) * a) << 16) | (Math.round(cG(o) * ia + cG(c) * a) << 8) | Math.round(cR(o) * ia + cR(c) * a)) >>> 0;
    }
    blendRect(x, y, w, h, c, a) {
      x |= 0; y |= 0; w |= 0; h |= 0;
      const x0 = Math.max(0, x), y0 = Math.max(0, y), x1 = Math.min(this.w, x + w), y1 = Math.min(this.h, y + h);
      for (let j = y0; j < y1; j++) for (let i = x0; i < x1; i++) this.blendPx(i, j, c, a);
    }
    ell(cx, cy, rx, ry, c) {
      const f = typeof c === "function";
      for (let y = Math.ceil(cy - ry); y <= Math.floor(cy + ry); y++) {
        for (let x = Math.ceil(cx - rx); x <= Math.floor(cx + rx); x++) {
          const dx = (x - cx) / (rx + 0.5), dy = (y - cy) / (ry + 0.5);
          if (dx * dx + dy * dy <= 1) this.px(x, y, f ? c(x, y) : c);
        }
      }
    }
    glow(cx, cy, r, c, a) {
      for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
        for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
          const d = Math.hypot(x - cx, y - cy) / r;
          if (d < 1) this.blendPx(x, y, c, a * (1 - d) * (1 - d));
        }
      }
    }
    line(x0, y0, x1, y1, c, th = 1) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      const o = th >> 1;
      for (;;) {
        this.rect(x0 - o, y0 - o, th, th, c);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    }
    blit(s, ox, oy, flip, tint, ta) {
      ox |= 0; oy |= 0;
      for (let y = 0; y < s.h; y++) {
        const dy = oy + y; if (dy < 0 || dy >= this.h) continue;
        for (let x = 0; x < s.w; x++) {
          const dx = ox + x; if (dx < 0 || dx >= this.w) continue;
          let c = s.d[y * s.w + (flip ? s.w - 1 - x : x)];
          if ((c >>> 24) === 0) continue;
          if (tint != null) c = mix(c, tint, ta);
          this.d[dy * this.w + dx] = c;
        }
      }
    }
    outline(c) {
      const { w, h, d } = this, src = d.slice();
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if ((src[i] >>> 24) !== 0) continue;
        if ((x > 0 && (src[i - 1] >>> 24)) || (x < w - 1 && (src[i + 1] >>> 24)) || (y > 0 && (src[i - w] >>> 24)) || (y < h - 1 && (src[i + w] >>> 24))) d[i] = c;
      }
    }
  }

  /* ---------- fonte 3x5 ---------- */
  const FONT = {
    A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110", E: "111100110100111",
    F: "111100110100100", G: "011100101101011", H: "101101111101101", I: "111010010010111", J: "001001001101010",
    K: "101101110101101", L: "100100100100111", M: "101111111101101", N: "111101101101101", O: "010101101101010",
    P: "110101110100100", Q: "010101101110011", R: "110101110101101", S: "011100010001110", T: "111010010010010",
    U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101", Y: "101101010010010",
    Z: "111001010100111", 0: "111101101101111", 1: "010110010010111", 2: "110001010100111", 3: "110001010001110",
    4: "101101111001001", 5: "111100110001110", 6: "011100111101111", 7: "111001010010010", 8: "111101111101111",
    9: "111101111001110", "-": "000000111000000", ".": "000000000000010", "!": "010010010000010", "/": "001001010100100"
  };
  const textW = (s, sc = 1) => s.length * 4 * sc - sc;
  function text(b, s, x, y, c, sc = 1, a = 1) {
    let cx = x;
    for (const ch of String(s).toUpperCase()) {
      const g = FONT[ch];
      if (g) for (let i = 0; i < 15; i++) if (g[i] === "1") {
        const px = cx + (i % 3) * sc, py = y + Math.floor(i / 3) * sc;
        if (a >= 1) b.rect(px, py, sc, sc, c); else b.blendRect(px, py, sc, sc, c, a);
      }
      cx += 4 * sc;
    }
  }
  const textC = (b, s, cx, y, c, sc = 1, a = 1) => text(b, s, Math.round(cx - textW(s, sc) / 2), y, c, sc, a);

  /* ==========================================================
     PERSONAGENS
     ========================================================== */
  const cache = new Map();
  const cached = (key, fn) => { if (!cache.has(key)) cache.set(key, fn()); return cache.get(key); };

  /* ELEN e CARLOS — sprites do casal (assets/sprites/couple-data.js),
     extraídos da imagem enviada e vestidos para a premiação:
       Elen   -> vestido de gala preto com glitter dourado
       Carlos -> smoking preto com gravata borboleta dourada
     Só existe uma pose de cada; o movimento vem de transformações
     (balanço da saia, inclinação, "respiração"). */
  const COUPLE = root.COUPLE_DATA || (typeof require === "function" ? require("./couple-data.js") : null);
  function fromGrid(d) {
    const g = new Buf(d.w, d.h);
    for (let y = 0; y < d.h; y++) for (let x = 0; x < d.w; x++) {
      const ch = d.rows[y][x];
      if (ch !== ".") g.d[y * d.w + x] = hex(d.pal[d.alpha.indexOf(ch)]);
    }
    return g;
  }
  const ELEN0 = fromGrid({ ...COUPLE.elen, alpha: COUPLE.alpha });
  const CARL0 = fromGrid({ ...COUPLE.carlos, alpha: COUPLE.alpha });
  const PAD = 5;
  /** desloca cada linha do sprite horizontalmente (fn(y) -> dx) */
  function shear(src, fn) {
    const out = new Buf(src.w + PAD * 2, src.h);
    for (let y = 0; y < src.h; y++) {
      const dx = Math.round(fn(y));
      for (let x = 0; x < src.w; x++) { const c = src.d[y * src.w + x]; if ((c >>> 24) !== 0) out.d[y * out.w + x + PAD + dx] = c; }
    }
    return out;
  }
  function elenSprite(pose, f = 0) {
    const q = Math.round(f * 8) % 8;
    return cached(`E|${pose}|${q}`, () => {
      const H = ELEN0.h, ph = Math.sin((q / 8) * Math.PI * 2), ph2 = Math.sin((q / 8) * Math.PI * 4);
      let hem = 0, head = 0, k = ph;
      if (pose === "walk") { hem = 2.4; head = 0.9; }
      else if (pose === "wave") { hem = 0.8; head = 1.6; k = ph2; }   // "posando" para os fotógrafos
      else if (pose === "raise") { hem = 0.6; head = 0.5; }
      const buf = shear(ELEN0, (y) => {
        const t = y / H, lower = Math.max(0, (y - 64) / (H - 64));
        return head * k * (1 - t) * (pose === "walk" ? -1 : 1) - hem * k * lower;
      });
      return { buf, ax: PAD + (ELEN0.w >> 1), ay: buf.h, hand: { x: PAD + COUPLE.elen.hand.x, y: COUPLE.elen.hand.y } };
    });
  }
  function carlosSprite(pose, f = 0, aux = 0) {
    const q = Math.round(f * 8) % 8;
    return cached(`C|${pose}|${q}|${aux}`, () => {
      const H = CARL0.h;
      let buf, dy = 0;
      if (pose === "offer") buf = shear(CARL0, (y) => 3 * Math.pow(1 - y / H, 1.4));      // inclina para entregar o troféu
      else buf = shear(CARL0, () => 0);
      if (pose === "clap") dy = aux ? 0 : 1;                                              // quica no ritmo das palmas
      if (pose === "walk") dy = q % 4 < 2 ? 0 : 1;
      return { buf, ax: PAD + (CARL0.w >> 1), ay: buf.h, dy };
    });
  }

  /* PLATEIA — pessoas pequenas aplaudindo, com celular ou comemorando */
  const SKINS = ["#c68863", "#b57a52", "#8d5a3b", "#e0b08a", "#6f4630"].map(hex);
  const HAIRS = ["#1a1015", "#2a1a14", "#4a2e1d", "#c9a05a", "#6b2d3a", "#101010"].map(hex);
  const CLOTH = ["#2a2036", "#1d1a2e", "#702D42", "#3b2a52", "#243b4a", "#4a3a2a", "#a8446a", "#7a6a8a", "#f2e8d5"].map(hex);
  function makeCrowd(v, pose) {
    const b = new Buf(24, 44);
    const skin = SKINS[v % 5], hair = HAIRS[(v * 5 + (v >> 2)) % 6], cloth = CLOTH[(v * 7) % 9], style = v % 4;
    const EYE = hex("#1a0f14");
    b.rect(4, 26, 16, 18, cloth); b.ell(12, 27, 8, 6, cloth); b.rect(11, 17, 3, 3, skin);
    const arm = (x0, y0, x1, y1) => b.line(x0, y0, x1, y1, cloth, 2);
    const handpx = (x, y) => b.rect(x, y, 2, 2, skin);
    if (pose === "clapA") { arm(5, 26, 4, 20); arm(4, 20, 9, 16); arm(19, 26, 20, 20); arm(20, 20, 15, 16); handpx(9, 15); handpx(14, 15); }
    else if (pose === "clapB") { arm(5, 26, 5, 21); arm(5, 21, 11, 17); arm(19, 26, 19, 21); arm(19, 21, 13, 17); handpx(11, 15); handpx(12, 15); }
    else if (pose === "phone") {
      arm(5, 26, 4, 20); arm(4, 20, 9, 17); handpx(9, 16);
      arm(19, 26, 21, 17); arm(21, 17, 20, 9); b.rect(18, 3, 5, 7, hex("#15111c")); b.rect(19, 4, 3, 5, hex("#8fb4cc")); handpx(19, 9);
    } else { arm(5, 26, 2, 15); arm(2, 15, 3, 6); arm(19, 26, 22, 15); arm(22, 15, 21, 6); handpx(2, 4); handpx(20, 4); }
    b.ell(12, 11, 5, 6, skin);
    if (style === 1) { b.ell(12, 8, 6, 5, hair); b.rect(6, 10, 2, 13, hair); b.rect(17, 10, 2, 13, hair); }
    else if (style === 2) { b.ell(12, 7, 6, 4, hair); b.ell(12, 2, 3, 3, hair); }
    else if (style === 3) { b.ell(12, 7, 6, 4, hair); b.rect(6, 5, 12, 3, CLOTH[(v * 5) % 9]); b.rect(14, 8, 6, 1, CLOTH[(v * 5) % 9]); }
    else { b.ell(12, 7, 6, 4, hair); b.rect(6, 8, 2, 4, hair); b.rect(17, 8, 2, 4, hair); }
    b.px(10, 11, EYE); b.px(14, 11, EYE); b.rect(11, 14, 3, 1, C.cream);
    b.outline(C.outline);
    return b;
  }
  const crowdSprite = (v, pose) => cached(`P|${v}|${pose}`, () => makeCrowd(v, pose));

  /* TROFÉU e outros adereços */
  function makeTrophy() {
    const b = new Buf(22, 30), cx = 11;
    const G1 = hex("#f7dc8c"), G2 = C.gold, G3 = hex("#b47a2c"), G4 = hex("#7a4d1c");
    b.ell(4, 8, 3, 4, G2); b.ell(4, 8, 1, 2, 0); b.ell(18, 8, 3, 4, G3); b.ell(18, 8, 1, 2, 0);
    for (let y = 3; y <= 15; y++) {
      const hw = y <= 10 ? 7 : Math.round(7 - (y - 10) * 1.3);
      for (let x = cx - hw; x <= cx + hw; x++) b.px(x, y, y === 3 ? G1 : (x < cx - 3 ? G1 : (x > cx + 3 ? G3 : G2)));
    }
    b.rect(8, 4, 1, 7, hex("#fff2bd"));
    for (const [dx, dy] of [[0, 0], [-1, 1], [0, 1], [1, 1], [0, 2]]) b.px(cx + dx, 7 + dy, hex("#fff6d0"));
    b.rect(10, 16, 3, 6, G2); b.rect(10, 16, 1, 6, G1);
    b.rect(6, 22, 11, 2, G3); b.rect(5, 24, 13, 4, G2); b.rect(5, 27, 13, 1, G4); b.rect(7, 25, 3, 1, G1);
    b.outline(hex("#5a3a12"));
    return b;
  }
  const TROPHY = makeTrophy();
  const HEART = ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"];
  function heart(b, x, y, c, a = 1) {
    for (let j = 0; j < 6; j++) for (let i = 0; i < 7; i++) if (HEART[j][i] === "1") (a >= 1) ? b.px(x + i, y + j, c) : b.blendPx(x + i, y + j, c, a);
  }
  function envelope(b, x, y, open) {
    b.rect(x, y + 2, 14, 9, C.cream); b.rect(x, y + 10, 14, 1, hex("#cfc3ad"));
    if (open) { b.rect(x + 1, y - 3, 12, 6, C.gold); b.rect(x + 2, y - 2, 10, 1, C.goldL); for (let i = 0; i < 6; i++) b.rect(x + i, y + 1 - Math.min(i, 5) + 2 - 2, 1, 1, hex("#cfc3ad")); }
    else { for (let i = 0; i < 7; i++) { b.px(x + i, y + 2 + Math.floor(i * 0.7), hex("#cfc3ad")); b.px(x + 13 - i, y + 2 + Math.floor(i * 0.7), hex("#cfc3ad")); } b.rect(x + 6, y + 5, 2, 2, C.wine); }
    b.rect(x - 1, y + 1, 16, 1, C.outline); b.rect(x - 1, y + 11, 16, 1, C.outline);
  }
  function sparkle(b, x, y, r, c) {
    b.px(x, y, c);
    for (let i = 1; i <= r; i++) { b.px(x + i, y, c); b.px(x - i, y, c); b.px(x, y + i, c); b.px(x, y - i, c); }
  }

  /* ==========================================================
     EFEITOS COMPARTILHADOS
     ========================================================== */
  const CONF = [C.gold, C.wine, C.cream, C.pink, C.goldL, hex("#9a3a55")];
  function confetti(b, t, t0, n, seed) {
    if (t < t0) return;
    for (let i = 0; i < n; i++) {
      const s = t0 + hash(seed + i * 11) * 2.5, age = t - s;
      if (age < 0) continue;
      const x = hash(seed + i * 13) * W + Math.sin(age * 2 + i) * 8;
      const y = (24 + hash(seed + i * 17) * 30) * age % (H + 20) - 10;
      const w = 1 + (((age * 6 + i) | 0) % 2);
      b.rect(x, y, w + 1, 2, CONF[(hash(seed + i * 19) * CONF.length) | 0]);
    }
  }
  function cannon(b, t, t0, ox, oy, dir, n, seed) {
    const age = t - t0;
    if (age < 0 || age > 3.4) return;
    for (let i = 0; i < n; i++) {
      const ang = -Math.PI / 2 + dir * (0.12 + hash(seed + i * 3) * 0.75);
      const sp = 90 + hash(seed + i * 5) * 120;
      const x = ox + Math.cos(ang) * sp * age, y = oy + Math.sin(ang) * sp * age + 0.5 * 150 * age * age;
      const a = age > 2.6 ? 1 - (age - 2.6) / 0.8 : 1;
      b.blendRect(x, y, 2, 2, CONF[(hash(seed + i * 7) * CONF.length) | 0], a);
    }
  }
  function pyro(b, t, t0, t1, ox, oy, seed) {
    if (t < t0 || t > t1) return;
    b.glow(ox, oy, 10, C.gold, 0.5);
    for (let i = 0; i < 34; i++) {
      const age = ((t - t0) + hash(seed + i * 3) * 1.4) % 1.1;
      const x = ox + (hash(seed + i * 5) - 0.5) * 34 * age;
      const y = oy - (80 * age - 70 * age * age) * (0.6 + hash(seed + i * 7) * 0.6);
      b.blendRect(x, y, 1, 2, mix(C.white, C.gold, age), clamp(1.3 - age, 0, 1));
    }
  }
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function skyRows(stops, h) {
    const rows = [];
    for (let y = 0; y < h; y++) {
      let i = 0; while (i < stops.length - 2 && y > stops[i + 1][0]) i++;
      const [y0, c0] = stops[i], [y1, c1] = stops[i + 1];
      rows.push({ c1: hex(c0), c2: hex(c1), f: clamp((y - y0) / (y1 - y0), 0, 1) });
    }
    return rows;
  }
  function paintRows(b, rows, yMax) {
    for (let y = 0; y < yMax; y++) {
      const r = rows[Math.min(y, rows.length - 1)], thr = r.f * 16;
      for (let x = 0; x < b.w; x++) b.d[y * b.w + x] = thr > BAYER[(y & 3) * 4 + (x & 3)] ? r.c2 : r.c1;
    }
  }
  function cone(b, ox, oy, tx, ty, r0, r1, c, a) {
    const dir = ty > oy ? 1 : -1;
    for (let y = oy; y !== ty; y += dir) {
      const fr = (y - oy) / (ty - oy), x = lerp(ox, tx, fr), hw = lerp(r0, r1, fr);
      b.blendRect(x - hw, y, hw * 2, 1, c, a * (1 - 0.35 * fr));
    }
  }

  /* ==========================================================
     CENA 1 — TAPETE VERMELHO
     ========================================================== */
  const CARPET_W = 832;
  const CARPET_END = 22;
  const SKY1 = skyRows([[0, "#07050c"], [40, "#100d13"], [85, "#1d1228"], [115, "#2f1b38"], [140, "#53264a"], [175, "#702D42"]], 176);
  const STARS = Array.from({ length: 90 }, (_, i) => ({ x: (hash(i * 3 + 1) * W) | 0, y: (hash(i * 3 + 2) * 105) | 0, p: hash(i * 3 + 3) * 6.28, big: hash(i * 7) < 0.14 }));
  function makeSkyline(seed, count, minW, maxW, minH, maxH) {
    const arr = []; let x = -40;
    for (let i = 0; i < count; i++) {
      const w = (minW + hash(seed + i * 5) * (maxW - minW)) | 0, h = (minH + hash(seed + i * 9) * (maxH - minH)) | 0;
      arr.push({ x, w, h, id: seed + i }); x += w + (hash(seed + i * 3) < 0.3 ? 2 : 0);
    }
    return arr;
  }
  const FAR = makeSkyline(100, 110, 14, 34, 20, 56), MID = makeSkyline(300, 90, 18, 40, 30, 70);
  function drawSkyline(b, list, cam, par, baseY, color, lit, at, seed) {
    for (const bd of list) {
      const sx = Math.round(bd.x - cam * par);
      if (sx > W || sx + bd.w < 0) continue;
      b.rect(sx, baseY - bd.h, bd.w, bd.h, color);
      if (lit > 0) for (let wy = baseY - bd.h + 4, j = 0; wy < baseY - 6; wy += 5, j++) for (let wx = 2, k = 0; wx < bd.w - 2; wx += 4, k++) {
        const n = hash(bd.id * 31 + j * 7 + k * 13);
        if (n < lit) b.px(sx + wx, wy, (Math.sin(at * 0.7 + n * 90) > 0.93) ? hex("#7a5a3a") : hex("#e8bd69"));
        else if (n < lit * 1.5) b.px(sx + wx, wy, hex("#3a2a42"));
      }
    }
  }

  const CROWD_BACK = Array.from({ length: 64 }, (_, i) => ({ x: i * 14 + hash(i * 3) * 6 - 6, v: (hash(i * 5) * 40) | 0, id: i }));
  const CROWD_FRONT = Array.from({ length: 56 }, (_, i) => ({ x: i * 16 + 7 + hash(i * 9) * 6 - 6, v: (hash(i * 11 + 3) * 40) | 0, id: i + 200 }));

  function elenCarpet(t) {
    if (t < 0.8) return { x: -48, pose: "stand", f: 0, walking: false };
    if (t < 7.0) return { x: lerp(-48, 190, (t - 0.8) / 6.2), pose: "walk", walking: true };
    if (t < 9.2) return { x: 190, pose: "wave", f: (t * 0.9) % 1, walking: false };
    if (t < 17.6) return { x: lerp(190, 565, (t - 9.2) / 8.4), pose: "walk", walking: true };
    return { x: 565, pose: "clasp", f: 0, walking: false };
  }

  function drawFlashes(b, at, list, e) {
    // list: [{x,y,id}] em coordenadas de tela
    let level = 0;
    for (const p of list) {
      const rate = 0.25 + e * 0.8, cyc = (at * rate + hash(p.id * 5) * 20) % 1;
      if (cyc < 0.07) {
        const k = 1 - cyc / 0.07; level = Math.max(level, k);
        b.glow(p.x, p.y, 12 + (p.big ? 8 : 0), C.white, 0.95 * k);
        if (k > 0.5) sparkle(b, p.x, p.y, p.big ? 6 : 3, C.white);
      }
    }
    return level;
  }

  function renderCarpet(b, t, at) {
    const el = elenCarpet(t);
    let cam = clamp(el.x - 190, 0, CARPET_W - W);
    cam = lerp(cam, CARPET_W - W, smooth((t - 13.5) / 3.5));
    // céu
    paintRows(b, SKY1, 176);
    b.rect(0, 176, W, H - 176, hex("#1a1322"));
    for (const s of STARS) {
      const tw = 0.5 + 0.5 * Math.sin(at * 1.6 + s.p);
      if (tw > 0.3) { b.px(s.x, s.y, mix(hex("#3a2f55"), C.goldL, tw)); if (s.big && tw > 0.75) sparkle(b, s.x, s.y, 1, mix(hex("#3a2f55"), C.goldL, tw)); }
    }
    // holofotes varrendo o céu
    for (let i = 0; i < 4; i++) {
      const ox = (i * 110 + 30 - cam * 0.4 + 800) % (W + 80) - 20, ang = Math.sin(at * 0.35 + i * 1.9) * 0.5;
      for (let y = 150; y > 0; y -= 1) { const d = 150 - y, x = ox + Math.tan(ang) * d, hw = 2 + d * 0.1; b.blendRect(x - hw, y, hw * 2, 1, hex("#ffe9b0"), 0.09 * (1 - d / 170)); }
    }
    drawSkyline(b, FAR, cam, 0.25, 150, hex("#150f1e"), 0.0, at, 1);
    drawSkyline(b, MID, cam, 0.5, 166, hex("#1c1527"), 0.22, at, 2);

    // teatro (coordenadas do mundo)
    const X = (wx) => Math.round(wx - cam);
    {
      const x0 = X(560);
      b.rect(x0, 54, 280, 120, hex("#1e1628")); b.rect(x0, 54, 280, 2, C.goldD); b.rect(x0, 52, 280, 2, C.gold);
      for (const cxw of [572, 650, 748, 800]) { b.rect(X(cxw), 98, 10, 76, hex("#2c2238")); b.rect(X(cxw), 98, 2, 76, hex("#443654")); b.rect(X(cxw) - 2, 96, 14, 4, C.goldD); }
      b.rect(X(612), 62, 200, 36, hex("#120c18")); b.rect(X(612), 62, 200, 2, C.gold); b.rect(X(612), 96, 200, 2, C.gold); b.rect(X(612), 62, 2, 36, C.gold); b.rect(X(810), 62, 2, 36, C.gold);
      for (let i = 0; i < 33; i++) { const on = (i + Math.floor(at * 3)) % 2 === 0, c = on ? C.goldL : hex("#7a5a3a"); b.px(X(614 + i * 6), 60, c); b.px(X(614 + i * 6), 99, c); }
      textC(b, "ELEN AWARDS", X(712), 67, C.gold, 3); textC(b, "THE 9 MONTHS EDITION", X(712), 87, C.cream, 1);
      b.rect(X(678), 124, 44, 50, hex("#fbe3a0")); b.ell(X(700), 124, 22, 14, hex("#fbe3a0"));
      b.rect(X(678), 140, 44, 34, hex("#f1c66a")); b.rect(X(678), 160, 44, 14, hex("#e8bd69"));
      b.rect(X(676), 124, 2, 50, C.goldD); b.rect(X(722), 124, 2, 50, C.goldD);
      b.glow(X(700), 168, 46, hex("#ffe3a0"), 0.35);
      for (const wxx of [596, 630, 776]) { b.rect(X(wxx), 112, 14, 26, hex("#3a2a42")); b.rect(X(wxx) + 1, 113, 12, 24, hex("#6b4f4a")); }
      for (const wxx of [616, 770]) { b.rect(X(wxx), 100, 12, 36, C.wine); b.rect(X(wxx), 100, 12, 2, C.gold); for (let i = 0; i < 6; i++) b.rect(X(wxx) + i, 136 + i, 12 - i * 2, 1, C.wine); sparkle(b, X(wxx) + 6, 114, 3, C.gold); }
      sparkle(b, X(700), 44, 4 + Math.round(Math.sin(at * 3)), C.goldL);
    }
    // postes de luz
    for (const lx of [110, 300, 480, 880]) {
      const sx = X(lx); if (sx < -30 || sx > W + 30) continue;
      b.rect(sx, 108, 2, 70, hex("#2a2236")); b.rect(sx - 3, 104, 8, 5, hex("#fbe3a0")); b.rect(sx - 4, 102, 10, 2, hex("#2a2236"));
      b.glow(sx + 1, 108, 30, hex("#ffd98a"), 0.38);
    }
    // chão
    b.rect(0, 160, W, H - 160, hex("#1a1322"));
    for (let y = 160; y < H; y += 12) b.rect(0, y, W, 1, hex("#221a2c"));
    for (let y = 160, r = 0; y < H; y += 12, r++) for (let x = -((cam + (r % 2) * 16) % 32); x < W; x += 32) b.rect(x, y, 1, 12, hex("#221a2c"));

    // multidão
    const e = clamp(0.3 + 0.8 * (1 - Math.abs(el.x - cam - 190) / 260), 0.25, 1) * (t > 17.6 ? 1.15 : 1) * clamp(0.5 + t * 0.3, 0.5, 1);
    const phones = [];
    const drawCrowd = (list, baseY, tint) => {
      for (const m of list) {
        if (m.x > 640 && m.x < 765) continue;
        const sx = Math.round(m.x - cam - 12); if (sx < -26 || sx > W + 4) continue;
        const r = hash(m.id * 7 + 1);
        let pose = "clapA", yo = 0;
        if (r < 0.2) pose = "phone";
        else if (r < e * 1.05) { pose = ((at * 4.4 + r * 12) % 2) < 1 ? "clapA" : "clapB"; yo = Math.round(Math.sin(at * 8.8 + r * 20)); }
        if (e > 0.92 && r > 0.7 && r < 0.85) pose = "cheer";
        const spr = crowdSprite(m.v, pose);
        const sy = baseY - 44 + yo;
        b.blit(spr, sx, sy, false, hex("#1a1030"), tint);
        if (pose === "phone") phones.push({ x: sx + 20, y: sy + 5, id: m.id });
      }
    };
    drawCrowd(CROWD_BACK, 158, 0.4);
    drawCrowd(CROWD_FRONT, 174, 0.12);
    // cordas e postes
    for (let wx = 20; wx < CARPET_W + 60; wx += 52) {
      const sx = X(wx); if (sx < -60 || sx > W + 60) continue;
      for (let i = 0; i <= 52; i++) { const y = 158 + Math.round(6 * 4 * (i / 52) * (1 - i / 52)); b.rect(sx + i, y, 1, 2, C.wine); b.px(sx + i, y, hex("#b04a68")); }
      b.rect(sx - 1, 154, 3, 27, C.gold); b.rect(sx - 1, 154, 1, 27, C.goldL); b.rect(sx - 2, 152, 5, 3, C.goldL); b.rect(sx - 3, 179, 7, 2, C.goldD);
    }
    // tapete
    b.rect(0, 180, W, 32, hex("#8e2a47"));
    for (let y = 180; y < 212; y++) { const k = Math.abs(y - 196) / 16; if (k > 0.6) b.rect(0, y, W, 1, hex("#7a2340")); }
    for (let y = 182; y < 210; y++) for (let x = 0; x < W; x++) if (h2(x + (cam | 0), y, 21) < 0.07) b.px(x, y, hex("#7e2340")); else if (h2(x + (cam | 0), y, 22) < 0.03) b.px(x, y, hex("#a83a58"));
    b.rect(0, 181, W, 1, C.gold); b.rect(0, 183, W, 1, C.goldD); b.rect(0, 208, W, 1, C.goldD); b.rect(0, 210, W, 1, C.gold);
    b.glow(X(700), 196, 70, hex("#ffe3a0"), 0.3);

    // personagens
    const feetY = 202;
    const cxs = X(660);
    {
      const cp = t > 17.6 && t < 19.8 ? "offer" : "clap";
      const sp = carlosSprite(cp, 0, ((at * 4) % 2) < 1 ? 1 : 0);
      b.blendRect(cxs - 24, feetY - 2, 48, 5, C.black, 0.4);
      b.blit(sp.buf, cxs - sp.ax, feetY - sp.ay + 1 + sp.dy);
    }
    {
      const wf = el.walking ? (el.x / 26) % 1 : (el.f || 0);
      const sp = elenSprite(el.pose, wf < 0 ? wf + 1 : wf);
      const bob = el.walking ? Math.round(Math.abs(Math.sin(wf * Math.PI * 2)) * 1.5) : 0;
      const ex = X(el.x);
      b.blendRect(ex - 28, feetY - 2, 56, 5, C.black, 0.4);
      b.blit(sp.buf, ex - sp.ax, feetY - sp.ay + 1 - bob);
      if (t > 0.8) for (let i = 0; i < 7; i++) {
        const ph = (at * 0.9 + hash(i * 3) * 4) % 2; if (ph > 1) continue;
        sparkle(b, ex - 34 + hash(i * 5) * 68, feetY - 104 + hash(i * 7) * 100, ph < 0.5 ? 1 : 2, C.goldL);
      }
    }
    // corações no reencontro
    if (t > 17.6) for (let i = 0; i < 6; i++) {
      const age = (t - 17.6 - i * 0.55); if (age < 0) continue; const a = age % 3.3;
      heart(b, X(612) + Math.sin(a * 2 + i) * 14 + i * 3 - 8, 100 - a * 14, i % 2 ? C.pink : hex("#e0405f"), clamp(1 - a / 3.3, 0, 1));
    }
    // flashes da plateia e dos fotógrafos
    let lv = drawFlashes(b, at, phones, e);
    for (let i = 0; i < 8; i++) {
      const sx = ((i * 58 + 20 - cam * 1.25) % (W + 70) + (W + 70)) % (W + 70) - 20, bob = Math.round(Math.sin(at * 2 + i) * 1.5);
      const rim = hex("#4a3a63");
      b.ell(sx, 232 + bob, 17, 22, rim); b.ell(sx, 233 + bob, 17, 22, hex("#0b0810"));
      b.ell(sx, 208 + bob, 6, 6, rim); b.ell(sx, 209 + bob, 6, 6, hex("#0b0810"));
      b.rect(sx - 7, 199 + bob, 14, 9, hex("#18121f")); b.rect(sx - 7, 199 + bob, 14, 1, rim); b.ell(sx, 204 + bob, 3, 3, hex("#2a3a50")); b.px(sx - 1, 203 + bob, hex("#a8c8e0"));
      b.rect(sx + 3, 196 + bob, 4, 3, hex("#18121f"));
      const cyc = (at * (0.4 + e * 0.9) + hash(i * 17) * 9) % 1;
      if (cyc < 0.08) { const k = 1 - cyc / 0.08; lv = Math.max(lv, k); b.glow(sx + 5, 197 + bob, 20, C.white, 0.9 * k); sparkle(b, sx + 5, 197 + bob, 9, C.white); }
    }
    if (lv > 0) b.blendRect(0, 0, W, H, C.white, 0.1 * lv);
    // confete na chegada
    if (t > 17.6) { confetti(b, t, 17.6, 110, 7); cannon(b, t, 17.6, 10, 200, 1, 40, 3); cannon(b, t, 17.6, W - 10, 200, -1, 40, 5); }
    // cartela de abertura
    if (t < 2.8) {
      const a = t < 0.4 ? 1 : clamp(1 - (t - 2.0) / 0.8, 0, 1);
      b.blendRect(0, 0, W, H, C.black, a * (t < 0.4 ? 1 : 0.85));
      textC(b, "ELEN AWARDS 2026", W / 2, 84, C.gold, 3, a); textC(b, "TAPETE VERMELHO", W / 2, 112, C.cream, 2, a);
      textC(b, "THE 9 MONTHS EDITION", W / 2, 134, C.pink, 1, a);
    }
    // vinheta
    for (let i = 0; i < 6; i++) { b.blendRect(0, i * 2, W, 2, C.black, 0.28 - i * 0.045); b.blendRect(0, H - 2 - i * 2, W, 2, C.black, 0.28 - i * 0.045); }
  }

  const CARPET = {
    duration: CARPET_END,
    captions: [
      { t: 0.3, text: "Atenção, imprensa! A protagonista acaba de chegar. A produção solicita que ninguém pergunte como ela consegue ser tão bonita sem esforço." },
      { t: 6.0, text: "Indicada em todas as categorias. Nenhuma concorrente foi encontrada à altura." },
      { t: 9.8, text: "Os jurados tentaram manter a imparcialidade, mas o resultado já estava decidido." },
      { t: 13.0, text: "Ficha da indicada: fã de astronomia, apaixonada pela Espanha, fluente em espanhol e inglês, aprendendo francês." },
      { t: 17.6, text: "Look oficial da noite: preto, naturalmente. One Direction aprova." },
      { t: 20.4, text: "E o apresentador oficial da noite aguarda no fim do tapete, com as mãos suando e o roteiro esquecido." }
    ],
    events: [{ t: 0.4, name: "applause" }, { t: 7.0, name: "wave" }, { t: 17.6, name: "arrive" }],
    render: renderCarpet
  };

  /* ==========================================================
     CENA 2 — PALCO / GRANDE PRÊMIO
     ========================================================== */
  const STAGE_END = 13.2;
  const LED = { x: 96, y: 30, w: 192, h: 88 };
  const LED_STARS = Array.from({ length: 60 }, (_, i) => ({ x: hash(i * 3 + 51) * LED.w, y: hash(i * 3 + 52) * LED.h, p: hash(i * 3 + 53) * 6.28 }));
  const CONST = [[24, 62], [48, 44], [76, 52], [100, 30], [128, 40], [150, 24], [168, 38]];
  const AUD = Array.from({ length: 34 }, (_, i) => ({ x: i * 12 + hash(i * 3) * 6 - 4, row: i % 2, id: i }));

  function elenStage(t) {
    if (t < 3.0) return { x: -50, pose: "stand", walking: false };
    if (t < 7.6) return { x: lerp(-50, 115, smooth((t - 3.0) / 4.6) * 0.15 + ((t - 3.0) / 4.6) * 0.85), pose: "walk", walking: true };
    if (t < 8.8) return { x: lerp(115, 150, (t - 7.6) / 1.2), pose: "walk", walking: true, slow: true };
    if (t < 10.4) return { x: 150, pose: "clasp", f: 0 };
    return { x: 150, pose: "raise", f: (t * 0.9) % 1 };
  }

  function renderStage(b, t, at) {
    const started = t >= 0;
    const tt = started ? t : 0;
    const lights = started ? clamp(tt / 1.2, 0.35, 1) : 0.5 + 0.1 * Math.sin(at * 1.3);
    const reveal = started && tt >= 2.4;
    const ov = reveal ? 1 : 0;
    // parede + LED
    b.rect(0, 0, W, 150, hex("#17101f"));
    for (let x = 0; x < W; x += 24) b.rect(x, 0, 1, 150, hex("#1c1426"));
    b.rect(LED.x - 4, LED.y - 4, LED.w + 8, LED.h + 8, C.goldD); b.rect(LED.x - 3, LED.y - 3, LED.w + 6, LED.h + 6, C.gold);
    for (let y = 0; y < LED.h; y++) b.rect(LED.x, LED.y + y, LED.w, 1, mix(hex("#0d0a1f"), hex("#281650"), y / LED.h));
    for (const s of LED_STARS) { const tw = 0.5 + 0.5 * Math.sin(at * 1.4 + s.p); b.px(LED.x + s.x, LED.y + s.y, mix(hex("#3a2f66"), C.goldL, tw)); }
    b.ell(LED.x + 160, LED.y + 24, 12, 12, hex("#f2e8d5")); b.ell(LED.x + 165, LED.y + 21, 11, 11, hex("#150f2e"));
    const nc = started ? clamp(Math.floor((tt / 3) * CONST.length) + 1, 1, CONST.length) : CONST.length;
    for (let i = 0; i < nc; i++) {
      const [px, py] = CONST[i];
      if (i > 0) b.line(LED.x + CONST[i - 1][0], LED.y + CONST[i - 1][1] + 6, LED.x + px, LED.y + py + 6, hex("#5a4a8a"), 1);
      sparkle(b, LED.x + px, LED.y + py + 6, 2, C.goldL);
    }
    if (!reveal) {
      if (Math.floor(at * 2.2) % 2 === 0 || !started) textC(b, "AND THE WINNER IS...", LED.x + LED.w / 2, LED.y + 56, C.gold, 2);
    } else {
      const k = smooth((tt - 2.4) / 0.5);
      b.glow(LED.x + LED.w / 2, LED.y + 24, 70, C.gold, 0.35 * k + 0.1 * Math.sin(at * 4));
      textC(b, "ELEN", LED.x + LED.w / 2 + 3, LED.y + 8 + 3, hex("#9b602d"), 6, k);
      textC(b, "ELEN", LED.x + LED.w / 2, LED.y + 8, C.goldL, 6, k);
    }
    // piso
    b.rect(0, 150, W, 66, hex("#2b1b22")); b.rect(0, 150, W, 2, C.goldD);
    for (const y of [158, 167, 177, 188, 200, 213]) b.rect(0, y, W, 1, hex("#1c1117"));
    for (let r = 0; r < 6; r++) { const y0 = [152, 158, 167, 177, 188, 200][r], hh = [6, 9, 10, 11, 12, 13][r]; for (let x = (r % 2) * 20; x < W; x += 40 + r * 4) b.rect(x, y0, 1, hh, hex("#1c1117")); }
    // feixes de luz
    const elS = elenStage(tt);
    const spots = [[60, 0, 150, 176], [324, 0, 250, 176]];
    for (const [ox, oy, tx, ty] of spots) { cone(b, ox, oy, tx, ty, 3, 26, hex("#ffe9b0"), 0.1 * lights); b.blendRect(tx - 28, ty - 2, 56, 4, hex("#ffe9b0"), 0.16 * lights); }
    if (started && tt > 2.8) { const ex = Math.max(30, elS.x); cone(b, 192, 0, ex, 182, 5, 30, hex("#fff3cc"), 0.16); b.blendRect(ex - 30, 179, 60, 5, hex("#fff3cc"), 0.22); }
    // cortinas
    for (const side of [0, 1]) {
      for (let y = 0; y < 176; y++) {
        const wdt = Math.round(52 - 14 * (y / 176));
        for (let i = 0; i < wdt; i++) {
          const x = side ? W - 1 - i : i, sh = 0.5 + 0.5 * Math.sin(i * 0.75 + (y > 100 ? 0.4 : 0));
          b.px(x, y, mix(hex("#3e1624"), hex("#8c3a55"), sh * 0.8 * (1 - y / 520)));
        }
      }
      const tx = side ? W - 40 : 40;
      b.rect(side ? W - 48 : 0, 118, 48, 4, C.gold); b.rect(tx - 2 + (side ? -4 : 4), 122, 4, 12, C.goldD);
    }
    for (let x = 0; x < W; x++) { const d = 12 + Math.round(10 * Math.abs(Math.sin(x * Math.PI / 64))); b.rect(x, 0, 1, d, hex("#702D42")); b.rect(x, d, 1, 2, C.gold); if (x % 3 === 0) b.px(x, d + 2, C.goldD); }
    for (let x = 4; x < W; x += 12) { const on = (Math.floor(x / 12) + Math.floor(at * 3)) % 2 === 0; b.rect(x, 3, 2, 2, on ? C.goldL : hex("#7a5a3a")); }
    // pódio e troféu
    const handoff = started ? clamp((tt - 9.0) / 1.4, 0, 1) : 0;
    const carPose = !started ? "hold" : (tt >= 9.0 && tt < 10.2 ? "offer" : "hold");
    const carlos = carlosSprite(carPose, 0, 0);
    b.blit(carlos.buf, 252 - carlos.ax, 178 - carlos.ay);
    b.rect(232, 138, 42, 42, hex("#3a2128")); b.rect(232, 138, 42, 3, C.gold); b.rect(232, 177, 42, 3, C.goldD); b.rect(236, 144, 34, 30, hex("#2d1a20"));
    sparkle(b, 253, 159, 5, C.gold); b.rect(251, 157, 5, 5, C.gold); b.px(253, 159, C.goldL);
    b.rect(264, 124, 2, 14, hex("#15111c")); b.ell(265, 123, 3, 2, hex("#15111c")); // microfone
    // envelope no pódio (abre aos 1.6s)
    if (!started || tt < 2.8) { envelope(b, 245, 128 - 0, started && tt > 1.6); }
    if (!started || tt < 9.0) b.blit(TROPHY, 238, 111);
    // Elen
    {
      const ex = elS.x;
      const wf = elS.walking ? (ex / 26) % 1 : (elS.f || 0);
      const sp = elenSprite(elS.pose, wf < 0 ? wf + 1 : wf);
      const bob = elS.walking ? Math.round(Math.abs(Math.sin(wf * Math.PI * 2)) * 1.5) : 0;
      const jump = (started && tt >= 10.4) ? Math.round(Math.abs(Math.sin(at * 5)) * 3) : 0;
      const fy = 184, ox = ex - sp.ax, oy = fy - sp.ay + 1 - bob - jump;
      b.blendRect(ex - 28, fy - 2, 56, 5, C.black, 0.4);
      if (started && tt > 2.9) b.blit(sp.buf, ox, oy);
      if (started && tt >= 9.0) {
        const hx = ox + sp.hand.x, hy = oy + sp.hand.y;
        const targetTy = hy - 16;
        if (tt >= 10.4) {
          b.glow(hx, hy, 28, C.gold, 0.45);
          b.blit(TROPHY, hx - 11, targetTy);
          const skinDark = 0xff5f83c0, skinMed = 0xff779cd0, skinLite = 0xff7da3d4;
          b.px(hx - 1, hy, skinLite); b.px(hx, hy, skinMed); b.px(hx + 1, hy, skinLite);
          b.px(hx - 1, hy + 1, skinMed); b.px(hx, hy + 1, skinDark); b.px(hx + 1, hy + 1, skinMed);
          sparkle(b, hx + 12, targetTy + 4, 3, C.goldL);
          sparkle(b, hx - 14, targetTy + 8, 2, C.goldL);
        } else {
          const px = lerp(238, hx - 11, smooth(handoff)),
                py = lerp(111, targetTy, smooth(handoff)) - Math.sin(handoff * Math.PI) * 14;
          b.blit(TROPHY, px, py);
        }
      }
    }
    // plateia em silhueta
    const ovation = reveal;
    const flashesLv = [];
    for (const row of [0, 1]) {
      for (const a of AUD) {
        if (a.row !== row) continue;
        const bob = Math.round(Math.sin(at * (ovation ? 6 : 2) + a.id) * (ovation ? 2 : 1));
        const baseY = row ? 208 : 216, x = a.x, rim = hex("#3a2b4f"), body = row ? hex("#14101c") : hex("#0b0810");
        if (ovation && hash(a.id * 3 + row) > 0.25) {
          const up = 14 + Math.round(Math.sin(at * 9 + a.id) * 3), lx = x - 5 - (a.id % 2), rx = x + 5 + (a.id % 2);
          b.line(x - 5, baseY - 10 + bob, lx, baseY - 10 - up, body, 3); b.line(x + 5, baseY - 10 + bob, rx, baseY - 10 - up, body, 3);
          if (hash(a.id * 7) < 0.3) { b.rect(rx - 2, baseY - 10 - up - 7, 5, 7, hex("#15111c")); b.rect(rx - 1, baseY - 10 - up - 6, 3, 5, hex("#8fb4cc")); flashesLv.push({ x: rx, y: baseY - 10 - up - 4, id: a.id + row * 50 }); }
        }
        b.ell(x, baseY + 8 + bob, 9, 12, rim); b.ell(x, baseY + 9 + bob, 9, 12, body);
        b.ell(x, baseY - 3 + bob, 5, 5, rim); b.ell(x, baseY - 2 + bob, 5, 5, body);
      }
    }
    if (ovation) { const lv = drawFlashes(b, at, flashesLv, 1); if (lv > 0) b.blendRect(0, 0, W, H, C.white, 0.08 * lv); }
    // efeitos de festa
    if (started) {
      pyro(b, tt, 2.4, 13.2 + 6, 70, 186, 31); pyro(b, tt, 2.4, 13.2 + 6, W - 70, 186, 37);
      cannon(b, tt, 2.4, 20, 190, 1, 60, 3); cannon(b, tt, 2.4, W - 20, 190, -1, 60, 5);
      cannon(b, tt, 10.4, 20, 190, 1, 70, 9); cannon(b, tt, 10.4, W - 20, 190, -1, 70, 11);
      confetti(b, tt, 2.6, 90, 21);
      if (tt > 10.4) confetti(b, tt, 10.4, 80, 41);
    }
    if (started && tt < 2.4) b.blendRect(0, 0, W, H, C.black, 0.45 * (1 - lights) + 0.12 + 0.05 * Math.sin(at * 20));
    if (started && tt >= 2.4 && tt < 2.6) b.blendRect(0, 0, W, H, C.white, 0.7 * (1 - (tt - 2.4) / 0.2));
    for (let i = 0; i < 6; i++) { b.blendRect(0, H - 2 - i * 2, W, 2, C.black, 0.28 - i * 0.045); }
  }

  const STAGE = {
    duration: STAGE_END,
    captions: [],
    events: [{ t: 0.0, name: "drum" }, { t: 2.4, name: "reveal" }, { t: 3.0, name: "walk" }, { t: 10.4, name: "trophy" }],
    render: renderStage
  };

  const SCENES = { carpet: CARPET, stage: STAGE };

  /* ==========================================================
     CONTROLADOR (navegador)
     ========================================================== */
  function mount(canvas, name, opts = {}) {
    const scene = SCENES[name];
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const buf = new Buf(W, H);
    const img = ctx.createImageData(W, H);
    const img32 = new Uint32Array(img.data.buffer);
    const reduced = !!opts.reducedMotion;
    const t0m = performance.now();
    let startedAt = null, raf = 0, last = 0, ended = false, capIdx = -1, evIdx = 0, running = false;
    let targetT = null, currentT = 0, glideSpeed = 1.0;

    function elapsed(now) { return startedAt == null ? -1 : (now - startedAt) / 1000; }
    function draw(t, at) { scene.render(buf, t, at); img32.set(buf.d); ctx.putImageData(img, 0, 0); }

    function step(now) {
      if (!running) return;
      raf = requestAnimationFrame(step);
      if (now - last < 33) return;
      const dt = last === 0 ? 0.033 : Math.min(0.1, (now - last) / 1000);
      last = now;
      let t;
      if (targetT != null) {
        if (currentT < targetT) {
          currentT = Math.min(targetT, currentT + dt * glideSpeed);
        } else if (currentT > targetT) {
          currentT = Math.max(targetT, currentT - dt * glideSpeed);
        }
        t = currentT;
      } else {
        t = elapsed(now);
      }
      const at = (now - t0m) / 1000;
      if (t >= 0) {
        while (evIdx < scene.events.length && t >= scene.events[evIdx].t) { opts.onEvent && opts.onEvent(scene.events[evIdx].name); evIdx++; }
        let ci = capIdx; while (ci + 1 < scene.captions.length && t >= scene.captions[ci + 1].t) ci++;
        if (ci !== capIdx) { capIdx = ci; opts.onCaption && opts.onCaption(scene.captions[ci].text, ci); }
        if (t >= scene.duration) { t = scene.duration; if (!ended) { ended = true; opts.onEnd && opts.onEnd(); } }
      }
      draw(t, at);
    }

    const api = {
      scene,
      get playing() { return (startedAt != null || targetT != null) && !ended; },
      get ended() { return ended; },
      show() { // desenha um quadro e (se não reduzido) mantém a animação ambiente
        if (reduced) { draw(startedAt == null && targetT == null ? -1 : (targetT != null ? targetT : scene.duration), 0); return; }
        if (!running) { running = true; raf = requestAnimationFrame(step); }
      },
      play() {
        if (reduced) { this.finish(); return; }
        targetT = null; startedAt = performance.now(); ended = false; capIdx = -1; evIdx = 0;
        this.show();
      },
      glideTo(destT, spd = 1.0) {
        if (reduced) { currentT = destT; targetT = destT; draw(destT, 0); return; }
        targetT = destT;
        glideSpeed = spd;
        this.show();
      },
      setTime(destT) {
        currentT = destT;
        targetT = destT;
        if (reduced) { draw(destT, 0); return; }
        this.show();
      },
      finish() { // pula direto para o fim
        const lastCap = scene.captions.length ? scene.captions[scene.captions.length - 1] : null;
        if (lastCap && opts.onCaption) opts.onCaption(lastCap.text, scene.captions.length - 1);
        targetT = null; currentT = scene.duration;
        startedAt = performance.now() - scene.duration * 1000; evIdx = scene.events.length; capIdx = scene.captions.length - 1;
        if (!ended) { ended = true; opts.onEnd && opts.onEnd(); }
        if (reduced) draw(scene.duration, 0); else this.show();
      },
      reset() { startedAt = null; targetT = null; currentT = 0; ended = false; capIdx = -1; evIdx = 0; if (reduced) draw(-1, 0); },
      stop() { running = false; cancelAnimationFrame(raf); }
    };
    return api;
  }

  const api = { mount, Buf, makeCrowd, TROPHY, SCENES, W, H, elenSprite, carlosSprite };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Ceremony = api;
})(typeof window !== "undefined" ? window : globalThis);
