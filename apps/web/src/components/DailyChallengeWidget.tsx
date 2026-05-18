"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Row = { name: string; score: number };

export function DailyChallengeWidget({
  gameSlug,
  title,
}: {
  gameSlug: string;
  title: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );
  const [rows, setRows] = useState<Row[]>([]);
  const [myScore, setMyScore] = useState<number | null>(null);

  // IMPORTANT: do not read localStorage during render (SSR hydration mismatch)
  const [playerName, setPlayerName] = useState("Player");

  useEffect(() => {
    // Runs only on client after mount -> no hydration mismatch
    try {
      const key = `gg_player_name`;
      const existing = localStorage.getItem(key);
      if (existing && existing.trim()) {
        setPlayerName(existing.trim());
        return;
      }
      const newName = `Player-${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem(key, newName);
      setPlayerName(newName);
    } catch {
      // keep "Player"
    }
  }, []);

  const refresh = useMemo(() => {
    return async () => {
      setStatus("loading");
      try {
        const res = await fetch(`/api/daily-challenge?gameSlug=${gameSlug}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          rows: Row[];
          me?: { name: string; score: number } | null;
        };

        setRows(Array.isArray(data.rows) ? data.rows : []);
        setMyScore(data.me?.score ?? null);
        setStatus("ready");
      } catch (e) {
        console.warn("[DailyChallengeWidget] fetch failed", e);
        setStatus("error");
      }
    };
  }, [gameSlug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="heroCard" style={{ padding: 14 }}>
      <div className="sideHeaderRow">
        <div>
          <b>{title}</b>
          <div className="mutedTiny" style={{ marginTop: 6 }}>
            <span className="badge">{playerName}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link className="pill" href={`/play/${gameSlug}`}>
            Play
          </Link>

          <button
            className="pill"
            type="button"
            onClick={refresh}
            disabled={status === "loading"}
            title="Refresh leaderboard"
          >
            {status === "loading" ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {status === "error" ? (
        <div style={{ marginTop: 10, color: "rgba(255,255,255,.75)" }}>
          Daily challenge unavailable.
        </div>
      ) : null}

      {status !== "error" ? (
        <div style={{ marginTop: 10 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div className="mutedTiny">
              Your best today:{" "}
              <b style={{ color: "white" }}>
                {myScore == null ? "—" : myScore.toLocaleString()}
              </b>
            </div>

            <Link className="mutedTiny" href="/leaderboard">
              Global leaderboard →
            </Link>
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            {(rows || []).slice(0, 5).map((r, i) => (
              <div
                key={`${r.name}-${i}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "8px 10px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,.06)",
                }}
              >
                <div style={{ display: "flex", gap: 10 }}>
                  <span className="badge">#{i + 1}</span>
                  <span>{r.name}</span>
                </div>
                <b>{Number(r.score || 0).toLocaleString()}</b>
              </div>
            ))}

            {!rows?.length && status === "ready" ? (
              <div style={{ color: "rgba(255,255,255,.7)" }}>
                No scores yet today.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
