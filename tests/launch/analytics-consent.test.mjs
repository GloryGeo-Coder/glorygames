import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../apps/web/package.json', import.meta.url));
const ts = require('typescript');
const source = await readFile(new URL('../../apps/web/src/lib/publicAnalytics.ts', import.meta.url), 'utf8');
const context = vm.createContext({ process: { env: {} }, Date, Reflect });
const module = new vm.SourceTextModule(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText, { context });
await module.link(() => { throw Error('Analytics core unexpectedly imports another dependency'); });
await module.evaluate();
const api = module.namespace;
function fixture({ enabled=true, hostname='webgamearena.com', pathname='/' }={}) {
  const scripts=[], cookies=[];
  let reloads=0;
  const win={ location:{hostname,pathname,reload(){reloads++;}} };
  const doc={head:{appendChild(script){scripts.push(script);}},createElement(tag){assert.equal(tag,'script');return{remove(){this.removed=true;}};},set cookie(value){cookies.push(value);}};
  const controller=api.createPublicAnalytics(win,doc,enabled);
  return{controller,win,scripts,cookies,get reloads(){return reloads;},commands(){return (win.dataLayer||[]).map(args=>Array.from(args));}};
}

test('unknown, declined and under-18/unchecked choices produce zero Google script requests',()=>{
  const f=fixture();f.controller.sync('/games');assert.equal(f.scripts.length,0);assert.equal(f.win.dataLayer,undefined);
  assert.equal(f.controller.grant(false),false);f.controller.stop();assert.equal(f.scripts.length,0);assert.equal(f.win.dataLayer,undefined);assert.equal(f.reloads,0);
});
test('preview hosts, disabled release and private/unknown routes fail closed',()=>{
  for(const options of [{enabled:false},{hostname:'localhost'},{hostname:'preview.example'},{hostname:'evilwebgamearena.com'},{pathname:'/login'},{pathname:'/api/auth/me'},{pathname:'/unknown'}]){
    const f=fixture(options);assert.equal(f.controller.grant(true),false);assert.equal(f.scripts.length,0);
  }
});
test('explicit adult opt-in loads only the selected GA4 tag with no referrer',()=>{
  const f=fixture();assert.equal(f.controller.grant(true),true);assert.equal(f.scripts.length,1);
  assert.equal(f.scripts[0].src,'https://www.googletagmanager.com/gtag/js?id=G-SVTR9HMDJ2');assert.equal(f.scripts[0].referrerPolicy,'no-referrer');
  const commands=f.commands();assert.equal(commands[0][0],'consent');assert.equal(commands[0][2].analytics_storage,'denied');assert.equal(commands[1][2].analytics_storage,'granted');
  for(const command of commands.filter(c=>c[0]==='consent'))for(const key of ['ad_storage','ad_user_data','ad_personalization'])assert.equal(command[2][key],'denied');
  const config=commands.find(c=>c[0]==='config')[2];assert.equal(config.send_page_view,false);assert.equal(config.allow_google_signals,false);assert.equal(config.allow_ad_personalization_signals,false);assert.equal(config.cookie_update,false);assert.equal(config.cookie_expires,3600);
  assert.equal(commands.filter(c=>c[0]==='event').length,0);
  f.scripts[0].onload();assert.equal(f.commands().filter(c=>c[0]==='event').length,1);
  f.controller.grant(true);f.controller.sync('/');assert.equal(f.scripts.length,1);assert.equal(f.commands().filter(c=>c[0]==='event').length,1);
});
test('only coarse public paths and fixed titles enter page views; no account, query or fragment data',()=>{
  for(const path of ['/login','/signup','/account','/api/auth/me','/games?q=secret@example.invalid','/play/game#private','/play/email@example.invalid'])assert.equal(api.analyticsPage(path),null);
  const f=fixture({pathname:'/play/recycle-rush'});f.controller.grant(true);f.scripts[0].onload();
  f.controller.sync('/games/fruit-slice');f.controller.sync('/categories/educational');
  const views=f.commands().filter(c=>c[0]==='event');
  assert.equal(views[0][2].page_location,'https://webgamearena.com/play/game');assert.equal(views[1][2].page_location,'https://webgamearena.com/games/game');
  for(const view of views){assert.equal(view[2].page_referrer,'');assert.deepEqual(Object.keys(view[2]).sort(),['page_location','page_referrer','page_title','send_to']);}
  assert.ok(!JSON.stringify(f.commands()).includes('recycle-rush'));
});
test('withdrawal suppresses collection before reload, drops queued work and clears only property cookies',()=>{
  const f=fixture();f.controller.grant(true);const script=f.scripts[0];script.onload();f.controller.stop(true);
  assert.equal(f.win['ga-disable-G-SVTR9HMDJ2'],true);assert.equal(script.removed,true);assert.equal(f.reloads,1);assert.equal(f.commands().length,0);
  script.onload();f.controller.sync('/games');assert.equal(f.commands().length,0);
  assert.ok(f.cookies.length>0);for(const cookie of f.cookies){assert.match(cookie,/^_ga(?:_SVTR9HMDJ2)?=;/);assert.match(cookie,/Max-Age=0/);assert.ok(!cookie.includes('session'));}
});
test('leaving public pages reloads even after navigation capture already disabled the tag',()=>{
  const f=fixture();f.controller.grant(true);f.scripts[0].onload();f.controller.stop();f.controller.sync('/login');assert.equal(f.reloads,1);assert.equal(f.commands().length,0);
});
test('a new document does not inherit adult confirmation or consent',()=>{
  const first=fixture();first.controller.grant(true);const next=fixture();next.controller.sync('/games');assert.equal(next.scripts.length,0);assert.equal(next.win['ga-disable-G-SVTR9HMDJ2'],true);
});
test('failed tag loading disables collection and reloads without a denial ping',()=>{
  const f=fixture();f.controller.grant(true);f.scripts[0].onerror();assert.equal(f.reloads,1);assert.equal(f.commands().length,0);assert.equal(f.win['ga-disable-G-SVTR9HMDJ2'],true);
});
