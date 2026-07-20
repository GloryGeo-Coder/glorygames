import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DailyChallengeBridge from "@/components/DailyChallengeBridge";
import { GoogleAnalytics } from "@next/third-parties/google";

const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";

export const metadata: Metadata = {
  title: "WebGameArena",
  description: "Play, compete, and build communities in browser-based games.",
  ...(adsenseClientId
    ? {
        other: {
          "google-adsense-account": adsenseClientId,
        },
      }
    : {}),
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

        {adsenseClientId ? (
          <Script
            id="google-adsense"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1651084095407779`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}

        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
