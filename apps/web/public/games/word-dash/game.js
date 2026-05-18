(() => {
  // Elements
  const elScore = document.getElementById("score");
  const elTime = document.getElementById("time");
  const elStreak = document.getElementById("streak");

  const elTitle = document.getElementById("ggTitle");
  const elSub = document.getElementById("ggSub");

  const panel = document.getElementById("panel");
  const panelTitle = document.getElementById("panelTitle");
  const panelText = document.getElementById("panelText");

  const elTarget = document.getElementById("target");
  const elEntry = document.getElementById("entry");
  const elHint = document.getElementById("hint");
  const elToast = document.getElementById("toast");
  const elKeys = document.getElementById("keys");

  const btnStart = document.getElementById("btnStart");
  const btnOverlay = document.getElementById("btnOverlay");
  const btnPause = document.getElementById("btnPause");
  const btnSubmit = document.getElementById("btnSubmit");
  const btnRestart = document.getElementById("btnRestart");
  const btnChat = document.getElementById("btnChat");

  const btnBack = document.getElementById("btnBack");
  const btnEnter = document.getElementById("btnEnter");
  const btnClear = document.getElementById("btnClear");

  // Meta
  let META = { title: "Word Dash", description: "" };
  async function loadMeta() {
    try {
      const res = await fetch("./game.json", { cache: "no-store" });
      META = (await res.json()) || META;
      const title = META.title || "Word Dash";
      document.title = title;
      if (elTitle) elTitle.textContent = title;
      if (panelTitle) panelTitle.textContent = title;
      if (META.description && panelText) panelText.textContent = META.description;
      if (elSub) elSub.textContent = "Type fast • Keep streaks • Earn time";
      window.GG?.init?.({ title });
    } catch {}
  }
  loadMeta();

  // Words (compact list; we can expand later)
  const WORDS = [
    "PLAN", "MAP", "CODE", "GAME", "GLORY", "SCORE", "BOOST", "STACK",
    "SWIPE", "BRICK", "TOWER", "RACER", "PIXEL", "ARENA", "QUEST", "CRAFT",
    "DASH", "BLAST", "JUMP", "RUN", "FAST", "SKILL", "POWER", "LEVEL",
    "MUSIC", "LASER", "HYPER", "NINJA", "ROBOT", "DRIVE", "TRACK", "DRIFT",
    "FUSION", "NOVA", "ORBIT", "VORTEX", "SPARK", "STORM", "FLAME", "FROST",
    "BLADE", "SHIELD", "COMBO", "BONUS", "SHIFT", "BRAIN", "FOCUS", "SPEED"
  ];

  // State
  let running = false;
  let paused = false;
  let gameOver = false;

  let score = 0;
  let streak = 0;

  let timeLeft = 30.0;
  let entry = "";
  let target = "READY";

  let lastToastT = 0;

  const BEST_KEY = "gg_word_dash_best";
  let best = Number(localStorage.getItem(BEST_KEY) || "0") || 0;

  function pickWord() {
    const w = WORDS[(Math.random() * WORDS.length) | 0];
    return w;
  }

  function setTarget(w) {
    target = w;
    if (elTarget) elTarget.textContent = w;
  }

  function setEntry(s) {
    entry = s.toUpperCase().replace(/[^A-Z]/g, "");
    if (entry.length > 16) entry = entry.slice(0, 16);
    if (elEntry) elEntry.textContent = entry || " ";
  }

  function addLetter(ch) {
    if (!running || paused || gameOver) return;
    if (timeLeft <= 0) return;
    setEntry(entry + ch);
    // optional: auto-submit when length matches and exact? (keep manual for now)
  }

  function backspace() {
    if (!running || paused || gameOver) return;
    if (!entry) return;
    setEntry(entry.slice(0, -1));
  }

  function clearEntry() {
    if (!running || paused || gameOver) return;
    setEntry("");
  }

  function toast(msg, kind) {
    if (!elToast) return;
    elToast.textContent = msg;
    elToast.style.color =
      kind === "good" ? "rgba(34,197,94,.92)" :
      kind === "bad" ? "rgba(244,63,94,.88)" :
      "rgba(255,255,255,.86)";
    lastToastT = performance.now();
  }

  function updateHud() {
    if (elScore) elScore.textContent = String(score | 0);
    if (elTime) elTime.textContent = String(Math.max(0, timeLeft).toFixed(1));
    if (elStreak) elStreak.textContent = String(streak | 0);
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
    window.GG?.submitScore?.(score | 0);
  }

  function resetGame() {
    running = false;
    paused = false;
    gameOver = false;

    score = 0;
    streak = 0;
    timeLeft = 30.0;

    setEntry("");
    setTarget("READY");
    toast("Tap Start to begin.", "neutral");
    updateHud();

    showPanel(META.title || "Word Dash", META.description || "Match the target word before time runs out.");
  }

  function startGame() {
    running = true;
    paused = false;
    gameOver = false;

    score = 0;
    streak = 0;
    timeLeft = 30.0;

    setEntry("");
    setTarget(pickWord());
    toast("Go!", "neutral");
    updateHud();
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

    if (score > best) {
      best = score;
      localStorage.setItem(BEST_KEY, String(best));
    }

    showPanel("Time!", `${reason}\n\nScore: ${score} • Best: ${best}\nTap Start to play again.`);
    submitScore();
  }

  function multiplierForStreak(s) {
    // friendly ramp: 0..2 = 1x, 3..5 = 1.25x, 6..9 = 1.5x, 10+ = 2x
    if (s >= 10) return 2.0;
    if (s >= 6) return 1.5;
    if (s >= 3) return 1.25;
    return 1.0;
  }

  function submitWord() {
    if (!running || paused || gameOver) return;
    if (timeLeft <= 0) return;

    const typed = entry.trim().toUpperCase();
    const targ = target.toUpperCase();

    if (!typed) {
      toast("Type the word first.", "bad");
      return;
    }

    if (typed === targ) {
      // base points: word length
      const base = Math.max(3, targ.length);
      streak += 1;

      const mult = multiplierForStreak(streak);
      const gained = Math.round(base * 10 * mult);

      score += gained;

      // bonus time: more if perfect (and longer words)
      const bonus = 1.0 + Math.min(1.6, targ.length * 0.08) + Math.min(1.0, streak * 0.04);
      timeLeft += bonus;

      toast(`✅ +${gained}  (x${mult.toFixed(2)})  +${bonus.toFixed(1)}s`, "good");

      // next word
      setEntry("");
      setTarget(pickWord());
    } else {
      // incorrect: penalty + streak reset
      streak = 0;
      timeLeft -= 1.2; // small time penalty
      toast("❌ Wrong — streak reset (-1.2s)", "bad");
      setEntry("");
    }

    updateHud();

    if (timeLeft <= 0) endGame("You ran out of time.");
  }

  // On-screen keypad
  function buildKeys() {
    if (!elKeys) return;
    elKeys.innerHTML = "";

    const rows = [
      ["Q","W","E","R","T","Y","U","I","O","P"],
      ["A","S","D","F","G","H","J","K","L"],
      ["Z","X","C","V","B","N","M"]
    ];

    for (const r of rows) {
      const row = document.createElement("div");
      row.className = "krow";
      for (const ch of r) {
        const b = document.createElement("button");
        b.className = "key";
        b.type = "button";
        b.textContent = ch;
        b.addEventListener("click", () => addLetter(ch));
        row.appendChild(b);
      }
      elKeys.appendChild(row);
    }

    // Bottom utility row
    const row4 = document.createElement("div");
    row4.className = "krow";

    const back = document.createElement("button");
    back.className = "key wide";
    back.type = "button";
    back.textContent = "⌫ Back";
    back.addEventListener("click", backspace);

    const enter = document.createElement("button");
    enter.className = "key wide good";
    enter.type = "button";
    enter.textContent = "↵ Submit";
    enter.addEventListener("click", submitWord);

    const clr = document.createElement("button");
    clr.className = "key wide bad";
    clr.type = "button";
    clr.textContent = "Clear";
    clr.addEventListener("click", clearEntry);

    row4.appendChild(back);
    row4.appendChild(enter);
    row4.appendChild(clr);

    elKeys.appendChild(row4);
  }
  buildKeys();

  // Keyboard support
  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); submitWord(); return; }
    if (e.key === "Backspace") { e.preventDefault(); backspace(); return; }
    if (e.key === "Escape") { togglePause(); return; }
    if (e.key === " ") return;

    const k = e.key.toUpperCase();
    if (k.length === 1 && k >= "A" && k <= "Z") addLetter(k);
  });

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
  btnSubmit.onclick = () => { submitScore(); window.GG?.openOverlay?.(); };
  btnRestart.onclick = () => { resetGame(); startGame(); };

  btnBack.onclick = () => backspace();
  btnEnter.onclick = () => submitWord();
  btnClear.onclick = () => clearEntry();

  // Loop
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // toast fade
    if (elToast && lastToastT) {
      const age = (now - lastToastT) / 1000;
      elToast.style.opacity = String(clamp(1 - Math.max(0, age - 1.2) / 0.6, 0, 1));
    }

    if (running && !paused && !gameOver) {
      timeLeft -= dt;
      if (timeLeft <= 0) {
        timeLeft = 0;
        updateHud();
        endGame("You ran out of time.");
      } else {
        updateHud();
      }

      // hint updates
      if (elHint) elHint.textContent = "Enter to submit • Tap letters on mobile";
    } else {
      if (elHint) elHint.textContent = "Press Enter to submit";
      updateHud();
    }

    requestAnimationFrame(loop);
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // Init
  resetGame();
  requestAnimationFrame(loop);
})();
