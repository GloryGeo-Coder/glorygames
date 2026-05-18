(function () {
  const GG = (window.GG = window.GG || {});
  const state = {
    slug: null,
    title: document.title || "Game",
    user: null,
    parentOrigin: "*"
  };

  function detectSlug() {
    // /games/<slug>/index.html
    const parts = location.pathname.split("/").filter(Boolean);
    const i = parts.indexOf("games");
    if (i >= 0 && parts[i + 1]) return parts[i + 1];
    return null;
  }

  function detectParentOrigin() {
    try {
      // if same-origin, referrer contains it
      if (document.referrer) return new URL(document.referrer).origin;
    } catch {}
    return "*";
  }

  function post(type, payload) {
    window.parent && window.parent.postMessage({ type, payload }, state.parentOrigin);
  }

  state.slug = detectSlug();
  state.parentOrigin = detectParentOrigin();

  // Public API (games can call these)
  GG.init = function (opts) {
    state.slug = (opts && opts.slug) || state.slug || detectSlug();
    state.title = (opts && opts.title) || state.title;
    render();
  };

  GG.submitScore = function (value, mode) {
    const v = Number(value);
    if (!Number.isFinite(v)) return;
    post("GG_SCORE", { value: v, mode: mode || "global" });
  };

  GG.chatSend = function (text) {
    const t = String(text || "").trim().slice(0, 400);
    if (!t) return;
    post("GG_CHAT_SEND", { text: t });
  };

  GG.reviewSubmit = function (rating, comment) {
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) return;
    post("GG_REVIEW_SUBMIT", { rating: r, comment: String(comment || "").trim().slice(0, 500) });
  };

  GG.openOverlay = function () {
    const panel = document.querySelector(".ggPanel");
    if (panel) panel.style.display = "block";
  };

  GG.closeOverlay = function () {
    const panel = document.querySelector(".ggPanel");
    if (panel) panel.style.display = "none";
  };

  // UI
  let mounted = false;
  let currentTab = "chat";
  let currentRating = 0;

  function setTab(tab) {
    currentTab = tab;
    document.querySelectorAll(".ggTab").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    document.querySelectorAll("[data-gg-view]").forEach((v) => (v.style.display = v.dataset.ggView === tab ? "block" : "none"));
  }

  function pushChatMessage(msg) {
    const list = document.querySelector(".ggList");
    if (!list) return;
    const el = document.createElement("div");
    el.className = "ggMsg";
    const name = msg.displayName || "Player";
    const time = new Date(msg.at || Date.now()).toLocaleTimeString();
    el.innerHTML = `<div><b>${escapeHtml(name)}:</b> ${escapeHtml(msg.text || "")}</div><div class="ggMeta">${escapeHtml(time)}</div>`;
    list.appendChild(el);
    list.scrollTop = list.scrollHeight;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function render() {
    if (mounted) return;
    mounted = true;

    // Ensure CSS linked (if user forgot, it still works but plain)
    // (We won't auto-inject <link>, we assume you include it in the game HTML.)

    const btn = document.createElement("button");
    btn.className = "ggBtn";
    btn.textContent = "GG";
    btn.onclick = () => {
      const panel = document.querySelector(".ggPanel");
      if (!panel) return;
      panel.style.display = panel.style.display === "block" ? "none" : "block";
      if (panel.style.display === "block") setTab(currentTab);
    };

    const panel = document.createElement("div");
    panel.className = "ggPanel";
    panel.innerHTML = `
      <div class="ggTop">
        <div class="ggTitle">GloryGames • ${escapeHtml(state.title)}</div>
        <button class="ggClose">Close</button>
      </div>

      <div class="ggTabs">
        <button class="ggTab active" data-tab="chat">Chat</button>
        <button class="ggTab" data-tab="review">Rate</button>
        <button class="ggTab" data-tab="help">Help</button>
      </div>

      <div class="ggBody">
        <div data-gg-view="chat">
          <div class="ggMuted">${state.user ? `Signed in as ${escapeHtml(state.user.displayName)}` : "Sign in to use chat + save scores."}</div>
          <div class="ggList"></div>
          <div class="ggRow">
            <input class="ggInput" placeholder="Type a message…" />
            <button class="ggCta">Send</button>
          </div>
        </div>

        <div data-gg-view="review" style="display:none">
          <div class="ggMuted">Rate this game (1–5). Reviews are tied to your account.</div>
          <div class="ggStars">
            ${[1,2,3,4,5].map(n=>`<button class="ggStar" data-star="${n}">★</button>`).join("")}
          </div>
          <div class="ggRow">
            <input class="ggInput" data-review placeholder="Optional comment…" />
          </div>
          <div class="ggRow">
            <button class="ggCta" data-submit-review>Submit review</button>
          </div>
          <div class="ggMuted" data-review-status style="margin-top:10px"></div>
        </div>

        <div data-gg-view="help" style="display:none">
          <div class="ggMuted">Shortcuts:</div>
          <div class="ggMuted">• Press <b>Shift + G</b> to toggle this overlay.</div>
          <div class="ggMuted">• Games can call <b>GG.submitScore(score)</b> when a round ends.</div>
        </div>
      </div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    panel.querySelector(".ggClose").onclick = () => (panel.style.display = "none");

    panel.querySelectorAll(".ggTab").forEach((b) => {
      b.onclick = () => setTab(b.dataset.tab);
    });

    // Chat send
    const input = panel.querySelector(".ggInput");
    const sendBtn = panel.querySelector(".ggCta");
    function doSend() {
      const text = (input.value || "").trim();
      if (!text) return;
      GG.chatSend(text);
      input.value = "";
    }
    sendBtn.onclick = doSend;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doSend();
    });

    // Stars
    panel.querySelectorAll(".ggStar").forEach((b) => {
      b.onclick = () => {
        currentRating = Number(b.dataset.star);
        panel.querySelectorAll(".ggStar").forEach((x) => x.classList.toggle("active", Number(x.dataset.star) <= currentRating));
      };
    });

    // Review submit
    panel.querySelector("[data-submit-review]").onclick = () => {
      const comment = panel.querySelector("[data-review]").value || "";
      const status = panel.querySelector("[data-review-status]");
      if (!currentRating) {
        status.textContent = "Pick a rating first.";
        return;
      }
      status.textContent = "Submitting…";
      post("GG_REVIEW_SUBMIT", { rating: currentRating, comment });
    };

    // Shortcut
    window.addEventListener("keydown", (e) => {
      if (e.shiftKey && (e.key === "G" || e.key === "g")) {
        panel.style.display = panel.style.display === "block" ? "none" : "block";
        if (panel.style.display === "block") setTab(currentTab);
      }
    });

    // receive messages from platform
    window.addEventListener("message", (ev) => {
      if (!ev.data || typeof ev.data !== "object") return;

      const { type, payload } = ev.data;

      if (type === "GG_CONTEXT") {
        state.user = payload?.user ?? null;
        // update chat header text if overlay is open
      }

      if (type === "GG_CHAT_MESSAGE") {
        pushChatMessage(payload);
      }

      if (type === "GG_REVIEW_ACK") {
        const status = panel.querySelector("[data-review-status]");
        status.textContent = payload?.ok ? "Review saved ✅" : `Review failed: ${payload?.error || "unknown"}`;
      }
    });

    // initial view
    setTab("chat");
  }

  // auto-init without needing GG.init()
  GG.init({ slug: state.slug, title: state.title });
})();
