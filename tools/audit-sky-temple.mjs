/** Read-only packaging and optional HTTP smoke audit. No account/score writes. */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const project = fileURLToPath(new URL('../', import.meta.url));
export const campaignPath = 'apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d';
function walk(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(root, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
export function auditCampaign(root = resolve(project, campaignPath)) {
  const errors = [], files = walk(root), refs = new Set();
  const oldPublicEntry = resolve(root, '../index.html');
  const text = path => readFileSync(path, 'utf8');
  function reference(from, value) {
    if (!value || /^(?:https?:|data:|#|\/)/.test(value)) return;
    const clean = value.split(/[?#]/)[0];
    if (!clean) return;
    const target = resolve(dirname(from), clean);
    if (target === oldPublicEntry) return; // Existing platform game, not part of the local campaign.
    if ((target !== root && !target.startsWith(root + sep)) || !existsSync(target)) errors.push(`${relative(root, from)}: missing/unsafe ${value}`);
    else refs.add(target);
  }
  for (const file of files) {
    if (statSync(file).size > 25 * 1024 * 1024) errors.push(`${relative(root, file)} exceeds the Workers asset limit`);
    if (file.includes(`${sep}vendor${sep}`)) continue;
    if (/\.(?:html|css|m?js)$/.test(file)) {
      const source = text(file);
      if (file.endsWith('.html')) {
        const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
        if (new Set(ids).size !== ids.length) errors.push(`${relative(root, file)}: duplicate element IDs`);
        if (!source.includes('content="noindex,nofollow"')) errors.push(`${relative(root, file)}: missing noindex`);
        if (/cdn\.babylonjs\.com/.test(source)) errors.push(`${relative(root, file)}: floating engine CDN`);
        for (const match of source.matchAll(/\b(?:src|href)="([^"]+)"/g)) reference(file, match[1]);
      }
      if (file.endsWith('.css')) for (const match of source.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)) reference(file, match[1]);
      if (/\.m?js$/.test(file)) {
        for (const match of source.matchAll(/(?:from\s*|import\s*)["'](\.[^"']+)["']/g)) reference(file, match[1]);
      }
    }
  }
  for (const [manifestPath, prefix, list] of [
    ['vendor/engine-manifest.json', 'vendor/', 'files'],
    ['assets/audio/music-manifest.json', 'assets/audio/', 'tracks'],
  ]) {
    const manifest = JSON.parse(text(resolve(root, manifestPath)));
    for (const entry of manifest[list]) {
      const path = resolve(root, prefix + entry.file);
      reference(resolve(root, 'index.html'), './' + prefix + entry.file);
      if (!existsSync(path)) continue;
      const bytes = readFileSync(path);
      if (entry.bytes !== bytes.length || entry.sha256 !== createHash('sha256').update(bytes).digest('hex')) errors.push(`${prefix + entry.file}: checksum mismatch`);
    }
  }
  const manifest = JSON.parse(text(resolve(root, 'vendor/engine-manifest.json')));
  for (const world of ['', 'crystal/', 'storm/', 'solar/']) {
    const html = text(resolve(root, world + 'index.html')), game = text(resolve(root, world + 'game.js'));
    for (const item of manifest.files) if (!html.includes(item.file)) errors.push(`${world}index.html: pinned engine missing`);
    if (/postMessage|SEND_SCORES_TO_PARENT/.test(game)) errors.push(`${world}game.js: shared score bridge enabled`);
    if (!game.includes('campaignPlatform.recordScore(score)')) errors.push(`${world}game.js: device scores missing`);
  }
  return { ok: errors.length === 0, files: files.length, references: refs.size,
    totalBytes: files.reduce((n, path) => n + statSync(path).size, 0),
    largestBytes: Math.max(...files.map(path => statSync(path).size)), errors };
}

async function httpSmoke(base) {
  const url = new URL(base);
  if (!/^https?:$/.test(url.protocol)) throw new Error('Use an HTTP(S) origin');
  const prefix = '/' + campaignPath.replace('apps/web/public/', '') + '/';
  const results = [];
  for (const path of ['launch.html', 'index.html', 'crystal/index.html', 'storm/index.html', 'solar/index.html',
    'campaign-platform.mjs', 'vendor/babylon-9.31.0.js', 'assets/audio/garden-exploration.mp3']) {
    const response = await fetch(new URL(prefix + path, url), { method: 'GET', redirect: 'error', signal: AbortSignal.timeout(10000) });
    const type = response.headers.get('content-type') || '';
    const expected = path.endsWith('.html') ? /text\/html/ : path.endsWith('.mp3') ? /audio\// : /(?:javascript|ecmascript)/;
    const body = new Uint8Array(await response.arrayBuffer());
    const local = readFileSync(resolve(project, campaignPath, path));
    const sameBytes = createHash('sha256').update(body).digest('hex') === createHash('sha256').update(local).digest('hex');
    const valid = response.ok && expected.test(type) && sameBytes;
    results.push({ path, status: response.status, type, bytes: body.length, sameBytes, ok: valid });
  }
  return { ok: results.every(item => item.ok), results };
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const result = auditCampaign();
  const index = process.argv.indexOf('--base-url');
  if (index >= 0) result.http = await httpSmoke(process.argv[index + 1]);
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.ok && (!result.http || result.http.ok) ? 0 : 1;
}
