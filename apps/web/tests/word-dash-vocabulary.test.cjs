'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname,'../public/games/word-dash');
const vocabulary = require(path.join(root,'vocabulary.js'));
test('every campaign word has a usable meaning for the spelling challenge',()=>{
  const source=fs.readFileSync(path.join(root,'game.js'),'utf8');
  const groups=[...source.matchAll(/words:\s*\[([^\]]+)\]/g)];
  assert.equal(groups.length,4);
  const words=groups.flatMap(group=>[...group[1].matchAll(/'([A-Z]+)'/g)].map(m=>m[1]));
  assert(words.length>=60);
  for(const word of words) assert(vocabulary[word] && vocabulary[word].length>=12,`Missing meaning for ${word}`);
});
