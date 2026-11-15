// Produces a separate, unsubmitted Basic Launch candidate. Never edits the own-site game.
import { readFile, writeFile, readdir, mkdir, copyFile, stat } from 'node:fs/promises';
import { resolve, relative, dirname, join, sep, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const destination = process.argv[2];
const rightsConfirmed = process.argv.includes("--rights-confirmed");
if (!destination) throw Error('Supply a NEW absolute output directory.');
const source = resolve(fileURLToPath(new URL('../public/games/recycle-rush/', import.meta.url)));
const target = resolve(destination);
const within = (base, value) => { const rel = relative(base, value); return !rel || (rel !== '..' && !rel.startsWith('..' + sep) && !isAbsolute(rel)); };
if (within(source, target) || within(target, source)) throw Error('Output must be separate from source.');
await mkdir(target); // Existing output is deliberately rejected, not removed or overwritten.
const hashes = [], sourceHashes = [];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.isFile()) {
      const name = relative(source, path).replaceAll('\\', '/');
      const bytes = await readFile(path);
      sourceHashes.push({ name, bytes: bytes.length, sha256: sha(bytes) });
      await mkdir(dirname(join(target, name)), { recursive: true });
      await copyFile(path, join(target, name));
    } else throw Error('Unexpected symbolic link or special file.');
  }
}
await walk(source);
async function replace(name, before, after) {
  const path = join(target, name), text = (await readFile(path, 'utf8')).replace(/\r\n/g, '\n');
  if (text.split(before).length !== 2) throw Error(`Expected exactly one export transform: ${name}`);
  await writeFile(path, text.replace(before, after));
}
await replace('index.html', '  <link rel="stylesheet" href="/games/_shared/game-tab.css?v=1" />', '  <!-- Basic Launch export: no own-site navigation or tracking. -->');
await replace('index.html', '  <script type="module" src="/games/_shared/game-tab.mjs?v=1"></script>', '  <!-- Fullscreen is supplied by CrazyGames; no custom fullscreen control. -->');
const game = await readFile(join(target, 'game.js'), 'utf8');
const bridgeStart = game.indexOf("    const payload = { type:'GG_SCORE'");
const bridgeEnd = game.indexOf('\n  }', bridgeStart);
if (bridgeStart < 0 || bridgeEnd < 0) throw Error('Arcade score bridge not found.');
await writeFile(join(target, 'game.js'), game.slice(0, bridgeStart) + '    // Basic Launch: score and best stay on this device; no external score bridge.' + game.slice(bridgeEnd));
const story = await readFile(join(target, 'story.js'), 'utf8');
const storyStart = story.indexOf("    const payload = { type: 'GG_SCORE'");
const storyEnd = story.indexOf('\n  }', storyStart);
if (storyStart < 0 || storyEnd < 0) throw Error('Story score bridge not found.');
await writeFile(join(target, 'story.js'), story.slice(0, storyStart) + '    // Basic Launch: no account, public score submission or parent messages.' + story.slice(storyEnd));
await replace('story.js', "      const link = document.createElement('a'); link.href = L.SOURCES[0]; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Fibre Circle · Zithande Mzansi'; box.append(link);", "      box.append(paragraph('Learning reference: Fibre Circle · Zithande Mzansi.', 'story-help'));");
await replace('story.js', "  const observer = new MutationObserver(() => { if (document.querySelector('.wga-tab-fullscreen')) { mountFullscreen(); observer.disconnect(); } });\n  observer.observe(document.body, { childList: true, subtree: true });", "  // Portal supplies fullscreen; no own-site fullscreen observer.");
await writeFile(join(target, 'CREDITS.txt'), 'Recycle Rush: Restore Verdale\nCreator: Glory Mulopo / GloryGames.\nLearning reference: Fibre Circle, Zithande Mzansi.\n' + (rightsConfirmed ? 'Owner confirms ownership of code, characters, artwork and music, with no third-party commitments.\n' : 'Commercial redistribution rights await owner confirmation.\n') + 'No portal approval asserted.\n');
for (const file of sourceHashes) {
  if (sha(await readFile(join(source, file.name))) !== file.sha256) throw Error('Own-site source changed during export.');
}
for (const name of [...sourceHashes.map(file => file.name), 'CREDITS.txt']) {
  const bytes = await readFile(join(target, name));
  hashes.push({ name, bytes: bytes.length, sha256: sha(bytes) });
}
const bytes = hashes.reduce((sum, file) => sum + file.bytes, 0);
if (bytes > 50_000_000 || hashes.length > 1500) throw Error('Basic Launch size/count budget exceeded.');
await writeFile(target + '.inventory.json', JSON.stringify({
  createdUtc: new Date().toISOString(), target, sourceUnchanged: true,
  bytes, files: hashes.length, basicLaunchCandidate: true, submitted: false,
  monetizationEnabled: false, rightsConfirmed,
  limitation: 'Static export inventory. Mobile/browser QA and rights approval still required.',
  inventory: hashes, sourceInventory: sourceHashes,
}, null, 2) + '\n');
console.log(JSON.stringify({ target, bytes, files: hashes.length, sourceUnchanged: true, submitted: false }));
