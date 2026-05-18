(() => {
  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d", { alpha: false });

  // HUD
  const elHeight = document.getElementById("height");
  const elCombo = document.getElementById("combo");
  const elBest = document.getElementById("best");
  const elTitle = document.getElementById("ggTitle");
  const elSub = document.getElementById("ggSub");

  // Panel
  const panel = document.getElementById("panel");
  const panelTitle = document.getElementById("panelTitle");
  const panelText = document.getElementById("panelText");
  const btnStart = document.getElementById("btnStart");
  const btnOverlay = document.getElementById("btnOverlay");

  // Bottom actions
  const btnPause = document.getElementById("btnPause");
  const btnDrop = document.getElementById("btnDrop");
  const btnSubmit = document.getElementById("btnSubmit");
  const btnRestart = document.getElementById("btnRestart");
  const btnChat = document.getElementById("btnChat");

  // ---- Meta ----
  let META = { title: "Stack Tower", description: "" };
  async function loadMeta() {
    try {
      const res = await fetch("./game.json", { cache: "no-store" });
      META = (await res.json()) || META;
      const title = META.title || "Stack Tower";
      document.title = title;
      if (elTitle) elTitle.textContent = title;
      if (panelTitle) panelTitle.textContent = title;
      if (META.description && panelText) panelText.textContent = META.description;
      if (elSub) elSub.textContent = "Tap to drop • Perfect stacks = combo";
      window.GG?.init?.({ title });
    } catch {}
  }
  loadMeta();

  // ---- Canvas resize ----
  let DPR = 1;
  function resize() {
    const cssW = Math.max(1, canvas.clientWidth || window.innerWidth);
    const cssH = Math.max(1, canvas.clientHeight || window.innerHeight);
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(cssW * DPR);
    canvas.height = Math.floor(cssH * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); // draw in CSS pixels
  }
  requestAnimationFrame(() => {
    resize();
    window.addEventListener("resize", resize, { passive: true });
  });

  // ---- Game constants ----
  const BEST_KEY = "gg_stack_tower_best";
  let best = Number(localStorage.getItem(BEST_KEY) || "0") || 0;

  const COLORS = [
    "rgba(34,197,94,.92)",
    "rgba(59,130,246,.92)",
    "rgba(168,85,247,.88)",
    "rgba(14,165,233,.90)",
    "rgba(250,204,21,.88)",
    "rgba(244,63,94,.84)"
  ];

  const keys = new Set();

  // ---- State ----
  let running = false;
  let paused = false;
  let gameOver = false;

  let height = 0;         // blocks stacked
  let combo = 0;          // perfect streak
  let score = 0;          // we submit score = height + bonus

  // camera offset so tower stays mid-screen
  let camY = 0;

  // stack blocks (settled)
  let stack = []; // {x,y,w,h,color}
  let current = null; // moving block {x,y,w,h,vx,color}
  let dir = 1;

  // base platform
  const base = { x: 0, y: 0, w: 240, h: 24 };

  // pointer
  const pointer = { down: false, tDown: 0, startX: 0, startY: 0, x: 0, y: 0 };

  function cw() { return canvas.clientWidth || 360; }
  function ch() { return canvas.clientHeight || 640; }

  function updateHud() {
    if (elHeight) elHeight.textContent = String(height | 0);
    if (elCombo) elCombo.textContent = String(combo | 0);
    if (elBest) elBest.textContent = String(best | 0);
  }

  function showPanel(title, text) {
    if (panelTitle) panelTitle.textContent = title;
    if (panelText) panelText.textContent = text;
    if (panel) panel.style.display = "flex";
  }

  function hidePanel() {
    if (panel) panel.style.display = "none";
  }

  function submitScore() {
    // Submit height-based score
    window.GG?.submitScore?.(score | 0);
  }

  function resetGame() {
    running = false;
    paused = false;
    gameOver = false;

    height = 0;
    combo = 0;
    score = 0;
    camY = 0;

    const w = cw();
    const h = ch();

    base.x = w * 0.5;
    base.y = h * 0.84;

    stack = [{
      x: base.x,
      y: base.y,
      w: base.w,
      h: base.h,
      color: "rgba(255,255,255,.12)"
    }];

    spawnNextBlock();

    updateHud();
    showPanel(META.title || "Stack Tower", META.description || "Tap to drop blocks. Perfect stacks build combo points.");
  }

  function startGame() {
    running = true;
    paused = false;
    gameOver = false;
    hidePanel();
  }

  function togglePause() {
    if (!running || gameOver) return;
    paused = !paused;
    if (paused) showPanel("Paused", "Tap Start to resume.");
    else hidePanel();
  }

  function endGame(reason) {
    gameOver = true;
    running = false;
    paused = false;

    if (height > best) {
      best = height;
      localStorage.setItem(BEST_KEY, String(best));
    }
    updateHud();

    showPanel("Game Over", `${reason}\n\nHeight: ${height} • Best: ${best}\nTap Start to try again.`);
    submitScore();
  }

  // ---- Core mechanics ----
  function spawnNextBlock() {
    const top = stack[stack.length - 1];

    const w = Math.max(60, top.w); // starts same width, shrinks with mistakes
    const h = 20;

    // new block sits above top
    const y = top.y - (top.h * 0.5 + h * 0.5 + 10);

    // start from left or right off-screen
    const screenW = cw();
    const fromLeft = (height % 2 === 0);
    const x = fromLeft ? -w : screenW + w;

    // speed increases slowly with height and combo
    const baseSpeed = 170 + Math.min(220, height * 10) + Math.min(120, combo * 6);
    const vx = fromLeft ? baseSpeed : -baseSpeed;

    current = {
      x,
      y,
      w,
      h,
      vx,
      color: COLORS[(height + combo) % COLORS.length]
    };

    // camera follows upward
    const targetCam = Math.max(0, (ch() * 0.5) - current.y);
    camY += (targetCam - camY) * 0.18;
  }

  function dropBlock() {
    if (!running || paused || gameOver) return;
    if (!current) return;

    const top = stack[stack.length - 1];

    // Overlap in X
    const leftA = current.x - current.w * 0.5;
    const rightA = current.x + current.w * 0.5;
    const leftB = top.x - top.w * 0.5;
    const rightB = top.x + top.w * 0.5;

    const overlapL = Math.max(leftA, leftB);
    const overlapR = Math.min(rightA, rightB);
    const overlapW = overlapR - overlapL;

    // Missed completely
    if (overlapW <= 6) {
      endGame("You missed the stack!");
      return;
    }

    const newX = overlapL + overlapW * 0.5;
    const perfect = Math.abs(newX - top.x) <= 4; // perfect threshold

    // Perfect snap + combo
    if (perfect) {
      current.x = top.x;
      combo += 1;
      // small reward (doesn't change width)
      score += 10 + combo * 3;
    } else {
      combo = 0;
      // shrink to overlap
      current.x = newX;
      current.w = overlapW;
      // reward
      score += 6;
    }

    // settle current
    stack.push({ x: current.x, y: current.y, w: current.w, h: current.h, color: current.color });

    height += 1;
    score += 20; // base per block

    // move tower upward a bit by shifting y for next block
    // (camera handles visual; positions are static)
    spawnNextBlock();
    updateHud();
  }

  // ---- Input ----
  function canvasPoint(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture?.(e.pointerId);
    const p = canvasPoint(e);
    pointer.down = true;
    pointer.tDown = performance.now();
    pointer.startX = p.x;
    pointer.startY = p.y;
    pointer.x = p.x;
    pointer.y = p.y;

    // Start on first interaction
    if (!running && !gameOver) startGame();
    if (gameOver) {
      resetGame();
      startGame();
    }
  }, { passive: true });

  canvas.addEventListener("pointerup", (e) => {
    if (!pointer.down) return;
    pointer.down = false;

    const p = canvasPoint(e);
    const dt = performance.now() - pointer.tDown;
    const dx = p.x - pointer.startX;
    const dy = p.y - pointer.startY;
    const dist2 = dx * dx + dy * dy;

    // treat quick tap as drop (ignore scroll-like moves)
    if (dt < 260 && dist2 < 18 * 18) dropBlock();
  }, { passive: true });

  window.addEventListener("keydown", (e) => {
    keys.add(e.key);
    if (e.key === " " || e.key === "Enter") dropBlock();
    if (e.key === "p" || e.key === "P") togglePause();
    if (e.key === "r" || e.key === "R") { resetGame(); startGame(); }
  });
  window.addEventListener("keyup", (e) => keys.delete(e.key));

  // Buttons
  btnStart.onclick = () => {
    if (gameOver) resetGame();
    if (!running) startGame();
    else if (paused) togglePause();
    else startGame();
  };
  btnOverlay.onclick = () => window.GG?.openOverlay?.();
  btnChat.onclick = () => window.GG?.openOverlay?.();

  btnPause.onclick = () => togglePause();
  btnDrop.onclick = () => dropBlock();

  btnRestart.onclick = () => {
    resetGame();
    startGame();
  };

  btnSubmit.onclick = () => {
    submitScore();
    window.GG?.openOverlay?.();
  };

  // ---- Loop ----
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    step(dt);
    draw();

    requestAnimationFrame(loop);
  }

  function step(dt) {
    // Smooth camera follow even when paused (looks nice)
    if (current) {
      const targetCam = Math.max(0, (ch() * 0.5) - current.y);
      camY += (targetCam - camY) * 0.14;
    }

    if (!running || paused || gameOver) return;

    // Move current block horizontally
    if (current) {
      current.x += current.vx * dt;

      const w = cw();
      const half = current.w * 0.5;

      // bounce at edges with a small padding
      if (current.x - half < 10) {
        current.x = 10 + half;
        current.vx *= -1;
      } else if (current.x + half > w - 10) {
        current.x = (w - 10) - half;
        current.vx *= -1;
      }
    }

    // Keep score aligned with height
    score = Math.max(score, height * 20 + combo * 10);
    if (height > best) {
      best = height;
      localStorage.setItem(BEST_KEY, String(best));
    }
    updateHud();
  }

  // ---- Drawing ----
  function draw() {
    const w = cw();
    const h = ch();

    // background
    ctx.fillStyle = "#070b16";
    ctx.fillRect(0, 0, w, h);

    // vertical gradient haze
    ctx.save();
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(34,197,94,.12)");
    g.addColorStop(1, "rgba(59,130,246,.10)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // Draw tower with camera offset
    ctx.save();
    ctx.translate(0, camY);

    // guide line center
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.setLineDash([6, 10]);
    ctx.beginPath();
    ctx.moveTo(w * 0.5, -10000);
    ctx.lineTo(w * 0.5, 10000);
    ctx.stroke();
    ctx.restore();

    // settled stack
    for (let i = 0; i < stack.length; i++) {
      const b = stack[i];
      drawBlock(b.x, b.y, b.w, b.h, b.color, i === stack.length - 1);
    }

    // current moving block
    if (current) {
      drawBlock(current.x, current.y, current.w, current.h, current.color, true);
      // shadow indicator on top block
      const top = stack[stack.length - 1];
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = "rgba(255,255,255,.12)";
      roundRectFill(current.x - current.w * 0.5, top.y - top.h * 0.5, current.w, top.h, 10);
      ctx.restore();
    }

    ctx.restore();

    // small hint for beginners
    if (!gameOver && running && !paused && height < 2) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = "rgba(255,255,255,.85)";
      ctx.font = "900 13px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Tap to DROP the moving block", w * 0.5, h * 0.62);
      ctx.restore();
    }

    // combo glow
    if (combo >= 2) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.55, 0.18 + combo * 0.06);
      ctx.fillStyle = "rgba(34,197,94,.9)";
      ctx.font = "1000 22px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(`COMBO x${combo}`, w * 0.5, 12);
      ctx.restore();
    }
  }

  function drawBlock(cx, cy, bw, bh, color, glow) {
    const x = cx - bw * 0.5;
    const y = cy - bh * 0.5;

    ctx.save();
    ctx.fillStyle = color;

    if (glow) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
    }

    roundRectFill(x, y, bw, bh, 10);

    // highlight strip
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "rgba(255,255,255,.9)";
    roundRectFill(x + 2, y + 2, bw - 4, Math.max(4, bh * 0.35), 8);

    ctx.restore();
  }

  function roundRectFill(x, y, w, h, r) {
    const rr = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
    ctx.fill();
  }

  // ---- Wire buttons ----
  btnDrop.onclick = () => dropBlock();

  // ---- Init ----
  updateHud();
  resetGame();
  requestAnimationFrame(loop);
})();
