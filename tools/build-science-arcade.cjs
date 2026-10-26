'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), sharp = require('sharp');
sharp.concurrency(1);
sharp.cache({memory: 16, files: 0, items: 10});
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
(async () => {
  const root = path.resolve(__dirname, '../apps/web/public/games/science-lab-dash');
  const source = path.join(__dirname, 'science-arcade-source/creatures.webp');
  const meta = await sharp(source).metadata(), cw = meta.width / 4, ch = meta.height / 3;
  if (!Number.isInteger(cw) || !Number.isInteger(ch)) throw Error('Source atlas must have a 4 × 3 grid');
  const cells = [];
  for (let n = 0; n < 12; n++) {
    const cell = await sharp(source).extract({left: n % 4 * cw, top: Math.floor(n / 4) * ch, width: cw, height: ch}).png().toBuffer();
    const buffer = await sharp(cell).trim({background: '#0000', threshold: 8}).png().toBuffer();
    const m = await sharp(buffer).metadata();
    cells.push({buffer, width: m.width, height: m.height});
  }
  const parts = [];
  for (let row = 0; row < 3; row++) {
    const group = cells.slice(row * 4, row * 4 + 4);
    const scale = Math.min(174 / Math.max(...group.map(c => c.width)), 174 / Math.max(...group.map(c => c.height)));
    for (let i = 0; i < 4; i++) {
      const c = group[i], w = Math.round(c.width * scale), h = Math.round(c.height * scale);
      parts.push({input: await sharp(c.buffer).resize(w, h).png().toBuffer(), left: i * 192 + Math.round((192 - w) / 2), top: row * 192 + 182 - h});
    }
  }
  const data = {version: 1, src: 'assets/arcade/creatures.png', frameWidth: 192, frameHeight: 192, columns: 4, rows: 3, width: 768, height: 576, anchor: [96, 182], sourceHash: hash(source), builderHash: hash(__filename), clips: {slime: [0, 1, 2, 3], robot: [4, 5, 6, 7], guardian: [8, 9, 10, 11]}};
  await sharp({create: {width: data.width, height: data.height, channels: 4, background: '#0000'}}).composite(parts).png({compressionLevel: 9}).toFile(path.join(root, data.src));
  fs.writeFileSync(path.join(root, 'arcade-art-data.js'), '(function(r){const d=' + JSON.stringify(data) + ';if(typeof module==="object"&&module.exports)module.exports=d;else r.ScienceArcadeArtData=d;})(typeof globalThis!=="undefined"?globalThis:this);\n');
  console.log('Packed 12 transparent arcade poses: ' + fs.statSync(path.join(root, data.src)).size + ' bytes');
})().catch(e => {console.error(e); process.exitCode = 1;});
