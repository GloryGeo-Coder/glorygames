"use client";

import { useEffect, useRef } from "react";

type SubmitPayload = {
  gameSlug: string;
  score: number;
  playerName?: string;
};

const TZ = "Africa/Johannesburg";

function safeName(s: string) {
  return s.trim().replace(/\s+/g, " ").slice(0, 24);
}

function generateName() {
  // simple + friendly, no user input required
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `Player-${n}`;
}

function getOrCreatePlayerName() {
  try {
    const key = "gg_player_name";
    const existing = localStorage.getItem(key);
    if (existing && existing.trim()) return safeName(existing);

    const created = generateName();
    localStorage.setItem(key, created);
    return created;
  } catch {
    return "Player";
  }
}

function todayKey() {
  // YYYY-MM-DD in ZA timezone
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function DailyChallengeBridge() {
  const lastSubmitAt = useRef<number>(0);

  async function submit(payload: SubmitPayload) {
    const gameSlug = String(payload.gameSlug || "").trim();
    const score = Number(payload.score);

    if (!gameSlug || !Number.isFinite(score)) return;

    // Small throttle: avoid spamming if a game calls repeatedly
    const now = Date.now();
    if (now - lastSubmitAt.current < 900) return;
    lastSubmitAt.current = now;

    const playerName = safeName(payload.playerName || getOrCreatePlayerName());

    // Expose for debugging in console
    (window as any).GG_LAST_SUBMIT = { day: todayKey(), gameSlug, playerName, score };

    const res = await fetch("/api/daily-challenge/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ gameSlug, playerName, score }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("Daily submit failed:", json?.error || res.statusText);
      window.dispatchEvent(
        new CustomEvent("gg:dailyScoreError", { detail: { gameSlug, playerName, score, error: json?.error || res.statusText } })
      );
      return;
    }

    window.dispatchEvent(
      new CustomEvent("gg:dailyScoreSubmitted", {
        detail: { day: json?.day || todayKey(), gameSlug, playerName, score: json?.score ?? score, improved: !!json?.improved },
      })
    );
  }

  useEffect(() => {
    // Always ensure a name exists (auto-generated)
    getOrCreatePlayerName();

    // 1) Direct calls from games: window.parent.ggSubmitDailyScore({gameSlug, score})
    (window as any).ggSubmitDailyScore = (payload: SubmitPayload) => submit(payload);

    // 2) postMessage support (also works nicely from iframes)
    function onMessage(ev: MessageEvent) {
      // accept only same-origin messages (safer)
      try {
        if (ev.origin !== window.location.origin) return;
      } catch {
        return;
      }

      const data: any = ev.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "GG_SUBMIT_DAILY_SCORE") {
        submit({
          gameSlug: data.gameSlug,
          score: data.score,
          playerName: data.playerName,
        });
      }
    }

    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
      if ((window as any).ggSubmitDailyScore) delete (window as any).ggSubmitDailyScore;
    };
  }, []);

  return null;
}
