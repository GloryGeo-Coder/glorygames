// apps/web/src/app/play/[slug]/play-client.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import PlaySidebar from "@/components/PlaySidebar";
import { useCurrentUser } from "@/lib/useCurrentUser";
import SkyTempleLaunch from "@/components/SkyTempleLaunch";
import { SKY_TEMPLE } from "@/lib/skyTempleLaunch";
import GameLaunch from "@/components/GameLaunch";
import { subscribeGameTabScores } from "@/lib/gameTabScores";

type Props = {
  slug: string;
  title: string;
};

type ChatMessage = {
  id?: string;
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

function normalizeMessages(data: any): ChatMessage[] {
  const source = Array.isArray(data?.messages)
    ? data.messages
    : Array.isArray(data?.rows)
      ? data.rows
      : [];

  return source
    .map((message: any) => ({
      id: message?.id ? String(message.id) : undefined,
      user:
        String(
          message?.user ||
            message?.displayName ||
            message?.playerName ||
            message?.name ||
            "Player"
        ) || "Player",
      text: String(message?.text || "").slice(0, 180),
      ts: Number(message?.ts || message?.createdAt || Date.now()),
    }))
    .filter((message: ChatMessage) => message.text.trim().length > 0);
}

function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]) {
  const map = new Map<string, ChatMessage>();

  for (const message of [...current, ...incoming]) {
    const key =
      message.id ||
      `${message.user.toLowerCase()}-${message.text}-${Math.floor(message.ts / 1000)}`;

    map.set(key, message);
  }

  return Array.from(map.values())
    .sort((a, b) => a.ts - b.ts)
    .slice(-80);
}

export default function PlayClient({ slug, title }: Props) {
  const { user } = useCurrentUser();
  const isSkyTemple = slug === SKY_TEMPLE.slug;

  const [liveScore, setLiveScore] = useState(0);
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0);

  const [chatStatus, setChatStatus] = useState<
    "connected" | "error" | "connecting"
  >("connecting");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [guestName, setGuestName] = useState("Guest Player");

  const effectivePlayerName = sanitizeGuestName(user?.displayName || guestName);

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

  const loadChat = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        gameSlug: slug,
        limit: "50",
      });

      const res = await fetch(`/api/chat?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Chat unavailable");
      }

      const incoming = normalizeMessages(data);

      setMessages((current) => mergeMessages(current, incoming));
      setChatStatus("connected");
    } catch (error) {
      console.warn("[PlayClient] chat fetch failed", error);
      setChatStatus("error");
    }
  }, [slug]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (cancelled) return;
      await loadChat();
    }

    setChatStatus("connecting");
    run();

    const interval = window.setInterval(() => {
      run();
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [loadChat]);

  useEffect(() => {
    if (isSkyTemple) return;
    return subscribeGameTabScores({ slug, onScore: (event) => {
      setLiveScore(event.score);
      if (event.status === "submitted") {
        setLeaderboardRefreshKey((key) => key + 1);
        window.dispatchEvent(new Event("wga:score-submitted"));
      }
    } });
  }, [slug, isSkyTemple]);

  async function sendChat(text: string, playerName?: string) {
    const cleanText = text.trim();
    if (!cleanText) return;

    const name = sanitizeGuestName(playerName || effectivePlayerName);

    const optimisticMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      user: name,
      text: cleanText,
      ts: Date.now(),
    };

    setMessages((previous) => mergeMessages(previous, [optimisticMessage]));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          gameSlug: slug,
          text: cleanText,
          playerName: name,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Message could not be sent");
      }

      const saved = normalizeMessages({ messages: [data?.message] });

      if (saved.length) {
        setMessages((previous) => {
          const withoutLocal = previous.filter(
            (message) => message.id !== optimisticMessage.id
          );

          return mergeMessages(withoutLocal, saved);
        });
      }

      setChatStatus("connected");
      loadChat();
    } catch (error) {
      console.warn("[PlayClient] chat send failed", error);
      setChatStatus("error");
    }
  }

  return (
    <div className="ggPlayLayout">
      <div className="ggStage">
        <div className="ggStageTopBar">
          <div className="ggStageTitle">
            <b>{title}</b>
            <span className="ggMuted">{isSkyTemple ? "Four-world adventure" : `• Live: ${liveScore}`}</span>
          </div>

        </div>

        <div className="ggStageInner" id="gameMount">
          {isSkyTemple ? (
            <SkyTempleLaunch />
          ) : (
            <GameLaunch slug={slug} title={title} />
          )}
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
