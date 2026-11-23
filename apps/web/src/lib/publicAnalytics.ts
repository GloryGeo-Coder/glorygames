// Public identifier supplied by the owner; never an API credential.
export const GA4_MEASUREMENT_ID = "G-SVTR9HMDJ2";
export const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_GA4_ENABLED === "true";
export const ANALYTICS_NOTICE = ANALYTICS_ENABLED
  ? "Advertising remains paused. Google Analytics is optional for adults who confirm they are 18 or over, are using the browser themselves and explicitly allow analytics. Under-18s and visitors who are unsure or sharing with a child should continue without analytics. Games work without it. Before an opt-in, no Google Analytics tag or consent ping is sent. Cloudflare browser analytics is not loaded. Hosting and security services still process requests needed to deliver and protect the website."
  : "Advertising remains paused. Optional Google Analytics is being prepared and is not active in this release. Google advertising, Google Analytics and Cloudflare browser analytics scripts are not loaded. Hosting and security services still process requests needed to deliver and protect the website.";

const PAGES: Record<string, string> = {
  "/learning-arcade": "Learning Arcade", "/quick-play": "Quick Play", "/game-saves": "Game saves", "/game-updates": "Game updates",
  "/": "Home", "/games": "Games", "/leaderboard": "Leaderboard",
  "/about": "About", "/contact": "Contact", "/advertise": "Advertise",
  "/parents-safety": "Parents and safety", "/privacy": "Privacy",
  "/cookies": "Cookies", "/terms": "Terms", "/accessibility": "Accessibility",
  "/community-guidelines": "Community guidelines", "/submit-game": "Game submissions",
};

// Coarse route labels deliberately omit game names, search terms, query strings,
// fragments, account routes, form values and unknown paths.
export function analyticsPage(path: string) {
  if (PAGES[path]) return { path, title: `WebGameArena | ${PAGES[path]}` };
  if (/^\/play\/[a-z0-9-]{1,80}$/.test(path)) return { path: "/play/game", title: "WebGameArena | Play" };
  if (/^\/games\/[a-z0-9-]{1,80}$/.test(path)) return { path: "/games/game", title: "WebGameArena | Game guide" };
  if (/^\/categories\/[a-z0-9-]{1,40}$/.test(path)) return { path: "/categories/collection", title: "WebGameArena | Collection" };
  return null;
}

type GoogleWindow = Window & { dataLayer?: IArguments[]; gtag?: (...args: unknown[]) => void };
const COOKIE_NAMES = ["_ga", "_ga_SVTR9HMDJ2"];

export function clearAnalyticsCookies(doc: Document, hostname: string) {
  // Only this property's analytics cookies. Essential sign-in/game saves remain.
  for (const name of COOKIE_NAMES) {
    for (const domain of ["", hostname, `.${hostname}`, "webgamearena.com", ".webgamearena.com"]) {
      doc.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure${domain ? `; Domain=${domain}` : ""}`;
    }
  }
}

export function createPublicAnalytics(win: GoogleWindow, doc: Document, enabled: boolean) {
  const production = ["webgamearena.com", "www.webgamearena.com"].includes(win.location.hostname);
  const disabledKey = `ga-disable-${GA4_MEASUREMENT_ID}`;
  let active = false;
  let script: HTMLScriptElement | null = null;
  let lastPage = "";
  let loaded = false;
  let started = false;
  let path = win.location.pathname;
  Reflect.set(win, disabledKey, true);

  function stop(reload = false) {
    active = false;
    loaded = false;
    lastPage = "";
    // No denied-consent ping: suppress collection, clear pending commands and
    // reload after withdrawal so already-loaded SDK listeners are removed too.
    Reflect.set(win, disabledKey, true);
    script?.remove();
    script = null;
    if (win.dataLayer) win.dataLayer.length = 0;
    clearAnalyticsCookies(doc, win.location.hostname);
    if (reload && started) win.location.reload();
  }

  function pageview() {
    const page = analyticsPage(path);
    if (!active || !loaded || !page || lastPage === path) return;
    lastPage = path;
    win.gtag?.("event", "page_view", {
      send_to: GA4_MEASUREMENT_ID,
      page_location: `https://webgamearena.com${page.path}`,
      page_title: page.title, page_referrer: "",
    });
  }

  function grant(adultConfirmed: boolean) {
    if (!enabled || !production || !adultConfirmed || !analyticsPage(path)) return false;
    if (active) return true;
    // Consent is memory-only for this document, never reused on a shared device
    // after a reload/new document. Do not infer consent from a logged-in account.
    clearAnalyticsCookies(doc, win.location.hostname);
    active = true;
    Reflect.set(win, disabledKey, false);
    win.dataLayer = [];
    win.gtag = function () { win.dataLayer?.push(arguments); };
    win.gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    win.gtag("consent", "update", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    win.gtag("set", "ads_data_redaction", true);
    win.gtag("js", new Date());
    const page = analyticsPage(path)!;
    win.gtag("config", GA4_MEASUREMENT_ID, {
      send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
      cookie_domain: "none", cookie_path: "/", cookie_expires: 3600, cookie_update: false,
      cookie_flags: "SameSite=Lax;Secure", page_referrer: "",
      page_location: `https://webgamearena.com${page.path}`, page_title: page.title,
    });
    script = doc.createElement("script");
    script.id = "wga-consented-ga4";
    script.async = true;
    script.referrerPolicy = "no-referrer";
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    script.onload = () => { if (active) { loaded = true; pageview(); } };
    script.onerror = () => stop(true);
    started = true;
    doc.head.appendChild(script);
    return true;
  }

  return {
    grant, stop,
    sync(nextPath: string) {
      path = nextPath;
      if (!analyticsPage(path)) { stop(true); return; }
      pageview();
    },
  };
}
