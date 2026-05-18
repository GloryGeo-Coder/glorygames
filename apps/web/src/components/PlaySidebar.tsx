// apps/web/src/components/PlaySidebar.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type LeaderboardEntry = {
  user: string;
  score: number;
};

type ChatMessage = {
  user: string;
  text: string;
  ts: number;
};

type Props = {
  slug?: string;
  title?: string;
  liveScore?: number;
  refreshKey?: number;

  // Chat props
  chatStatus?: "connected" | "error" | "connecting";
  messages?: ChatMessage[];
  onSendChat?: (text: string) => void;
};

export default function PlaySidebar({
  slug,
  title,
  liveScore = 0,
  refreshKey = 0,

  chatStatus = "connecting",
  messages = [],
  onSendChat,
}: Props) {
  const safeSlug = useMemo(() => slug ?? "", [slug]);

  const safeTitle = useMemo(() => {
    if (title) return title;
    if (safeSlug) return safeSlug.replace(/-/g, " ");
    return "Game";
  }, [title, safeSlug]);

  const [topScore, setTopScore] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    if (!safeSlug) return;

    let cancelled = false;
    setLoading(true);

    fetch(`/api/leaderboard?gameSlug=${encodeURIComponent(safeSlug)}`, {
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Leaderboard fetch failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;

        const entries = Array.isArray(data?.entries) ? data.entries : [];
        setLeaderboard(entries);

        if (typeof data?.topScore === "number") {
          setTopScore(data.topScore);
        } else if (entries.length) {
          setTopScore(Math.max(...entries.map((r: LeaderboardEntry) => Number(r.score) || 0)));
        } else {
          setTopScore(null);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setLeaderboard([]);
        setTopScore(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [safeSlug, refreshKey]);

  function handleSendChat() {
    const text = chatInput.trim();
    if (!text) return;
    if (!onSendChat) return;

    onSendChat(text);
    setChatInput("");
  }

  return (
    <aside className="playSidebar">
      <div className="playSidebarHeader">
        <h3 className="sidebarTitle">{safeTitle}</h3>
      </div>

      <div className="scoreBlock">
        <div className="scoreItem">
          <span className="label">Live score</span>
          <strong className="scoreValue">{liveScore}</strong>
        </div>

        <div className="scoreItem">
          <span className="label">Top score</span>
          <strong className="scoreValue">{topScore ?? "—"}</strong>
        </div>
      </div>

      <div className="leaderboard">
        <div className="leaderboardTopRow">
          <h4>Leaderboard</h4>
          <span className="mutedTiny">{safeSlug}</span>
        </div>

        {loading && <p className="muted">Loading…</p>}

        {!loading && leaderboard.length === 0 && (
          <p className="muted">No scores yet</p>
        )}

        {leaderboard.map((row, i) => (
          <div key={`${row.user}-${row.score}-${i}`} className="leaderboardRow">
            <span className="lbUser">{row.user}</span>
            <span className="lbScore">{row.score}</span>
          </div>
        ))}
      </div>

      <div className="ggChat sidebarChat">
        <div className="ggChatHeader">
          <b>Game Chat</b>
          <span className={chatStatus === "connected" ? "ggOk" : "ggBad"}>
            {chatStatus === "connected"
              ? "Connected"
              : chatStatus === "connecting"
                ? "Connecting"
                : "Error"}
          </span>
        </div>

        <div className="ggChatBody sidebarChatBody">
          {messages.length === 0 ? (
            <div className="ggChatEmpty">No messages yet…</div>
          ) : (
            messages.map((m, i) => (
              <div key={`${m.ts}-${i}`} className="ggChatMsg">
                <b className="ggChatUser">{m.user}:</b>{" "}
                <span className="ggChatText">{m.text}</span>
              </div>
            ))
          )}
        </div>

        <div className="ggChatInputRow">
          <input
            className="ggChatInput"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message…"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendChat();
            }}
          />
          <button className="ggBtn" onClick={handleSendChat}>
            Send
          </button>
        </div>
      </div>
    </aside>
  );
}