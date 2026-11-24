// apps/web/src/app/parents-safety/page.tsx

import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import { ANALYTICS_ENABLED, ANALYTICS_NOTICE } from "@/lib/publicAnalytics";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Parents & Safety | WebGameArena",
  description:
    "Learn how WebGameArena approaches player safety, younger players, accounts, chat, public leaderboards, privacy, advertising and family-friendly browser gaming.",
  alternates: {
    canonical: "/parents-safety",
  },
  openGraph: {
    title: "Parents & Safety | WebGameArena",
    description:
      "Information for parents and guardians about WebGameArena safety, privacy, chat, public leaderboards, advertising and responsible play.",
    url: "https://webgamearena.com/parents-safety",
    siteName: "WebGameArena",
    type: "website",
    locale: "en_ZA",
  },
};

export default function ParentsSafetyPage() {
  return (
    <InfoPage
      eyebrow="Parents & Safety"
      title="Helping families understand safe play on WebGameArena."
      description="WebGameArena is designed as a mobile-first browser gaming platform. This page explains how the platform approaches player safety, younger users, privacy, chat, advertising, leaderboards and responsible play."
      updated="21 November 2026"
      sections={[
        ...(ANALYTICS_ENABLED ? [{ title: "Children and optional analytics", body: [
          "Children can play without optional analytics. The Google Analytics choice is for adults who confirm they are 18 or over and are using this browser themselves. Under-18s, unsure visitors and people sharing with a child should continue without analytics. This self-declaration is not verified age assurance or parental authorisation to track a child.",
          "No Google Analytics script or consent ping is sent before opt-in. If an adult opts in, Google receives cookie/session identifiers, filtered page views and IP/browser/device request information, potentially outside South Africa. Open Analytics settings and withdraw before handing the browser to someone else. Reloading the page also requires a new opt-in. See Privacy and Cookie Policy for processing, retention and withdrawal details."
        ] }] : []),

{"title": "Current guest-play launch", "body": ["Families, including under-18s, can browse and play available games without creating an account. Parents and guardians should help children choose suitable games and take regular breaks.", "Public chat, score submissions, daily challenges and historical leaderboards are available. Existing account sign-in remains available. New registration and reviews remain paused.", ANALYTICS_NOTICE]},
{"title": "Family audience and privacy boundaries", "body": ["Including children in our audience is not a declaration that every game has the same age rating. Review each game’s description and content with your child. Recycle Rush’s separate portal submission does not establish a rating for the whole catalogue.", "Chat messages and leaderboard nicknames are public. Please do not put a child’s real name, school, address, telephone number or other private details into chat, player-name fields or support messages.", "Contact support@webgamearena.com for safety concerns, privacy@webgamearena.com for privacy requests and games@webgamearena.com for game-content concerns. Describe the issue and page address without sending sensitive attachments."]},
        {
          title: "1. What is WebGameArena?",
          body: "WebGameArena is a browser-based gaming platform where players can play free games instantly without downloads. The current launch includes game categories, game detail pages, guest play and historical leaderboard viewing. Chat, daily challenges and score submissions are available. New registration and reviews remain paused.",
        },
        {
          title: "2. Guidance for younger players",
          body: [
            "Younger players should use WebGameArena with guidance from a parent or guardian.",
            "Parents and guardians should help younger players choose suitable games and understand safe online behaviour.",
            "Players should avoid using full names, addresses, phone numbers, school names or personal contact details in usernames, chat or public score names.",
            "Parents can encourage players to use a simple nickname that does not reveal identity or location.",
          ],
        },
        {
          title: "3. Accounts and display names",
          body: [
            "Some features may require an account, such as saved scores or personalised player display.",
            "Display names may appear publicly on leaderboards or gameplay features.",
            "Parents should help younger players choose display names that are appropriate and do not include private information.",
            "Account credentials should never be shared in chat, email or public messages.",
          ],
        },
        {
          title: "4. Public leaderboards",
          body: [
            "Leaderboards may show a player display name, score and game name.",
            "Players should understand that public scores can be visible to other visitors.",
            "Suspicious, abusive or inappropriate leaderboard entries may be removed or moderated.",
          ],
        },
        {
          title: "5. Chat and community safety",
          body: [
            "Game chat accepts short public messages with nicknames. Parents and guardians should supervise younger players using chat.",
            "Players should not share private information in chat.",
            "Message-length, content and rate checks help reduce abuse. These automated checks cannot catch every unsafe message. Use Report to hide an inappropriate message from public chat; contact support for safety concerns.",
            "Parents should remind younger players not to click links from strangers or continue conversations that feel uncomfortable.",
            "Contact support@webgamearena.com about safety concerns or historical content.",
          ],
        },
        {
          title: "6. Game content and age suitability",
          body: [
            "WebGameArena aims to provide casual, family-friendly browser games.",
            "Game pages include descriptions, controls, objectives, scoring notes and family notes to help players understand what to expect.",
            "Some games may be faster, more competitive or more difficult than others.",
            "Parents should review game pages and choose games that match a player’s age, skills and comfort level.",
          ],
        },
        {
          title: "7. Advertising and sponsored content",
          body: [
            "WebGameArena may display advertising or sponsored content in future.",
            "Ads should be clearly separated from gameplay, controls, chat buttons, play buttons, fullscreen buttons and navigation links.",
            "Ads should not be placed inside game canvases or directly next to touch controls.",
            "Advertising cookies and personalised advertising choices are explained in the Privacy Policy and Cookie Policy.",
          ],
        },
        {
          title: "8. Privacy and cookies",
          body: [
            "WebGameArena may use cookies for login sessions, preferences, security, analytics and advertising where enabled.",
            "Parents can manage cookies through browser settings, although blocking some cookies may affect login or leaderboard features.",
            "Privacy questions can be sent to privacy@webgamearena.com.",
          ],
        },
        {
          title: "9. Healthy play habits",
          body: [
            "Take breaks between play sessions.",
            "Use games for fun and learning rather than pressure or frustration.",
            "Avoid sharing account details or private information.",
            "Stop playing and ask for help if another player behaves in a worrying or uncomfortable way.",
          ],
        },
        {
          title: "10. Contact for parents and guardians",
          body: [
            "For player support and safety issues, email support@webgamearena.com.",
            "For privacy questions, email privacy@webgamearena.com.",
            "For game content concerns, email games@webgamearena.com.",
          ],
        },
      ]}
    />
  );
}
