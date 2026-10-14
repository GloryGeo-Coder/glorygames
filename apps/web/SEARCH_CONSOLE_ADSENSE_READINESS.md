# WebGameArena — Search Console and AdSense publication checklist

This is a production verification procedure, not a guarantee of indexing or advertising approval. Run it **after Cloudflare deploys the code in this release**.

## 1. Confirm automatic Cloudflare deployment

Merge the SEO pull request into `main`. Check Cloudflare **Workers & Pages → webgamearena → Deployments** for a successful production build and confirm the `webgamearena.com` domain is serving that deployment.

## 2. Verify ownership in Google Search Console

Prefer the **Domain property** `webgamearena.com` with a DNS TXT record, which covers multiple protocols and subdomains. Add the exact TXT record provided in Search Console through Cloudflare DNS; do not make up a verification token.

Alternatively, choose an **URL-prefix property** `https://webgamearena.com/` and use HTML-tag verification. Copy only the `content` value from Google's `google-site-verification` meta tag into the Cloudflare *build* environment variable `GOOGLE_SITE_VERIFICATION`. Deploy again and confirm the meta tag appears in the public HTML source. Verification does not itself cause indexing.

## 3. Submit the XML sitemap

In Search Console, open **Indexing → Sitemaps** and submit:

`https://webgamearena.com/sitemap.xml`

This release generates a deterministic sitemap containing the canonical home page, game library, four category hubs, legal/trust pages and all 22 detailed game guides. It excludes the duplicate `/games/[slug]` details and search/filter variants.

Use URL Inspection to inspect and, where appropriate, request indexing of representative canonical URLs:

- `https://webgamearena.com/`
- `https://webgamearena.com/games`
- `https://webgamearena.com/categories/educational`
- `https://webgamearena.com/categories/adventure`
- `https://webgamearena.com/categories/racing`
- `https://webgamearena.com/categories/arcade`
- `https://webgamearena.com/play/map-master-africa`
- `https://webgamearena.com/play/kasi-quest`
- `https://webgamearena.com/play/high-spead-racer`

Check **Page indexing** and the indexed vs excluded reasons over time. Submission and an indexing request do not guarantee indexing.

## 4. Run the automated live-domain audit

In the `apps/web` workspace:

```bash
npm run audit:seo
```

When the authorised AdSense publisher ID is configured and `ads.txt` should be present:

```bash
npm run audit:seo -- --require-ads
```

The script checks HTTP responses, sitemap coverage, robots rules, page titles, canonicals, indexing directives and `ads.txt`. It cannot access private Search Console data, perform a full browser/mobile test or prove that AdSense will approve the site.

## 5. Set up `ads.txt` only with an actual publisher account

The public route `/ads.txt` now creates a seller record from either:

- `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-<your real publisher digits>` — reuses the existing AdSense client setting; or
- `ADSENSE_PUBLISHER_ID=pub-<your real publisher digits>` — optional dedicated runtime environment variable.

**Never commit a fake or example publisher record.** Until a valid 16-digit publisher ID is configured, the route returns HTTP 404, not a misleading placeholder. Verify the actual returned text at `https://webgamearena.com/ads.txt`. A legitimate AdSense publisher account is required; the account holder must meet Google's age eligibility requirements.

## 6. Manual experience and policy checks

- Play all 22 games on representative desktop and mobile browsers.
- Confirm every guide accurately describes the deployed controls, scoring and storyline. Correct differences; do not replace them with generic claims.
- Confirm all game thumbnails load and no internal/unfinished text appears.
- Verify the Contact, About, Privacy, Cookies, Terms, Safety and Accessibility links in the footer.
- Confirm that legal disclosures match the real tracking and advertising technology in use.
- For relevant regions, check that a **Google-certified consent management platform** is integrated and functions correctly. The presence of a Cookie Policy does not substitute for working consent controls.
- Check ad placements do not overlap or resemble game controls; test narrow mobile viewports.
- Verify game art, music, models and logos are licensed for the intended commercial use.
- Keep pages with insufficient content or incomplete game functionality out of the index until they are ready.
- Review security and stability (failed asset requests, console exceptions, authentication and leaderboards).
- Avoid submitting the AdSense application again until the public content and policy checks have passed.

## 7. Known limitations and release gate

The public website could not be fetched reliably from our audit environment at release authoring time. A successful GitHub commit alone does not prove live deployment, crawlability, verified ownership, or AdSense eligibility. Record Cloudflare deployment success, run the domain audit from a working network and inspect Search Console reports before reapplying.

Google AdSense requires an account holder who is at least 18. For an under-18 site creator, a parent or guardian must use their own eligible Google Account and remain responsible for the AdSense account and payments.

Official references:
- Google Search Console: https://search.google.com/search-console/
- Verify site ownership: https://support.google.com/webmasters/answer/9008080
- Sitemap guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Google search indexing basics: https://developers.google.com/search/docs/crawling-indexing
- AdSense eligibility: https://support.google.com/adsense/answer/9724
- AdSense ads.txt guidance: https://support.google.com/adsense/answer/12171612
