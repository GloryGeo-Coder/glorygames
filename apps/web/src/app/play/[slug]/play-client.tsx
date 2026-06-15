// apps/web/src/app/play/[slug]/play-client.tsx

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import PlaySidebar from "@/components/PlaySidebar";
import { useCurrentUser } from "@/lib/useCurrentUser";

type Props = {
  slug: string;
  title: string;
};

type ChatMessage = {
  user: string;
  text: string;
  ts: number;
};

function sanitizeGuestName(value?: string | null) {
  const clean = String(value || "")
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);

  return clean || "Guest Player";
}

function extractScorePayload(data: any, slug: string) {
  if (!data || typeof data !== "object") return null;

  const type = data.type || data.event || data.name;
  const looksLikeScoreEvent =
    type === "gg:score" ||
    type === "GG_SCORE" ||
    type === "score" ||
    typeof data.score === "number" ||
    typeof data.value === "number";

  if (!looksLikeScoreEvent) return null;

  if (data.gameSlug && data.gameSlug !== slug) return null;
  if (data.slug && data.slug !== slug) return null;

  const rawScore = Number(data.score ?? data.value ?? 0);

  if (!Number.isFinite(rawScore)) return null;

  return Math.max(0, Math.floor(rawScore));
}

export default function PlayClient({ slug, title }: Props) {
  const { user } = useCurrentUser();

  const [liveScore, setLiveScore] = useState(0);
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0);

  const [chatStatus, setChatStatus] = useState<
    "connected" | "error" | "connecting"
  >("connecting");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [guestName, setGuestName] = useState("Guest Player");

  const socketRef = useRef<Socket | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lastSubmittedScoreRef = useRef(0);
  const pendingScoreRef = useRef(0);
  const submitTimerRef = useRef<number | null>(null);

  const effectivePlayerName = sanitizeGuestName(
    user?.displayName || guestName || "Guest Player"
  );

  const socketUrl = useMemo(() => "/api/realtime", []);

  useEffect(() => {
    try {
      const key = "wga_guest_player_name";
      const existing = localStorage.getItem(key);

      if (existing && existing.trim()) {
        setGuestName(sanitizeGuestName(existing));
        return;
      }

      const newName = `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem(key, newName);
      setGuestName(newName);
    } catch {
      setGuestName("Guest Player");
    }
  }, []);

  async function toggleFullscreen() {
    const el = stageRef.current;
    if (!el) return;

    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen browser restrictions.
    }
  }

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const s = io(socketUrl, {
      transports: ["websocket"],
      path: "/socket.io",
    });

    socketRef.current = s;

    s.on("connect", () => {
      setChatStatus("connected");
      s.emit("join", { gameSlug: slug });
    });

    s.on("connect_error", () => setChatStatus("error"));
    s.on("disconnect", () => setChatStatus("error"));

    s.on("score:update", (payload: any) => {
      if (payload?.gameSlug && payload.gameSlug !== slug) return;

      if (typeof payload?.score === "number") {
        setLiveScore(payload.score);
      }

      setLeaderboardRefreshKey((key) => key + 1);
    });

    s.on("chat:message", (msg: ChatMessage) => {
      if (!msg) return;
      setMessages((previous) => [...previous, msg].slice(-80));
    });

    return () => {
      try {
        s.disconnect();
      } catch {}

      socketRef.current = null;
    };
  }, [slug, socketUrl]);

  async function submitScoreNow(score: number) {
    if (!Number.isFinite(score) || score <= 0) return;
    if (score <= lastSubmittedScoreRef.current) return;

    lastSubmittedScoreRef.current = score;

    const playerName = effectivePlayerName;

    const requests: Promise<Response>[] = [
      fetch("/api/daily-challenge/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          gameSlug: slug,
          score,
          playerName,
        }),
      }),
    ];

    if (user?.id) {
      requests.push(
        fetch(`/api/games/${encodeURIComponent(slug)}/score`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          cache: "no-store",
          body: JSON.stringify({
            score,
            mode: "global",
          }),
        })
      );
    }

    try {
      await Promise.allSettled(requests);

      const s = socketRef.current;
      if (s?.connected) {
        s.emit("score:submit", {
          gameSlug: slug,
          score,
          playerName,
        });
      }

      setLeaderboardRefreshKey((key) => key + 1);
      window.dispatchEvent(new Event("wga:score-submitted"));
    } catch (error) {
      console.warn("[PlayClient] score submit failed", error);
    }
  }

  function scheduleScoreSubmit(score: number) {
    pendingScoreRef.current = Math.max(pendingScoreRef.current, score);

    if (submitTimerRef.current) {
      window.clearTimeout(submitTimerRef.current);
    }

    submitTimerRef.current = window.setTimeout(() => {
      const nextScore = pendingScoreRef.current;
      pendingScoreRef.current = 0;
      submitTimerRef.current = null;
      submitScoreNow(nextScore);
    }, 650);
  }

  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      const score = extractScorePayload(ev.data, slug);

      if (score == null) return;

      setLiveScore(score);

      if (score > 0) {
        scheduleScoreSubmit(score);
      }
    }

    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);

      if (submitTimerRef.current) {
        window.clearTimeout(submitTimerRef.current);
      }
    };
  }, [slug, user?.id, effectivePlayerName]);

  function sendChat(text: string, playerName?: string) {
    const cleanText = text.trim();
    if (!cleanText) return;

    const s = socketRef.current;
    const name = sanitizeGuestName(playerName || effectivePlayerName);

    const localMessage: ChatMessage = {
      user: name,
      text: cleanText,
      ts: Date.now(),
    };

    setMessages((previous) => [...previous, localMessage].slice(-80));

    if (!s || !s.connected) return;

    s.emit("chat:send", {
      gameSlug: slug,
      text: cleanText,
      playerName: name,
      user: name,
    });
  }

  return (
    <div className="ggPlayLayout">
      <div className="ggStage" ref={stageRef}>
        <div className="ggStageTopBar">
          <div className="ggStageTitle">
            <b>{title}</b>
            <span className="ggMuted">• Live: {liveScore}</span>
          </div>

          <button className="ggBtn ggBtnGhost" onClick={toggleFullscreen}>
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>

        <div className="ggStageInner" id="gameMount">
          <iframe
            className="ggGameFrame"
            src={`/games/${slug}/index.html`}
            title={title}
            allow="fullscreen; autoplay; gamepad"
          />
        </div>
      </div>

      <PlaySidebar
        slug={slug}
        title={title}
        liveScore={liveScore}
        refreshKey={leaderboardRefreshKey}
        chatStatus={chatStatus}
        messages={messages}
        onSendChat={sendChat}
      />
    </div>
  );
}
