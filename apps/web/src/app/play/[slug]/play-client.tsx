// apps/web/src/app/play/[slug]/play-client.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import PlaySidebar from "@/components/PlaySidebar";

type Props = {
  slug: string;
  title: string;
};

type ChatMessage = {
  user: string;
  text: string;
  ts: number;
};

export default function PlayClient({ slug, title }: Props) {
  const [liveScore, setLiveScore] = useState(0);
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0);

  const [chatStatus, setChatStatus] = useState<
    "connected" | "error" | "connecting"
  >("connecting");

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const socketUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:4001";
  }, []);

  const gameUrl = useMemo(() => {
    return `/games/${encodeURIComponent(slug)}/index.html`;
  }, [slug]);

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
      // Ignore fullscreen permission/browser issues
    }
  }

  async function submitScore(score: number, mode = "global") {
    if (!Number.isFinite(score) || score < 0) return;

    try {
      const res = await fetch(`/api/games/${encodeURIComponent(slug)}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: Math.floor(score), mode }),
      });

      if (res.ok) {
        setLeaderboardRefreshKey((k) => k + 1);

        socketRef.current?.emit("score:update", {
          gameSlug: slug,
          slug,
          score: Math.floor(score),
          mode,
        });
      }
    } catch {
      // Do not crash gameplay if score API is temporarily unavailable
    }
  }

  function installGameBridge() {
    const win = iframeRef.current?.contentWindow as any;
    if (!win) return;

    try {
      win.GG = {
        setSlug: () => {},

        submitScore: (value: any, maybeSlug?: string) => {
          const score =
            typeof value === "number"
              ? value
              : Number(value?.score ?? value?.value ?? 0);

          const gameSlug =
            typeof value === "object" && value?.gameSlug
              ? value.gameSlug
              : maybeSlug || slug;

          if (gameSlug !== slug) return false;

          void submitScore(score, value?.mode ?? "global");
          return true;
        },

        endRound: (value: any, opts?: any) => {
          const score =
            typeof value === "number"
              ? value
              : Number(value?.score ?? value?.value ?? 0);

          const gameSlug =
            typeof value === "object" && value?.gameSlug
              ? value.gameSlug
              : opts?.gameSlug || slug;

          if (gameSlug !== slug) return false;

          void submitScore(score, opts?.mode ?? value?.mode ?? "global");
          return true;
        },
      };
    } catch {
      // Some browsers may block cross-frame access in certain cases
    }
  }

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    setChatStatus("connecting");

    const s = io(socketUrl, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = s;

    s.on("connect", () => {
      setChatStatus("connected");

      // Support both event naming conventions while we stabilise the platform
      s.emit("join", { gameSlug: slug });
      s.emit("room:join", { slug });
    });

    s.on("connect_error", () => setChatStatus("error"));
    s.on("disconnect", () => setChatStatus("error"));

    s.on("score:update", (payload: any) => {
      if (payload?.gameSlug && payload.gameSlug !== slug) return;
      if (payload?.slug && payload.slug !== slug) return;

      if (typeof payload?.score === "number") {
        setLiveScore(payload.score);
      }

      setLeaderboardRefreshKey((k) => k + 1);
    });

    s.on("leaderboard:update", (payload: any) => {
      if (payload?.gameSlug && payload.gameSlug !== slug) return;
      if (payload?.slug && payload.slug !== slug) return;

      setLeaderboardRefreshKey((k) => k + 1);
    });

    s.on("chat:message", (msg: any) => {
      if (!msg) return;
      if (msg.gameSlug && msg.gameSlug !== slug) return;
      if (msg.slug && msg.slug !== slug) return;

      const text = String(msg.text ?? msg.message ?? "").trim();
      if (!text) return;

      setMessages((prev) => [
        ...prev,
        {
          user: msg.user ?? msg.player ?? msg.displayName ?? "Player",
          text,
          ts: Number(msg.ts ?? Date.now()),
        },
      ]);
    });

    return () => {
      try {
        s.disconnect();
      } catch {
        // ignore
      }

      socketRef.current = null;
    };
  }, [slug, socketUrl]);

  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      if (ev.origin !== window.location.origin) return;

      const data = ev.data;
      if (!data || typeof data !== "object") return;

      const type = String((data as any).type ?? "");
      const msgSlug = (data as any).gameSlug ?? (data as any).slug;

      if (msgSlug && msgSlug !== slug) return;

      const score = Number(
        (data as any).score ??
          (data as any).value ??
          (data as any).payload?.score ??
          (data as any).payload?.value ??
          0
      );

      if (!Number.isFinite(score)) return;

      if (
        type === "GG_SCORE" ||
        type === "gg:score" ||
        type === "gg:liveScore"
      ) {
        setLiveScore(score);

        const mode = (data as any).mode ?? (data as any).payload?.mode ?? "live";

        if (mode !== "live") {
          void submitScore(score, mode);
        }

        setLeaderboardRefreshKey((k) => k + 1);

        socketRef.current?.emit("score:update", {
          gameSlug: slug,
          slug,
          score: Math.floor(score),
          mode,
        });
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [slug]);

  function sendChat(text: string) {
    const clean = text.trim();
    if (!clean) return;

    const s = socketRef.current;
    if (!s || !s.connected) return;

    s.emit("chat:send", {
      gameSlug: slug,
      slug,
      text: clean,
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
            ref={iframeRef}
            className="ggGameFrame"
            src={gameUrl}
            title={title}
            allow="fullscreen; autoplay; gamepad"
            onLoad={installGameBridge}
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