import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DailyChallengeBridge from "@/components/DailyChallengeBridge";
import { PUBLIC_SCORE_SUBMISSIONS_ENABLED } from "@/lib/launchPolicy";
import AnalyticsChoices from "@/components/AnalyticsChoices";
import { ANALYTICS_ENABLED } from "@/lib/publicAnalytics";

const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";
// Optional Search Console HTML-tag verification, configured in Cloudflare Builds.
const searchConsoleToken = (process.env.GOOGLE_SITE_VERIFICATION || "").trim();

export const metadata: Metadata = {
  title: "WebGameArena",
  description: "Play, compete, and build communities in browser-based games.",
  ...(searchConsoleToken ? { verification: { google: searchConsoleToken } } : {}),
  ...(adsenseClientId
    ? {
        other: {
          "google-adsense-account": adsenseClientId,
        },
      }
    : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="appShell">
          <SiteHeader />
          <main className="main">{children}</main>
          <SiteFooter />
        </div>

        {PUBLIC_SCORE_SUBMISSIONS_ENABLED ? <DailyChallengeBridge /> : null}
        <AnalyticsChoices enabled={ANALYTICS_ENABLED} />
        {/* Advertising remains paused independently of optional analytics. */}
      </body>
    </html>
  );
}
