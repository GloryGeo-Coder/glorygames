import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DailyChallengeBridge from "@/components/DailyChallengeBridge";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "GloryGames",
  description: "Play, compete, and build communities in browser-based games.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="appShell">
          <SiteHeader />
          <main className="main">{children}</main>
          <SiteFooter />
        </div>

        <DailyChallengeBridge />
      </body>

      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}