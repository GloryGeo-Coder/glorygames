// apps/web/src/app/leaderboard/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getGlobalLeaderboardFromDatabase } from "@/lib/gamesDb";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Global Leaderboard | WebGameArena",
  description:
    "View historical WebGameArena scores. New public score submissions are paused.",
  alternates: {
    canonical: "/leaderboard",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function LeaderboardPage() {
  let rows: Awaited<ReturnType<typeof getGlobalLeaderboardFromDatabase>> = [];

  try {
    rows = await getGlobalLeaderboardFromDatabase(50);
  } catch (error) {
    console.warn("[leaderboard] failed", {
      errorClass: error instanceof Error ? error.name : "UnknownError",
    });
    rows = [];
  }

  return (
    <main className="container">
      <section className="section">
        <div className="sectionTitle">
          <div>
            <div className="badge" style={{ width: "fit-content" }}>
              🏆 Global Leaderboard
            </div>

            <h1>Top WebGameArena Players</h1>

            <p>
              View historical scores across the game library. New public score
              submissions are paused; available games remain playable as guests.
            </p>
          </div>

          <Link className="pill" href="/games">
            Browse games →
          </Link>
        </div>

        <div className="heroCard" style={{ padding: 16 }}>
          {rows.length ? (
            <div style={{ display: "grid", gap: 8 }}>
              {rows.map((row) => (
                <div
                  key={`${row.rank}-${row.gameSlug}`}
                  className="gameDetailScoreRow"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "72px 1fr auto",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span className="badge">#{row.rank}</span>

                  <div>
                    <b>{row.displayName}</b>
                    <div className="mutedTiny">
                      <Link href={`/play/${row.gameSlug}`}>
                        {row.gameTitle}
                      </Link>
                    </div>
                  </div>

                  <b>{row.score.toLocaleString()}</b>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "rgba(255,255,255,.72)", lineHeight: 1.65 }}>
              <b>No leaderboard scores yet.</b>
              <p>
                New public score submissions are paused. You can still browse
                and play available games without submitting a score.
              </p>

              <Link className="cta" href="/games">
                Play a game →
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
