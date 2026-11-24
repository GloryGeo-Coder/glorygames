import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const ts = createRequire(new URL('../../apps/web/package.json',import.meta.url))('typescript');
const sensitive = 'postgresql://synthetic:synthetic-secret@private.example.test/private_table';
async function load(route, dependencies, sourcePath=`../../apps/web/src/app/api/${route}/route.ts`) {
  const logs=[];
  const context=vm.createContext({Error,console:{error:(...args)=>logs.push(args)}, URL});
  const source=await readFile(new URL(sourcePath,import.meta.url),'utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  const module=new vm.SourceTextModule(compiled,{context});
  await module.link(name=>{
    const values=name==='next/server'?{NextResponse:{json:(body,options={})=>({body,status:options.status??200,headers:options.headers})}}:dependencies[name]??(name==='@/lib/launchPolicy'?{PUBLIC_HISTORICAL_LEADERBOARDS_ENABLED:true}:undefined);
    assert.ok(values,`Unexpected dependency ${name}`);
    return new vm.SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);},{context});
  });
  await module.evaluate(); return {GET:module.namespace.GET,namespace:module.namespace,logs};
}

test('historical API hold returns empty no-store data before request or database access',async()=>{
  const forbidden=()=>{throw new Error('Paused path accessed private data');};
  const {GET}=await load('leaderboard',{'@/lib/launchPolicy':{PUBLIC_HISTORICAL_LEADERBOARDS_ENABLED:false},'@/lib/gamesDb':{isPublicGameSlug:forbidden,getGlobalLeaderboardFromDatabase:forbidden,getLeaderboardForGameFromDatabase:forbidden}});
  const response=await GET(new Proxy({},{get:forbidden}));
  assert.deepEqual(JSON.parse(JSON.stringify(response.body)),{ok:true,paused:true,entries:[],rows:[],topScore:null});
  assert.match(response.headers['Cache-Control'],/no-store/);
});
for(const library of ['gamesDb','leaderboard','leaderboardPreview'])test(`historical hold prevents ${library} readers from reaching either database client`,async()=>{
  const forbidden=()=>{throw new Error('Paused library accessed private data');};
  const {namespace}=await load('',{'@/lib/launchPolicy':{PUBLIC_HISTORICAL_LEADERBOARDS_ENABLED:false},'@/lib/prisma':{prisma:new Proxy({},{get:forbidden})},'@/lib/neon':{getNeonSql:forbidden,hasUsableNeonDatabaseUrl:forbidden},'@/lib/gameCatalog':{catalogGame:forbidden},'@/lib/relatedGames':{selectRelated:forbidden}},`../../apps/web/src/lib/${library}.ts`);
  if(library==='gamesDb'){
    assert.equal((await namespace.getGlobalLeaderboardFromDatabase()).length,0);
    assert.equal((await namespace.getLeaderboardForGameFromDatabase({slug:'fixture'})).length,0);
  }else if(library==='leaderboard')assert.equal((await namespace.getLeaderboard('fixture')).length,0);
  else{
    assert.equal(await namespace.getTopScoreForGame('fixture'),null);
    assert.deepEqual(JSON.parse(JSON.stringify(await namespace.getLeaderboardPreview(['fixture']))),{fixture:null});
  }
});

test('catalogue API uses the shared HTTP reader and returns its public games without caching',async()=>{
  const games=[{id:'public-game',slug:'recycle-rush',title:'Recycle Rush',description:null,category:'EDUCATIONAL',tags:[]}];
  let calls=0;
  const {GET}=await load('games',{'@/lib/gamesDb':{getGamesFromDatabase:async()=>{calls++;return games;}}});
  const response=await GET();
  assert.equal(response.status,200);
  assert.deepEqual(JSON.parse(JSON.stringify(response.body)),{games});
  assert.equal(response.headers['Cache-Control'],'no-store');
  assert.equal(calls,1);
});
for(const kind of ['Error','non-Error']) test(`catalogue ${kind} failure is unavailable and never reveals database diagnostics`,async()=>{
  const {GET,logs}=await load('games',{'@/lib/gamesDb':{getGamesFromDatabase:async()=>{throw kind==='Error'?new Error(sensitive):{message:sensitive};}}});
  const response=await GET();
  assert.equal(response.status,503);
  assert.deepEqual(JSON.parse(JSON.stringify(response.body)),{games:[],error:'Catalogue unavailable'});
  assert.equal(response.headers['Cache-Control'],'no-store');
  assert.ok(!JSON.stringify({response,logs}).includes(sensitive));
});
test('public health checks connectivity without querying visitor tables or disclosing configuration',async()=>{
  const queries=[];
  const {GET}=await load('health/db',{'@/lib/neon':{hasUsableNeonDatabaseUrl:()=>true,getNeonSql:()=>async strings=>{queries.push(strings.join(''));return[{ready:1}];}}});
  const response=await GET();
  assert.deepEqual(JSON.parse(JSON.stringify(response.body)),{ok:true});
  assert.equal(response.headers['Cache-Control'],'no-store');
  assert.deepEqual(queries,['SELECT 1']);
});
for(const kind of ['missing','Error','non-Error']) test(`health ${kind} response and logs do not reveal database details`,async()=>{
  const {GET,logs}=await load('health/db',{'@/lib/neon':{hasUsableNeonDatabaseUrl:()=>kind!=='missing',getNeonSql:()=>async()=>{throw kind==='Error'?new Error(sensitive):{message:sensitive};}}});
  const response=await GET();
  assert.equal(response.status,kind==='missing'?503:500);
  assert.equal(response.headers['Cache-Control'],'no-store');
  assert.deepEqual(JSON.parse(JSON.stringify(response.body)),{ok:false,error:'Database unavailable'});
  assert.ok(!JSON.stringify({response,logs}).includes(sensitive));
});
test('global and game leaderboard APIs omit internal identifiers and unexpected database fields',async()=>{
  const row={rank:1,userId:'private-user-id',displayName:'Synthetic Player',score:123,gameSlug:'recycle-rush',gameTitle:'Recycle Rush',email:'private@example.test',passwordHash:'synthetic-hash'};
  const calls=[];
  const {GET}=await load('leaderboard',{'@/lib/gamesDb':{isPublicGameSlug:()=>true,getGlobalLeaderboardFromDatabase:async()=>{calls.push('global');return[row];},getLeaderboardForGameFromDatabase:async()=>{calls.push('game');return[row];}}});
  for(const url of ['https://example.test/api/leaderboard','https://example.test/api/leaderboard?gameSlug=recycle-rush']){
    const response=await GET({url}); const body=JSON.parse(JSON.stringify(response.body));
    assert.deepEqual(body.entries,[{rank:1,displayName:'Synthetic Player',score:123,gameSlug:'recycle-rush',gameTitle:'Recycle Rush'}]);
    assert.equal(body.rows[0].name,'Synthetic Player'); assert.equal(body.topScore,123);
    for(const secret of [row.userId,row.email,row.passwordHash]) assert.ok(!JSON.stringify(response).includes(secret));
  }
  assert.deepEqual(calls,['global','game']);
});
test('leaderboard failures preserve the empty public response without logging driver secrets',async()=>{
  const {GET,logs}=await load('leaderboard',{'@/lib/gamesDb':{isPublicGameSlug:()=>true,getGlobalLeaderboardFromDatabase:async()=>{throw new Error(sensitive);},getLeaderboardForGameFromDatabase:async()=>[]}});
  const response=await GET({url:'https://example.test/api/leaderboard'});
  assert.equal(response.status,200); assert.equal(response.body.ok,false); assert.equal(response.body.entries.length,0);
  assert.ok(!JSON.stringify({response,logs}).includes(sensitive));
});
