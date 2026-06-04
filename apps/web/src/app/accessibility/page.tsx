// apps/web/src/app/accessibility/page.tsx

import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Accessibility | WebGameArena",
  description:
    "Learn about WebGameArena accessibility goals for mobile-first browser games, readable pages, keyboard support, responsive layouts and inclusive play.",
  alternates: {
    canonical: "/accessibility",
  },
  openGraph: {
    title: "Accessibility | WebGameArena",
    description:
      "WebGameArena aims to make browser games and platform pages accessible, readable and usable across devices.",
    url: "https://WebGameArena.com/accessibility",
    siteName: "WebGameArena",
    type: "website",
    locale: "en_ZA",
  },
};

export default function AccessibilityPage() {
  return (
    <InfoPage
      eyebrow="Accessibility"
      title="Making WebGameArena easier to play and browse."
      description="WebGameArena aims to create a browser gaming experience that is usable across mobile, tablet and desktop devices, with readable pages, responsive layouts and clear controls."
      updated="18 May 2026"
      sections={[
        {
          title: "1. Our accessibility goal",
          body: "WebGameArena is being built to support a wide range of players, devices and screen sizes. The goal is to make games and platform pages easier to understand, navigate and play.",
        },
        {
          title: "2. Mobile-first design",
          body: [
            "Pages and games should scale properly on phones, tablets and desktop screens.",
            "Buttons, menus and game controls should be large enough to tap comfortably.",
            "Layouts should avoid unnecessary horizontal scrolling on mobile devices.",
          ],
        },
        {
          title: "3. Keyboard and touch support",
          body: [
            "Where possible, games should support both keyboard and touch controls.",
            "Important platform pages should be navigable with standard browser controls.",
            "Interactive elements should use clear labels, visible buttons and understandable actions.",
          ],
        },
        {
          title: "4. Readability",
          body: [
            "Text should be clear, readable and high enough in contrast against the background.",
            "Important information should not rely only on colour.",
            "Headings, sections and buttons should make pages easier to scan.",
          ],
        },
        {
          title: "5. Game accessibility",
          body: [
            "Game creators are encouraged to include clear instructions.",
            "Games should avoid flashing effects that may be uncomfortable or unsafe for some players.",
            "Mobile games should include visible touch controls where appropriate.",
            "Games should avoid confusing controls or hidden required actions.",
          ],
        },
        {
          title: "6. Continuous improvement",
          body: "Accessibility is an ongoing process. As WebGameArena grows, improvements may include better keyboard navigation, clearer game instructions, improved contrast, reduced-motion options and stronger testing across devices.",
        },
        {
          title: "7. Reporting accessibility problems",
          body: "If you experience difficulty using a page or game, use the Contact page and include the device, browser, game name and a short description of the issue.",
        },
      ]}
    />
  );
}