"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { analyticsPage, createPublicAnalytics } from "@/lib/publicAnalytics";

export default function AnalyticsChoices({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const controller = useRef<ReturnType<typeof createPublicAnalytics> | null>(null);
  const [open, setOpen] = useState(true);
  const [adult, setAdult] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const instance = createPublicAnalytics(window, document, enabled);
    controller.current = instance;
    return () => { instance.stop(); controller.current = null; };
  }, [enabled]);

  useEffect(() => { controller.current?.sync(pathname || ""); }, [pathname]);

  // Stop collection before a same-tab navigation into an unmeasured route.
  useEffect(() => {
    if (!enabled) return;
    const beforeNavigation = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (!link || link.target === "_blank") return;
      const target = new URL(link.href, window.location.href);
      if (target.origin !== window.location.origin || !analyticsPage(target.pathname)) {
        controller.current?.stop(); setAllowed(false); setAdult(false);
      }
    };
    document.addEventListener("click", beforeNavigation, true);
    return () => document.removeEventListener("click", beforeNavigation, true);
  }, [enabled]);

  if (!enabled || !pathname || !analyticsPage(pathname)) return null;

  function decline() {
    controller.current?.stop(allowed);
    setAllowed(false); setAdult(false); setOpen(false);
  }

  return (
    <section className="analyticsChoices" aria-label="Analytics choices">
      <button className="pill" type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="analytics-choice-panel">
        Analytics settings
      </button>
      {open ? <div id="analytics-choice-panel" className="analyticsChoicePanel">
        <h2>Optional analytics</h2>
        <p>Adults can help us understand which pages are used. If you allow Google Analytics, Google receives cookie identifiers, page-view and browser/device information, and your IP address with requests. Processing may take place outside South Africa. We do not send chat messages, scores, player account details or form entries.</p>
        <p>The Google Analytics account also permits troubleshooting access, aggregated industry contributions and business recommendations using its administrative account information. Details are in our Privacy Policy.</p>
        <p>Under 18, unsure, or sharing this browser with a child? Choose “Continue without analytics”. Games work either way. <Link href="/privacy">Privacy details</Link> · <Link href="/cookies">Cookie details</Link> · <a href="https://policies.google.com/technologies/partner-sites" rel="noreferrer">How Google uses data</a></p>
        {!allowed ? <label className="analyticsAdultChoice"><input type="checkbox" checked={adult} onChange={event => setAdult(event.target.checked)} /> I am 18 or over and using this browser myself.</label> : <p role="status">Analytics is allowed in this tab until you withdraw or reload. Before handing this browser to someone else, withdraw below.</p>}
        <div className="analyticsChoiceActions">
          {!allowed ? <button className="pill" type="button" disabled={!adult} onClick={() => { if (controller.current?.grant(adult)) { setAllowed(true); setOpen(false); } }}>Allow analytics</button> : null}
          <button className="pill" type="button" onClick={decline}>{allowed ? "Withdraw analytics" : "Continue without analytics"}</button>
          <button className="pill" type="button" onClick={() => setOpen(false)}>Close</button>
        </div>
      </div> : null}
    </section>
  );
}
