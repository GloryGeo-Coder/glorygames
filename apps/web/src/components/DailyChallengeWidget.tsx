"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/lib/useCurrentUser";

type Row = { name: string; score: number };

export function DailyChallengeWidget({
  gameSlug,
  title,
}: {
  gameSlug: string;
  title: string;
}) {
  const { user, loading: userLoading } = useCurrentUser();

  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );
  const [rows, setRows] = useState<Row[]>([]);
  const [myScore, setMyScore] = useState<number | null>(null);

  // Do not read localStorage during render. This avoids SSR hydration mismatch.
  // This is only used when the visitor is not logged in.
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

  const refresh = useMemo(() => {
    return async () => {
      setStatus("loading");

      try {
        const params = new URLSearchParams({
          gameSlug,
          playerName: effectivePlayerName,
        });

        const res = await fetch(`/api/daily-challenge?${params.toString()}`, {
          cache: "no-store",
          credentials: "include",
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
  }, [gameSlug, effectivePlayerName]);

  useEffect(() => {
    if (userLoading) return;
    refresh();
  }, [refresh, userLoading]);

  return (
    <div className="heroCard" style={{ padding: 14 }}>
      <div className="sideHeaderRow">
        <div>
          <b>{title}</b>
          <div className="mutedTiny" style={{ marginTop: 6 }}>
            <span className="badge">
              {user ? `Signed in as ${effectivePlayerName}` : effectivePlayerName}
            </span>
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
            disabled={status === "loading" || userLoading}
            title="Refresh leaderboard"
          >
            {status === "loading" || userLoading ? "Loading…" : "Refresh"}
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
            {(rows || []).slice(0, 5).map((r, i) => {
              const isCurrentPlayer =
                r.name?.trim().toLowerCase() ===
                effectivePlayerName.trim().toLowerCase();

              return (
                <div
                  key={`${r.name}-${i}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "8px 10px",
                    borderRadius: 12,
                    background: isCurrentPlayer
                      ? "rgba(56,189,248,.14)"
                      : "rgba(255,255,255,.06)",
                    border: isCurrentPlayer
                      ? "1px solid rgba(56,189,248,.24)"
                      : "1px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", gap: 10 }}>
                    <span className="badge">#{i + 1}</span>
                    <span>{r.name}</span>
                  </div>

                  <b>{Number(r.score || 0).toLocaleString()}</b>
                </div>
              );
            })}

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
