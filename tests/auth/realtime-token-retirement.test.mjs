import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const ts=createRequire(new URL('../../apps/web/package.json',import.meta.url))('typescript');
const source=await readFile(new URL('../../apps/web/src/app/api/realtime/token/route.ts',import.meta.url),'utf8');
for(const label of ['anonymous','signed-in','expired cookie']){
 test(`retired realtime bridge never reads or exports a session: ${label}`,async()=>{
  let reads=0;
  const fixtureToken=label==='anonymous'?null:`SYNTHETIC-ONLY-${label}`;
  const context=vm.createContext({Response,process:{env:{}},Error});
  const mod=new vm.SourceTextModule(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText,{context});
  await mod.link(name=>{
   const exports=name==='next/server'?{NextResponse:{json:(body,options={})=>Response.json(body,options)}}:name==='next/headers'?{cookies:async()=>{reads++;return{get:()=>fixtureToken?{value:fixtureToken}:undefined};}}:null;
   assert.ok(exports,'Unexpected realtime route dependency');
   return new vm.SyntheticModule(Object.keys(exports),function(){for(const[key,value]of Object.entries(exports))this.setExport(key,value);},{context});
  });
  await mod.evaluate();
  const response=await mod.namespace.GET();
  assert.equal(response.status,410);
  assert.equal(reads,0,'Retired endpoint must not read the cookie jar');
  assert.equal(response.headers.get('cache-control'),'no-store');
  assert.equal(response.headers.get('set-cookie'),null);
  const body=await response.json();
  assert.equal(body.token,undefined);
  assert.equal(body.ok,false);
  assert.ok(!JSON.stringify(body).includes('SYNTHETIC-ONLY'));
 });
}
