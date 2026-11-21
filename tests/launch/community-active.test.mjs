import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const ts=createRequire(new URL('../../apps/web/package.json',import.meta.url))('typescript');
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
async function harness(route,{user=null,database=false}={}){
 const calls=[];
 const forbidden=()=>{throw new Error('Unexpected database access');};
 function sql(strings,...args){return {text:strings.join('?'),args,then(resolve,reject){calls.push({text:strings.join('?'),args});return Promise.resolve([{id:'fixture-message',playerName:'Fixture Player',text:'Good game',ts:123}]).then(resolve,reject);}};}
 sql.transaction=async(queries,options)=>{calls.push({queries,options});return [[],[{message:{id:'fixture-message',user:'Server Player',text:'Good game',ts:123}}]];};
 const context=vm.createContext({Request,Response,URL,Uint8Array,TextDecoder,TextEncoder,Error,crypto:globalThis.crypto,console,process:{env:{JWT_SECRET:'SYNTHETIC-ONLY-COMMUNITY-KEY-'.repeat(3)}}});
 const synthetic=values=>new vm.SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);},{context});
 const neon=synthetic({getNeonSql:database?()=>sql:forbidden,hasUsableNeonDatabaseUrl:()=>true});
 const policy=new vm.SourceTextModule(compile(await readFile(new URL('../../apps/web/src/lib/launchPolicy.ts',import.meta.url),'utf8')),{context});
 await policy.link(forbidden);await policy.evaluate();
 const community=new vm.SourceTextModule(compile(await readFile(new URL('../../apps/web/src/lib/communityHttp.ts',import.meta.url),'utf8')),{context});
 await community.link(name=>{assert.equal(name,'@/lib/neon');return neon;});await community.evaluate();
 const mod=new vm.SourceTextModule(compile(await readFile(new URL(`../../apps/web/src/app/api/${route}/route.ts`,import.meta.url),'utf8')),{context});
 await mod.link(name=>{
  if(name==='@/lib/launchPolicy')return policy;
  if(name==='@/lib/communityHttp')return community;
  if(name==='@/lib/neon')return neon;
  if(name==='next/server')return synthetic({NextResponse:{json:(b,o={})=>Response.json(b,o)}});
  if(name==='@/lib/auth')return synthetic({getSessionUser:async()=>user});
  if(name==='@/lib/gamesDb')return synthetic({isPublicGameSlug:slug=>slug==='fruit-slice'});
  throw Error('Unexpected route dependency '+name);
 });await mod.evaluate();
 return {api:mod.namespace,calls};
}
const request=(path,body,origin='https://webgamearena.com')=>new Request('https://webgamearena.com/api/'+path,{method:'POST',headers:{origin,'content-type':'application/json','cf-connecting-ip':'192.0.2.1'},body:JSON.stringify(body)});
for(const route of ['chat','chat/report','games/[slug]/score','daily-challenge/submit']){
 test(`enabled ${route} rejects cross-site requests before database access`,async()=>{
  const {api,calls}=await harness(route);const response=await api.POST(request(route,{},'https://attacker.invalid'),{params:Promise.resolve({slug:'fruit-slice'})});
  assert.equal(response.status,403);assert.match((await response.json()).error,/Same-origin/);assert.equal(calls.length,0);
 });
}
test('enabled global scores require an existing authenticated account',async()=>{
 const {api,calls}=await harness('games/[slug]/score');const response=await api.POST(request('games/fruit-slice/score',{score:50}),{params:Promise.resolve({slug:'fruit-slice'})});
 assert.equal(response.status,401);assert.equal(calls.length,0);
});
test('enabled daily scores reject invalid values before database access',async()=>{
 const {api,calls}=await harness('daily-challenge/submit');const response=await api.POST(request('daily-challenge/submit',{gameSlug:'fruit-slice',score:-1}));
 assert.equal(response.status,400);assert.equal(calls.length,0);
});
test('enabled chat rejects unsafe content and oversized requests before database access',async()=>{
 const {api,calls}=await harness('chat');
 assert.equal((await api.POST(request('chat',{gameSlug:'fruit-slice',text:'https://example.invalid'}))).status,400);
 assert.equal((await api.POST(request('chat',{gameSlug:'fruit-slice',text:'x'.repeat(5000)}))).status,413);
 assert.equal(calls.length,0);
});
test('enabled chat resolves account identity server-side and uses only the bounded function transaction',async()=>{
 const {api,calls}=await harness('chat',{database:true,user:{id:'synthetic-session-account',displayName:'Server Player'}});
 const response=await api.POST(request('chat',{gameSlug:'fruit-slice',text:'Good game',playerName:'Spoofed',userId:'spoofed-account'}));
 assert.equal(response.status,200);assert.equal(calls.length,1);const call=calls[0];
 assert.equal(call.options.readOnly,false);assert.equal(call.queries[0].text,'SET TRANSACTION READ WRITE');
 assert.match(call.queries[1].text,/wga_community_private\.post_chat/);
 assert.equal(call.queries[1].args[1],'synthetic-session-account');assert.equal(call.queries[1].args[2],'Server Player');assert.match(call.queries[1].args[4],/^[a-f0-9]{64}$/);
 assert.ok(!JSON.stringify(call).includes('Spoofed')&&!JSON.stringify(call).includes('192.0.2.1'));
});
test('enabled chat reads return only public message fields',async()=>{
 const {api,calls}=await harness('chat',{database:true});const response=await api.GET(new Request('https://webgamearena.com/api/chat?gameSlug=fruit-slice'));
 assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
 const body=await response.json();assert.deepEqual(Object.keys(body.messages[0]).sort(),['id','text','ts','user']);assert.equal(calls.length,1);
});
