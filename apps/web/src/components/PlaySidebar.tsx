// apps/web/src/components/PlaySidebar.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useCurrentUser } from "@/lib/useCurrentUser";

type LeaderboardEntry = {
  user: string;
  score: number;
};

type ChatMessage = {
  id?: string;
  user: string;
  text: string;
  ts: number;
};

type Props = {
  slug?: string;
  title?: string;
  liveScore?: number;
  refreshKey?: number;

  chatStatus?: "connected" | "error" | "connecting";
  messages?: ChatMessage[];
  onSendChat?: (text: string, playerName?: string) => void | Promise<void>;
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
  const { user, loading: userLoading } = useCurrentUser();

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
  const [chatWarning, setChatWarning] = useState<string | null>(null);
  const [reportedMessages, setReportedMessages] = useState<Record<string, boolean>>({});
  const [guestName, setGuestName] = useState("Guest Player");

  const effectivePlayerName =
    user?.displayName?.trim() || guestName.trim() || "Guest Player";

  useEffect(() => {
    try {
      const key = "wga_guest_player_name";
      const existing = localStorage.getItem(key);

      if (existing && existing.trim()) {
        setGuestName(existing.trim());
        return;
      }

      const newName = `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem(key, newName);
      setGuestName(newName);
    } catch {
      setGuestName("Guest Player");
    }
  }, []);

  useEffect(() => {
    if (!safeSlug) return;

    let cancelled = false;
    setLoading(true);

    fetch(`/api/leaderboard?gameSlug=${encodeURIComponent(safeSlug)}`, {
      cache: "no-store",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Leaderboard fetch failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;

        const rawEntries = Array.isArray(data?.entries)
          ? data.entries
          : Array.isArray(data?.rows)
            ? data.rows
            : [];

        const entries: LeaderboardEntry[] = rawEntries.map((entry: any) => ({
          user:
            entry?.displayName ||
            entry?.playerName ||
            entry?.user ||
            entry?.name ||
            "Player",
          score: Number(entry?.score ?? entry?.value ?? 0),
        }));

        setLeaderboard(entries);

        if (typeof data?.topScore === "number") {
          setTopScore(data.topScore);
        } else if (entries.length) {
          setTopScore(
            Math.max(...entries.map((r: LeaderboardEntry) => Number(r.score) || 0))
          );
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

  function getMessageKey(message: ChatMessage, index: number) {
    return message.id || `${message.ts}-${index}-${message.user}-${message.text}`;
  }

  function isUnsafeChatText(text: string) {
    const value = text.toLowerCase();

    if (value.length > 180) return true;
    if (value.includes("http://")) return true;
    if (value.includes("https://")) return true;
    if (value.includes("www.")) return true;

    return false;
  }

  async function reportMessage(message: ChatMessage, index: number) {
    const key = getMessageKey(message, index);

    setReportedMessages((current) => ({
      ...current,
      [key]: true,
    }));

    if (!message.id || message.id.startsWith("local-")) {
      return;
    }

    try {
      await fetch("/api/chat/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          messageId: message.id,
        }),
      });
    } catch {
      // Keep the message hidden locally even if the report request fails.
    }
  }

  async function handleSendChat() {
    const text = chatInput.trim();

    setChatWarning(null);

    if (!text) return;
    if (!onSendChat) return;

    if (isUnsafeChatText(text)) {
      setChatWarning(
        "Message blocked. Keep chat short, respectful and free of links."
      );
      return;
    }

    await onSendChat(text, effectivePlayerName);
    setChatInput("");
  }

  return (
    <aside className="playSidebar">
      <div className="playSidebarHeader">
        <div>
          <h3 className="sidebarTitle">{safeTitle}</h3>

          <div className="mutedTiny" style={{ marginTop: 6 }}>
            <span className="badge">
              {userLoading
                ? "Checking player…"
                : user
                  ? `Playing as ${effectivePlayerName}`
                  : effectivePlayerName}
            </span>
          </div>
        </div>
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

        {leaderboard.map((row, i) => {
          const isCurrentPlayer =
            row.user?.trim().toLowerCase() ===
            effectivePlayerName.trim().toLowerCase();

          return (
            <div
              key={`${row.user}-${row.score}-${i}`}
              className="leaderboardRow"
              style={
                isCurrentPlayer
                  ? {
                      background: "rgba(56,189,248,.14)",
                      borderColor: "rgba(56,189,248,.28)",
                    }
                  : undefined
              }
            >
              <span className="lbUser">
                {isCurrentPlayer ? "👤 " : ""}
                {row.user}
              </span>
              <span className="lbScore">{row.score}</span>
            </div>
          );
        })}
      </div>

      <div className="ggChat sidebarChat">
        <div className="ggChatHeader">
          <div style={{ display: "grid", gap: 2 }}>
            <b>Game Chat</b>
            <a
              href="/community-guidelines"
              target="_blank"
              rel="noreferrer"
              className="mutedTiny"
            >
              Chat rules
            </a>
          </div>

          <span className={chatStatus === "connected" ? "ggOk" : "ggBad"}>
            {chatStatus === "connected"
              ? "Connected"
              : chatStatus === "connecting"
                ? "Connecting"
                : "Error"}
          </span>
        </div>

        <div className="ggChatBody sidebarChatBody">
          {messages.filter((m, i) => !reportedMessages[getMessageKey(m, i)])
            .length === 0 ? (
            <div className="ggChatEmpty">No messages yet…</div>
          ) : (
            messages
              .filter((m, i) => !reportedMessages[getMessageKey(m, i)])
              .map((m, i) => (
                <div key={getMessageKey(m, i)} className="ggChatMsg">
                  <b className="ggChatUser">{m.user}:</b>{" "}
                  <span className="ggChatText">{m.text}</span>
                  <button
                    type="button"
                    className="mutedTiny"
                    onClick={() => reportMessage(m, i)}
                    style={{
                      marginLeft: 8,
                      border: 0,
                      background: "transparent",
                      color: "rgba(255,255,255,.55)",
                      cursor: "pointer",
                    }}
                    title="Hide and report this message"
                  >
                    Report
                  </button>
                </div>
              ))
          )}
        </div>

        {chatWarning ? (
          <div
            className="mutedTiny"
            style={{
              color: "rgba(255,180,120,.95)",
              marginBottom: 8,
            }}
          >
            {chatWarning}
          </div>
        ) : null}

        <div className="ggChatInputRow">
          <input
            className="ggChatInput"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={`Message as ${effectivePlayerName}…`}
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
