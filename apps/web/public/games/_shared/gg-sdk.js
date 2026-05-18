(() => {
  function inferSlug() {
    // expects: /games/<slug>/...
    const parts = location.pathname.split("/").filter(Boolean);
    const i = parts.indexOf("games");
    if (i >= 0 && parts[i + 1]) return parts[i + 1];
    return null;
  }

  const GG = (window.GG = window.GG || {});
  GG.slug = GG.slug || inferSlug();

  GG.setSlug = (slug) => {
    GG.slug = slug;
  };

  GG.reportScore = (score, opts = {}) => {
    const gameSlug = opts.gameSlug || GG.slug || inferSlug();
    if (!gameSlug) return;

    const payload = {
      gameSlug,
      score: Number(score) || 0,
      playerName: opts.playerName, // optional (parent will auto-generate anyway)
    };

    // 1) Prefer direct parent function if available
    try {
      if (window.parent && typeof window.parent.ggSubmitDailyScore === "function") {
        window.parent.ggSubmitDailyScore(payload);
        return;
      }
    } catch {}

    // 2) Fallback to postMessage (parent bridge listens)
    try {
      window.parent.postMessage({ type: "GG_SUBMIT_DAILY_SCORE", ...payload }, location.origin);
    } catch {}
  };

    // ---------------------------------------------------------------------------
  // Compatibility override:
  // Some games still call GG.submitScore() (from the older /sdk/gg-sdk.js).
  // We override it here so GG.submitScore ALWAYS submits into Daily Challenge.
  // ---------------------------------------------------------------------------
  GG.submitScore = function (input) {
    let score = 0;

    if (typeof input === "number") score = input;
    else if (typeof input === "string") score = Number(input);
    else if (input && typeof input === "object") score = Number(input.score ?? input.value ?? 0);

    GG.reportScore(Number(score) || 0);
  };

  // Optional: live score updates for the Play sidebar (only if your sidebar listens to gg:score)
  GG.setScore = function (score) {
    const s = Number(score) || 0;
    const slug = GG.slug || GG.gameSlug || "";
    if (!slug) return;

    try {
      window.parent.postMessage({ type: "gg:score", slug, score: s }, window.location.origin);
    } catch {}
  };




  // Convenience alias for “game over”
  GG.endRound = (score) => GG.reportScore(score);
})();
