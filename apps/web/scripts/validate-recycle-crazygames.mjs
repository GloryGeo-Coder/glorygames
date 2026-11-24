import { readFile, stat, writeFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
const root = resolve(process.argv[2]);
const inventory = JSON.parse(await readFile(root + '.inventory.json', 'utf8'));
const checks = [];
for (const file of inventory.inventory) {
  const bytes = await readFile(join(root, file.name));
  if (bytes.length !== file.bytes || createHash('sha256').update(bytes).digest('hex') !== file.sha256) throw Error('Inventory mismatch: ' + file.name);
  if (file.name.endsWith('.js')) {
    const text = bytes.toString(); new vm.Script(text, { filename:file.name });
    if (/window\.(?:parent|GG)\b|\bfetch\s*\(|XMLHttpRequest|sendBeacon|adsbygoogle|googletagmanager|requestFullscreen/.test(text)) throw Error('External/portal interference: ' + file.name);
  }
  if (/\.(?:html|css)$/.test(file.name)) {
    const text = bytes.toString();
    const refs = file.name.endsWith('.html') ? [...text.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(x => x[1]) : [...text.matchAll(/url\(["']?([^\s)'";]+)["']?\)/g)].map(x => x[1]);
    for (const ref of refs) {
      if (ref.startsWith('data:') || ref.startsWith('#')) continue;
      if (/^(?:[a-z]+:|\/)/i.test(ref)) throw Error('Non-relative reference: ' + ref);
      await stat(resolve(root, dirname(file.name), ref.split(/[?#]/)[0]));
    }
  }
}
checks.push('all packaged hashes/sizes match', 'all JavaScript parses', 'no external score/account/ads/network bridge in JavaScript', 'no custom fullscreen', 'HTML/CSS resource references are relative and present');
if (inventory.bytes > 50_000_000 || inventory.files > 1500) throw Error('Basic Launch budget exceeded');
checks.push('Basic Launch size and file count pass');
const report = { checkedUtc:new Date().toISOString(), root, checks, passed:true, sourceUnchanged:inventory.sourceUnchanged, rightsConfirmed:inventory.rightsConfirmed, submitted:false, limitation:'Static validation; isolated browser acceptance and publisher review are separate.' };
await writeFile(root + '.validation.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
