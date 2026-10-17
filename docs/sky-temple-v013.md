# Sky Temple 3D v0.13 — isolated campaign candidate

The four-world campaign previously existed only in the local recovery/release packages. This change introduces that complete campaign under `apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/` for production QA, without changing the public game's existing entry point or linking the candidate from the catalog.

## Entry points and platform behavior

`preview3d/launch.html` offers all worlds in a standalone window. `preview3d/index.html` starts Sky Garden; `crystal/`, `storm/` and `solar/` retain their existing transitions, checkpoints, Guardians and finale.

The campaign reads only `GET /api/me` after Play/Resume to display the current player name. Local serving or API failure falls back to the existing guest name or Guest Player. It does not create game sessions or submit scores. The score bridge is deliberately device-only during QA, even with the former `scores=1` option. Existing campaign saves, score rules and audio preferences remain compatible.

The entry pages self-host matching Babylon.js 9.31.0 engine and loader distributions, with Apache-2.0 attribution and a binary manifest in `vendor/`. Original GLBs, key art and all eight v0.12 MP3 tracks are byte-identical to the local working baseline. The candidate contains 64 runtime files totaling 15,289,132 bytes. Its largest asset is the 8,627,936-byte engine.

All candidate pages have robots noindex tags. Public `_headers` scopes noindex, nosniff and revalidation to this path. Noindex is not access control. No secrets or private account data are shipped. Existing public game files, Next.js routes, catalog behavior, database schema, score/session APIs and `wrangler.jsonc` are unchanged.

## Validation completed locally

- 277 automated checks pass with Node.js 24, covering all worlds, movement/combat/Guardians, transitions, saves, balance, audio/presentation, lifecycle and device-score integration.
- The pinned Babylon engine imports all 11 original GLBs, including the refined hero's skeleton and animation groups. Four additional tests build the actual world scenes, start gameplay, jump/blast and pause using Babylon NullEngine and a DOM fixture.
- Static audit resolves 52 distinct resource/module references, verifies engine/music hashes, checks HTML IDs, local engine script paths, noindex and removed parent score bridges. All candidate files are below the Workers per-asset size limit.
- JavaScript syntax (30 files), JSON parsing (2), CSS parsing (6), HTML parsing (5) and Python launcher/checker syntax pass.
- HTTP smoke checks return 200 and appropriate MIME types for the chooser, all worlds, platform module, engine and music sample; downloaded bytes match the packaged files.
- Next.js 16.2.6 production compilation, TypeScript and static generation pass.
- `npx opennextjs-cloudflare build` passes and emits `.open-next/worker.js`, the candidate assets and scoped `_headers`. Its existing Prisma bootstrap rewrites dependency/generated files locally; those incidental rewrites are excluded from this change.

Run the campaign checks from the repository root:

```sh
node tools/audit-sky-temple.mjs
node --test tests/*.test.mjs tests/*.test.cjs
```

Build from `apps/web` using the existing commands. The new GitHub Actions workflow repeats the campaign audit/tests on relevant pull requests and changes to main; it does not deploy. These are local results until the remote workflow is observed completing.

## Acceptance still required before promotion

NullEngine verifies actual Babylon asset/scene code; it does not render WebGL or establish GPU speed, visible quality, touch feel or audible mixing. The cloud browser could not reach the local test server. Check the four worlds on desktop Chrome/Firefox/Safari as available, Android Chrome and iPhone Safari, including 320×568, 390×844 and 844×390 layouts, pause/resume, fullscreen fallback, background audio, Guardian music and a complete campaign run. Record device/browser and result for each. Use the release's `MOBILE_ACCEPTANCE.md` for the detailed checklist.

The connected Cloudflare account currently returns `10007: Worker does not exist on your account` for `webgamearena`. The repository configuration names the expected Worker, but this connection cannot verify its deployments or GitHub build integration. Access to the account that owns that Worker is needed before verifying a deployment. Do not create a replacement Worker in the other account.

After device acceptance and access to the correct Cloudflare account, merge the reviewed isolated candidate, inspect its GitHub-triggered Cloudflare build/deployment, and run the read-only HTTP smoke audit against the deployed origin:

```sh
node tools/audit-sky-temple.mjs --base-url https://webgamearena.com
```

Also verify the candidate's response headers, signed-in/guest name display, no leaderboard/session writes and the unchanged public game. Keep the current public game entry point until the candidate has passed these hosted checks. The later catalog thumbnail/Play Game change and global leaderboard activation are separate work.

No merge, Worker deployment or public-game replacement is included in this phase's draft PR. Rollback is a revert of the isolated candidate commit; it needs no database migration or browser storage deletion.
