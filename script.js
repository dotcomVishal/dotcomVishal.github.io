
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');

const W = 900, H = 310;
canvas.width = W; canvas.height = H;

const C   = '#1a1a1a';  // updated to match new --ink colour
const BG  = '#f0f0f0';  // updated to match new --paper colour
const LG  = '#aaaaaa';
const S   = 3;   // pixel scale — 3px per dot = big crisp sprites

// ── LAYOUT ───────────────────────────────────────────────
const GX_L = 80,  GX_R = 820;
const GY   = 220, GR   = 18;
const BT   = GY - GR;    // belt top surface  = 202
const BB   = GY + GR;    // belt bottom       = 238
const SPD  = 1.8;

// ── PIXEL PAINTER ────────────────────────────────────────
function px(g, ox, oy, col) {
  ctx.fillStyle = col || C;
  g.forEach((row, r) =>
    row.forEach((v, c) => { if (v) ctx.fillRect(ox + c*S, oy + r*S, S, S); })
  );
}

// ── DETAILED SPRITES (larger grids → 3× bigger on screen) ──
//   Each sprite is ~12–15 cols × 10–13 rows  →  36-45 × 30-39 px
const DEFS = {

  /* ── ELECTRICAL ── */

  // PCB — clear border, internal traces + via dots
  pcb: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,0,1,0,1,0,0,1,0,0,1],
    [1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,1],
    [1,1,0,1,0,0,1,0,1,0,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],

  // IC Chip — body with visible pin legs top and bottom
  chip: [
    [0,1,0,1,0,1,0,1,0,1,0,1,0],
    [0,1,0,1,0,1,0,1,0,1,0,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,0,0,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,0,0,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,1,0,1,0,1,0,1,0,1,0,1,0],
    [0,1,0,1,0,1,0,1,0,1,0,1,0],
  ],

  // Battery — clear body, +/- terminals, charge bars
  battery: [
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,0,1,0,0,1,0,0,0],
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,1,0,0,0,1],
    [1,0,0,0,1,0,0,0,0,1],
    [1,0,0,1,1,1,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1],
  ],

  // Resistor — body with color bands, wire leads
  resistor: [
    [0,0,1,0,0,0,0,0,0,0,0,1,0,0],
    [0,0,1,0,0,0,0,0,0,0,0,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,0,0],
    [1,1,1,0,0,0,0,0,0,0,0,1,1,1],
    [1,0,0,0,1,0,1,0,1,0,0,0,0,1],
    [1,0,0,0,1,0,1,0,1,0,0,0,0,1],
    [1,1,1,0,0,0,0,0,0,0,0,1,1,1],
    [0,0,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,0,0,0,0,0,0,0,0,1,0,0],
    [0,0,1,0,0,0,0,0,0,0,0,1,0,0],
  ],

  // CRT Monitor — bezel, screen content, stand
  monitor: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,0,0,1,1,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,1,1,1,1,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,1,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,0,1,1,0,0,0,0,0,0,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,0,1,1,1,1,1,1,0,0,0,0],
  ],

  /* ── MECHANICAL ── */

  // Cog — 8-tooth gear with hollow center
  cog: [
    [0,0,0,1,1,1,1,1,1,0,0,0],
    [0,0,1,0,0,0,0,0,0,1,0,0],
    [0,1,1,0,0,0,0,0,0,1,1,0],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,1,1,1,0,0,0,1],
    [1,0,0,1,1,0,0,1,1,0,0,1],
    [1,0,0,1,0,0,0,0,1,0,0,1],
    [1,0,0,1,1,0,0,1,1,0,0,1],
    [1,0,0,0,1,1,1,1,0,0,0,1],
    [0,1,1,0,0,0,0,0,0,1,1,0],
    [0,0,1,0,0,0,0,0,0,1,0,0],
    [0,0,0,1,1,1,1,1,1,0,0,0],
  ],

  // Wrench — clear wrench silhouette
  wrench: [
    [0,0,1,1,1,1,1,0,0,0,0],
    [0,1,1,0,0,0,1,1,0,0,0],
    [1,1,0,0,0,0,0,1,0,0,0],
    [1,1,0,0,0,0,0,1,0,0,0],
    [0,1,1,0,0,0,1,1,0,0,0],
    [0,0,1,1,0,1,1,0,0,0,0],
    [0,0,0,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,0],
    [0,0,0,0,1,1,1,0,0,0,0],
    [0,0,0,0,0,1,1,1,0,0,0],
    [0,0,0,0,0,0,1,1,1,0,0],
    [0,0,0,0,0,0,1,1,1,0,0],
  ],

  // Hex bolt — top view
  bolt: [
    [0,0,1,1,1,1,0,0],
    [0,1,1,0,0,1,1,0],
    [1,1,0,0,0,0,1,1],
    [1,0,0,1,1,0,0,1],
    [1,0,0,1,1,0,0,1],
    [1,1,0,0,0,0,1,1],
    [0,1,1,0,0,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,1,1,1,1,0,0],
  ],

  // Spring — coil shape
  spring: [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [0,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0],
    [1,1,0,0,0,0,0,0,0,1],
    [0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,1,1],
    [0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0],
    [1,1,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1],
  ],

  /* ── CODE / SOFTWARE ── */

  // Code block — terminal window with syntax lines
  code: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,0,0,1,1,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,1,0,0,1,0,0,1,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,0,1,0,0,1,1,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,1,0,0,0,1,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],

  // Circuit diagram / schematic fragment
  circuit: [
    [0,0,0,0,0,1,1,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,1,0,0,0,0,0,0,0,1,0,0,0,0],
    [0,1,0,0,1,1,1,0,0,1,0,0,0,0],
    [0,1,0,0,0,0,0,0,0,1,0,0,0,0],
    [0,1,1,1,1,0,1,1,1,1,0,0,0,0],
    [0,0,0,0,1,0,1,0,0,0,0,0,0,0],
    [0,0,1,1,1,0,1,1,1,0,0,0,0,0],
    [0,0,1,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,1,0,1,1,1,0,1,0,0,0,0,0],
    [0,0,1,1,1,0,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
};

const KEYS   = Object.keys(DEFS);
const LABELS = ['v1.1','revA','revB','v2.0','v1.3','revC','alpha','beta','v3.0','r1.0','v0.9'];

// ── STATE ────────────────────────────────────────────────
let bScroll = 0, gAngle = 0, frame = 0;
let falling = [], belt = [];
let spawnClock = 0;
const SPAWN_EVERY = 100;

// ── ARM STATE ────────────────────────────────────────────
const ARM_X   = GX_R - 160;
const ARM_TOP = 10;
const ARM_BOT = BT - 10;

let armY    = ARM_TOP;
let armMode = 'idle';
let holdCnt = 0;
let armItem = null;
let flashT  = 0;
let lblIdx  = 0;

// ── SPAWN ────────────────────────────────────────────────
function spawnItem() {
  const key = KEYS[Math.floor(Math.random() * KEYS.length)];
  const g   = DEFS[key];
  const iw  = g[0].length;
  const ih  = g.length;
  falling.push({
    key, g,
    x: GX_L + 20,
    y: -ih * S,        // start above canvas
    vy: 0,
    w: iw, h: ih,
    stamped: false,
    label: null,
    flash: 0,
  });
}

// ── UPDATE ───────────────────────────────────────────────
function update() {
  frame++;
  bScroll += SPD;
  gAngle  += SPD / GR;

  if (++spawnClock >= SPAWN_EVERY) { spawnItem(); spawnClock = 0; }

  // falling → land on belt
  for (let i = falling.length - 1; i >= 0; i--) {
    const f = falling[i];
    f.vy += 0.45;
    f.y  += f.vy;
    if (f.y + f.h * S >= BT) {
      f.y = BT - f.h * S;
      f.vy = 0;
      belt.push(f);
      falling.splice(i, 1);
    }
  }

  // belt movement + cull
  for (let i = belt.length - 1; i >= 0; i--) {
    const b = belt[i];
    b.x += SPD;
    if (b.flash > 0) b.flash--;
    if (b.x > GX_R + 20) belt.splice(i, 1);
  }

  // arm FSM
  if (armMode === 'idle') {
    armY += (ARM_TOP - armY) * 0.18;
    const t = belt.find(b =>
      !b.stamped &&
      b.x + b.w * S > ARM_X - 18 &&
      b.x            < ARM_X + 18
    );
    if (t) { armItem = t; armMode = 'down'; }

  } else if (armMode === 'down') {
    armY = Math.min(armY + 7, ARM_BOT);
    if (armY >= ARM_BOT) {
      armMode = 'hold'; holdCnt = 24;
      if (armItem && !armItem.stamped) {
        armItem.stamped = true;
        armItem.label   = LABELS[lblIdx++ % LABELS.length];
        armItem.flash   = 12;
        flashT = 16;
      }
    }

  } else if (armMode === 'hold') {
    if (--holdCnt <= 0) armMode = 'up';

  } else if (armMode === 'up') {
    armY = Math.max(armY - 7, ARM_TOP);
    if (armY <= ARM_TOP) { armMode = 'idle'; armItem = null; }
  }

  if (flashT > 0) flashT--;
}

// ── DRAW GEAR ────────────────────────────────────────────
function drawGear(cx, cy, dir) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(gAngle * dir);
  ctx.fillStyle = C;
  for (let i = 0; i < 10; i++) {
    ctx.save();
    ctx.rotate((i / 10) * Math.PI * 2);
    ctx.fillRect(-3, -(GR + 7), 6, 8);
    ctx.restore();
  }
  for (let dy = -GR; dy <= GR; dy += 2) {
    const hw = Math.round(Math.sqrt(Math.max(0, GR*GR - dy*dy)) / 2) * 2;
    if (hw > 0) ctx.fillRect(-hw, dy, hw*2, 2);
  }
  ctx.fillStyle = BG;
  ctx.fillRect(-4, -4, 8, 8);
  ctx.fillStyle = C;
  ctx.fillRect(-1, -1, 3, 3);
  ctx.restore();
}

// ── DRAW BELT ────────────────────────────────────────────
function drawBelt() {
  ctx.fillStyle = LG;
  ctx.fillRect(GX_L, BT, GX_R - GX_L, BB - BT);

  const lw = 22, off = bScroll % lw;
  ctx.fillStyle = C;
  for (let x = GX_L - off; x < GX_R + lw; x += lw) {
    const rx = Math.round(x);
    if (rx > GX_L && rx < GX_R) ctx.fillRect(rx, BT, 2, BB - BT);
  }

  ctx.fillStyle = C;
  ctx.fillRect(GX_L, BT, GX_R - GX_L, 3);
  ctx.fillRect(GX_L, BB - 3, GX_R - GX_L, 3);

  [230, 400, 560, 700].forEach(lx => {
    ctx.fillRect(lx - 4, BB, 8, 32);
    ctx.fillRect(lx - 16, BB + 28, 32, 5);
  });

  ctx.fillRect(0, BB + 33, W, 2);
  ctx.fillStyle = '#888888';
  for (let x = 8; x < W; x += 15) ctx.fillRect(x, BB + 38, 2, 2);
}

// ── DRAW ARM (prominent VISION arm) ──────────────────────
function drawArm() {
  const ax = ARM_X;
  const ay = armY;

  ctx.fillStyle = C;

  // ── ceiling mount — wide heavy bracket
  ctx.fillRect(ax - 38, 0, 76, 10);
  // bracket side bolts (pixel dots)
  [ax-32, ax-18, ax+16, ax+30].forEach(bx => {
    ctx.fillRect(bx-1, 3, 4, 4);
  });

  // ── dual rails (two parallel shafts)
  ctx.fillRect(ax - 12, 10, 8, ay - 10);
  ctx.fillRect(ax +  4, 10, 8, ay - 10);

  // ── horizontal crossbar — thick double bar
  ctx.fillRect(ax - 38, ay, 76, 5);
  ctx.fillRect(ax - 38, ay + 7, 76, 4);

  // ── hydraulic piston details on shaft
  const midY = Math.round(10 + (ay - 10) / 2);
  ctx.fillRect(ax - 16, midY - 6, 16, 12);  // piston band left
  ctx.fillRect(ax +  4, midY - 6, 16, 12);  // piston band right
  ctx.fillStyle = BG;
  ctx.fillRect(ax - 14, midY - 4, 12, 8);
  ctx.fillRect(ax +  6, midY - 4, 12, 8);
  ctx.fillStyle = C;
  ctx.fillRect(ax - 10, midY - 1, 4, 3);
  ctx.fillRect(ax +  8, midY - 1, 4, 3);

  // ── stamp head — large flat iron
  const headY = ay + 11;
  ctx.fillStyle = flashT > 0 ? BG : C;
  ctx.fillRect(ax - 34, headY, 68, 14);
  ctx.fillStyle = C;
  ctx.fillRect(ax - 36, headY + 2, 4, 10);   // side ears
  ctx.fillRect(ax + 32, headY + 2, 4, 10);

  // stamp serrations
  for (let i = 0; i < 10; i++)
    ctx.fillRect(ax - 30 + i * 7, headY + 14, 5, 6);

  // sparks on impact
  if (flashT > 10) {
    ctx.fillStyle = C;
    [[-38,16],[38,16],[0,22],[-20,22],[20,22],[-12,26],[12,26]].forEach(([dx,dy]) => {
      ctx.fillRect(ax+dx-2, headY+dy, 4, 4);
    });
  }

  // ── VISION badge — boxed label above arm
  const lx = ax - 36, ly = -2;
  ctx.fillStyle = C;
  ctx.fillRect(lx, ly, 72, 17);
  ctx.fillStyle = BG;
  ctx.fillRect(lx+2, ly+2, 68, 13);
  ctx.fillStyle = C;
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('VISION', ax, ly + 12);
  ctx.textAlign = 'left';
}

// ── DRAW ITEMS ───────────────────────────────────────────
function drawItems() {
  [...falling, ...belt].forEach(it => {
    const col = it.flash > 0 ? BG : C;
    px(it.g, it.x, it.y, col);
    if (it.label) {
      ctx.fillStyle = C;
      ctx.font = 'bold 9px monospace';
      ctx.fillText(it.label, it.x, it.y - 4);
    }
  });
}

// ── BACKGROUND DOTS ──────────────────────────────────────
function drawDots() {
  ctx.fillStyle = 'rgba(26,26,26,0.06)';
  for (let gx = 0; gx < W; gx += 24)
    for (let gy = 0; gy < H; gy += 24)
      ctx.fillRect(gx, gy, 2, 2);
}

// ── MAIN LOOP ────────────────────────────────────────────
function loop() {
  update();

  ctx.clearRect(0, 0, W, H);

  drawDots();
  drawBelt();
  drawGear(GX_L, GY,  1);
  drawGear(GX_R, GY, -1);
  drawArm();
  drawItems();

  requestAnimationFrame(loop);
}

loop();

// --- FADE OUT ON SCROLL ---
const bgContainer = document.querySelector('.dino-bg');

window.addEventListener('scroll', () => {
  let scrollRatio = window.scrollY / 400;
  let newOpacity = 0.35 - (scrollRatio * 0.35);
  if (newOpacity < 0) newOpacity = 0;
  bgContainer.style.opacity = newOpacity;
});

// --- INTERACTIVE SLIDER LOGIC ---
// Wrapped in a closure to keep variables separate from the canvas code above
(() => {

  // Returns the right card widths for the current screen size.
  // Active card fills most of the screen; inactive cards are thin slivers.
  function getWidths() {
    const vw = window.innerWidth;
    if (vw < 480) return { active: vw - 80,  inactive: 18 };   // mobile
    if (vw < 768) return { active: vw - 160, inactive: 60 };   // tablet
    return               { active: 550,       inactive: 180 };  // desktop
  }

  let W_ACTIVE   = getWidths().active;
  let W_INACTIVE = getWidths().inactive;

  // Update widths when the window is resized
  window.addEventListener('resize', () => {
    W_ACTIVE   = getWidths().active;
    W_INACTIVE = getWidths().inactive;
  });

  const LERP_CARD  = 0.09;
  const LERP_ROVER = 0.08;

  let current = 0;
  let locked  = false;
  const TOTAL = 4;

  const sliderCards = Array.from(document.querySelectorAll('.card'));
  const dotEls      = Array.from(document.querySelectorAll('.dot'));
  const sliderRover = document.getElementById('rover');
  const btnPrev     = document.getElementById('btnPrev');
  const btnNext     = document.getElementById('btnNext');

  const cardW    = sliderCards.map(() => W_INACTIVE);
  let roverX     = 0;
  const bodyShown = sliderCards.map(() => false);

  function lerp(a, b, t) { return a + (b - a) * t; }

  function cardCenterX(i) {
    const r = sliderCards[i].getBoundingClientRect();
    return r.left + r.width / 2;
  }

  function setBodyVisible(i, visible) {
    if (bodyShown[i] === visible) return;
    bodyShown[i] = visible;
    const wrap = sliderCards[i].querySelector('.card-body-wrap');
    const num  = sliderCards[i].querySelector('.card-num');
    const tag  = sliderCards[i].querySelector('.card-tag');
    if (visible) {
      wrap.style.maxHeight = '360px'; wrap.style.opacity = '1';
      num.style.opacity = '1'; tag.style.opacity = '1';
    } else {
      wrap.style.maxHeight = '0'; wrap.style.opacity = '0';
      num.style.opacity = '0'; tag.style.opacity = '0';
    }
  }

  function tickSlider() {
    sliderCards.forEach((card, i) => {
      const target = i === current ? W_ACTIVE : W_INACTIVE;
      cardW[i] = lerp(cardW[i], target, LERP_CARD);
      if (Math.abs(cardW[i] - target) < 0.15) cardW[i] = target;

      card.style.width = cardW[i] + 'px';
      const progress = (cardW[i] - W_INACTIVE) / (W_ACTIVE - W_INACTIVE);
      card.style.opacity = (0.36 + progress * 0.64).toFixed(3);

      if (i === current) {
        card.style.boxShadow = progress > 0.5
          ? '7px 7px 0 #1a1a1a, 11px 11px 0 rgba(0,0,0,0.07)'
          : 'none';
      } else {
        card.style.boxShadow = 'none';
      }

      if (i === current && progress > 0.75) setBodyVisible(i, true);
      if (i !== current && progress < 0.40) setBodyVisible(i, false);
    });

    const targetX = cardCenterX(current);
    roverX = lerp(roverX, targetX, LERP_ROVER);
    if (Math.abs(roverX - targetX) < 0.1) roverX = targetX;
    sliderRover.style.left = roverX + 'px';

    requestAnimationFrame(tickSlider);
  }

  function goTo(i) {
    if (locked || i === current || i < 0 || i >= TOTAL) return;
    locked  = true;
    current = i;
    dotEls.forEach((d, j) => d.classList.toggle('active', j === i));
    btnPrev.disabled = i === 0;
    btnNext.disabled = i === TOTAL - 1;
    setTimeout(() => { locked = false; }, 750);
  }

  btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext.addEventListener('click', () => goTo(current + 1));
  dotEls.forEach((d, i)   => d.addEventListener('click', () => goTo(i)));
  sliderCards.forEach((c, i) => c.addEventListener('click', () => goTo(i)));
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // Set up initial state (wait two frames so layout is ready)
  requestAnimationFrame(() => requestAnimationFrame(() => {
    W_ACTIVE   = getWidths().active;
    W_INACTIVE = getWidths().inactive;

    cardW[0] = W_ACTIVE;
    sliderCards[0].style.width     = W_ACTIVE + 'px';
    sliderCards[0].style.opacity   = '1';
    sliderCards[0].style.boxShadow = '7px 7px 0 #1a1a1a, 11px 11px 0 rgba(0,0,0,0.07)';
    setBodyVisible(0, true);

    for (let i = 1; i < TOTAL; i++) {
      cardW[i] = W_INACTIVE;
      sliderCards[i].style.width   = W_INACTIVE + 'px';
      sliderCards[i].style.opacity = '0.36';
    }

    const r = sliderCards[0].getBoundingClientRect();
    roverX = r.left + r.width / 2;
    sliderRover.style.left = roverX + 'px';

    tickSlider();
  }));
})();
