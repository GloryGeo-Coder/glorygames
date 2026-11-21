import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../../apps/web/package.json',import.meta.url));
const ts=require('typescript');
const source=await readFile(new URL('../../apps/web/src/lib/communityHttp.ts',import.meta.url),'utf8');
const calls=[];
function sql(strings,...args){return {text:strings.join('?'),args};}
sql.transaction=async(queries,options)=>{calls.push({queries,options});return [[],[{ok:true}]];};
const context=vm.createContext({Response,Request,URL,Uint8Array,TextDecoder,TextEncoder,Error,crypto:globalThis.crypto,process:{env:{JWT_SECRET:'SYNTHETIC-ONLY-COMMUNITY-KEY-'.repeat(3)}}});
const mod=new vm.SourceTextModule(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText,{context});
await mod.link(name=>{assert.equal(name,'@/lib/neon');return new vm.SyntheticModule(['getNeonSql'],function(){this.setExport('getNeonSql',()=>sql)},{context});});
await mod.evaluate();const api=mod.namespace;
const request=(body,origin='https://webgamearena.com')=>new Request('https://webgamearena.com/api/chat',{method:'POST',headers:{origin,'content-type':'application/json','cf-connecting-ip':'192.0.2.1'},body:JSON.stringify(body)});
test('cross-site, missing-origin, malformed and oversized bodies stop before a database call',async()=>{
 const before=calls.length;
 await assert.rejects(api.communityBody(request({text:'Hello'},'https://attacker.invalid')),e=>e.status===403);
 await assert.rejects(api.communityBody(new Request('https://webgamearena.com/api/chat',{method:'POST',body:'{}'})),e=>e.status===403);
 await assert.rejects(api.communityBody(request({text:'x'.repeat(5000)})),e=>e.status===413);
 await assert.rejects(api.communityBody(request([])),e=>e.status===400);
 assert.equal(calls.length,before);
});
test('typed chat blocks links, contact details, markup, repetitive spam and explicit abuse',()=>{
 assert.equal(api.communityText(' Good game! '),'Good game!');
 for(const text of ['https://example.invalid','www.example.invalid','a@example.invalid','Call +27 84 023 5917','<script>alert(1)</script>','aaaaaaaaaa','fuck','x'.repeat(181)])assert.throws(()=>api.communityText(text));
});
test('score input is bounded to positive safe integers',()=>{
 assert.equal(api.communityScore(123),123);
 for(const value of [0,-1,1.5,Infinity,NaN,'123',2000000001])assert.throws(()=>api.communityScore(value));
});
test('rate keys are purpose-bound hashes without raw identity or network information',async()=>{
 const a=await api.communityRateKey(request({}),'synthetic-a'),b=await api.communityRateKey(request({}),'synthetic-b'),guest=await api.communityRateKey(request({}));
 assert.match(a,/^[a-f0-9]{64}$/);assert.notEqual(a,b);assert.notEqual(a,guest);assert.equal(a,await api.communityRateKey(request({}),'synthetic-a'));
 assert.ok(!a.includes('synthetic-a')&&!guest.includes('192.0.2.1'));
});
test('only the chosen write transaction overrides the read-only default',async()=>{
 await api.communityWrite(db=>db`SELECT wga_community_private.report_chat(${'synthetic'}, ${null}, ${'a'.repeat(64)})`);
 const call=calls.at(-1);assert.equal(call.queries[0].text,'SET TRANSACTION READ WRITE');assert.equal(call.options.readOnly,false);assert.equal(call.queries.length,2);
});
test('database details are redacted while rate errors remain actionable',async()=>{
 const failure=api.communityError(new Error('PRIVATE_DATABASE_URL_AND_RECORDS'));
 assert.equal(failure.status,503);assert.ok(!(await failure.text()).includes('PRIVATE'));
 const rate=api.communityError(new Error('community_rate_limited'));assert.equal(rate.status,429);
});
