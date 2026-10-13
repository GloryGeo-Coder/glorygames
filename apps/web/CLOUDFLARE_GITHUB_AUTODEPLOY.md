# WebGameArena — Cloudflare automatic GitHub builds

The production site uses a Next.js app adapted for Cloudflare Workers by `@opennextjs/cloudflare`, not a static Pages export. The existing Wrangler app name is `glorygames`.

## Configure Workers Builds

1. In Cloudflare, open **Workers & Pages** and choose the existing Worker serving `webgamearena.com`.
2. Under **Settings → Builds**, connect GitHub and select `GloryGeo-Coder/glorygames`.
3. Choose the **production branch** `main`.
4. Set **Root directory** to `apps/web` (contains `wrangler.jsonc`, `open-next.config.ts` and the web application's `package.json`).
5. Set **Build command** to `npx opennextjs-cloudflare build`.
6. Set **Deploy command** to `npx opennextjs-cloudflare deploy`.
7. Enable non-production **preview builds** if available. Verify previews before merging pull requests.
8. Ensure Cloudflare **Build variables and secrets** include any values required during the Next.js build, and that Worker runtime secrets remain configured (e.g. production database credentials). Do not commit secrets or local `.env` files.
9. Save. Cloudflare should build/deploy on a push or merge to `main` once the repository connection and settings are active.

## Before enabling auto-deploy

- Confirm the existing Worker is connected to the correct `webgamearena.com` custom domain.
- Review build logs to check `npm` workspace installation and Prisma generation succeed; the repository has a root `package.json` and `apps/web/package.json`.
- Deploy the category update on a preview branch and verify `/games?category=educational`, `/games?category=racing`, `/games?category=adventure`, plus the homepage categories.
- Keep the previous live deployment available for rollback.
- AdSense `ads.txt` and public/private environment variables must continue to work.

## Database category persistence

The application normalizes all 22 known game slugs at read time, correcting legacy rows without a database migration.
The protected `POST /api/admin/sync-games?dry=1` endpoint should report category changes once this code is deployed.
After reviewing its output, run `POST /api/admin/sync-games` with the existing `x-admin-key` credential to persist title, description, tags and category. **Do not** use `deleteMissing=1` for this correction.
Do not send the admin key to chat or commit it to the repository.

## Notes

- Automatic Cloudflare deployment cannot be enabled from a GitHub code change alone: the Worker must be linked to the Git repository inside the Cloudflare dashboard (or through an authorized Cloudflare API integration).
- The root-directory/build-command values above follow the existing OpenNext setup, not a migration to another adapter.
- Cloudflare documentation: https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/ and https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/
