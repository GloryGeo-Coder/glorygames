// apps/web/src/app/leaderboard/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getGlobalLeaderboardFromDatabase } from "@/lib/gamesDb";
import { PUBLIC_HISTORICAL_LEADERBOARDS_ENABLED } from "@/lib/launchPolicy";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Global Leaderboard | WebGameArena",
  description:
    "Online leaderboard display is paused. Available games remain free to play.",
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
              Historical leaderboard display and new public score submissions are
              paused. Available games remain playable as guests.
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
              <b>{PUBLIC_HISTORICAL_LEADERBOARDS_ENABLED ? "No leaderboard scores yet." : "Historical leaderboard display is paused."}</b>
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
