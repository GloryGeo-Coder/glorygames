import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const ts = createRequire(new URL('../../apps/web/package.json', import.meta.url))('typescript');
const jose = await import(pathToFileURL(createRequire(new URL('../../apps/web/package.json',import.meta.url)).resolve('jose')).href);
const sessionSecret='SYNTHETIC-SESSION-KEY-ONLY-'.repeat(3);
const sessionAccount={id:'synthetic-account-a',email:'a@example.test',displayName:'Synthetic A',passwordHash:'synthetic-password-hash-a'};

async function sessionHarness(){
  const state={token:null,rows:[{...sessionAccount}],database:true,fail:false,failRevocation:false,revoked:new Map()};
  const calls=[]; const writes=[];
  const env={JWT_SECRET:sessionSecret,NODE_ENV:'production'};
  const source=await readFile(new URL('../../apps/web/src/lib/auth.ts',import.meta.url),'utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  const context=vm.createContext({process:{env},crypto:globalThis.crypto,TextEncoder,Uint8Array,Error});
  const runQuery=async(strings,params)=>{
    const query=strings.join('?'); calls.push({sql:query,params});
    if(state.fail)throw new Error('SYNTHETIC-PRIVATE-DATABASE-DETAIL');
    if(query.includes('wga_session_private')){
      if(state.failRevocation)throw new Error('SYNTHETIC-PRIVATE-REVOCATION-DETAIL');
      if(state.missingRevocation)return [];
      if(state.unconfirmedRevocation)return [{revoked:false}];
      if(query.includes('.is_revoked('))return [{revoked:state.revoked.has(params[0])}];
      state.revoked.set(params[0],params[1]);return [{revoked:true}];
    }
    if(query.startsWith('SET TRANSACTION'))return [];
    return state.rows;
  };
  const sql=(strings,...params)=>({strings,params,then:(resolve,reject)=>runQuery(strings,params).then(resolve,reject)});
  sql.transaction=async(queries,options)=>{
    assert.equal(options.readOnly,false); assert.equal(queries[0].strings.join(''),'SET TRANSACTION READ WRITE');
    const result=[];for(const q of queries)result.push(await runQuery(q.strings,q.params));return result;
  };
  const dependencies={
    jose:{SignJWT:jose.SignJWT,jwtVerify:jose.jwtVerify,base64url:jose.base64url},
    'next/headers':{cookies:async()=>({get:()=>state.token?{value:state.token}:undefined,set:(name,value,options)=>{state.token=value;writes.push({name,value,options});}})},
    '@/lib/neon':{hasUsableNeonDatabaseUrl:()=>state.database,getNeonSql:()=>sql}
  };
  const module=new vm.SourceTextModule(compiled,{context});
  await module.link(name=>{const values=dependencies[name];assert.ok(values,`Unexpected dependency ${name}`);return new vm.SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);},{context});});
  await module.evaluate();
  return {auth:module.namespace,state,calls,writes,env};
}

async function forgedSession(payload,algorithm='HS256'){
  return new jose.SignJWT(payload).setProtectedHeader({alg:algorithm,typ:'JWT'}).sign(new TextEncoder().encode(sessionSecret));
}

function equivalentSignatureToken(token){
  const parts=token.split('.');const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const signature=parts[2];const index=alphabet.indexOf(signature.at(-1));
  parts[2]=signature.slice(0,-1)+alphabet[(index&~3)+1];
  assert.deepEqual(jose.base64url.decode(parts[2]),jose.base64url.decode(signature));
  return parts.join('.');
}

test('real session signature, one-hour cookie and current account read expose no password hash or stale profile',async()=>{
  const {auth,state,calls,writes}=await sessionHarness();
  await auth.createSession(sessionAccount,sessionAccount.passwordHash);
  const claims=jose.decodeJwt(state.token);
  assert.equal(claims.sub,sessionAccount.id);assert.equal(claims.exp-claims.iat,3600);
  assert.equal(claims.email,undefined);assert.equal(claims.displayName,undefined);
  assert.ok(!JSON.stringify(claims).includes(sessionAccount.passwordHash));
  assert.deepEqual(JSON.parse(JSON.stringify(writes[0].options)),{httpOnly:true,sameSite:'lax',secure:true,path:'/',maxAge:3600});
  state.rows[0].displayName='Current profile';
  state.rows[0].email='current@example.test';
  assert.deepEqual(JSON.parse(JSON.stringify(await auth.getSessionUser())),{id:sessionAccount.id,email:'current@example.test',displayName:'Current profile'});
  assert.deepEqual(calls[0].params,[sessionAccount.id]);
  assert.match(calls[0].sql,/SELECT id, email, "displayName", "passwordHash"/);
});

for(const change of ['deleted','password changed','wrong account'])test(`signed session rejects account ${change}`,async()=>{
  const {auth,state}=await sessionHarness();
  state.token=await auth.signSession(sessionAccount,sessionAccount.passwordHash);
  if(change==='deleted')state.rows=[];
  if(change==='password changed')state.rows[0].passwordHash='different-synthetic-hash';
  if(change==='wrong account')state.rows[0].id='synthetic-account-b';
  assert.equal(await auth.getSessionUser(),null);
});

for(const defect of ['legacy','version one','missing nonce','expired','future issued','long lifetime','wrong issuer','wrong audience','wrong algorithm','bad signature','bad proof','cross-account proof'])test(`session rejects ${defect} token`,async()=>{
  const {auth,state,calls}=await sessionHarness();
  const valid=await auth.signSession(sessionAccount,sessionAccount.passwordHash);
  const claims=jose.decodeJwt(valid);const now=Math.floor(Date.now()/1000);
  if(defect==='legacy'){delete claims.ver;delete claims.accountProof;}
  if(defect==='version one')claims.ver=1;
  if(defect==='missing nonce')delete claims.jti;
  if(defect==='expired'){claims.iat=now-3700;claims.exp=now-100;}
  if(defect==='future issued'){claims.iat=now+60;claims.exp=now+120;}
  if(defect==='long lifetime')claims.exp=claims.iat+86400;
  if(defect==='wrong issuer')claims.iss='https://other.example.test';
  if(defect==='wrong audience')claims.aud='other-service';
  if(defect==='bad proof')claims.accountProof='A'.repeat(43);
  if(defect==='cross-account proof'){claims.sub='synthetic-account-b';state.rows=[{...sessionAccount,id:claims.sub}];}
  state.token=await forgedSession(claims,defect==='wrong algorithm'?'HS384':'HS256');
  if(defect==='bad signature'){const parts=state.token.split('.');parts[2]=(parts[2][0]==='a'?'b':'a')+parts[2].slice(1);state.token=parts.join('.');}
  assert.equal(await auth.getSessionUser(),null);
  if(!['bad proof','cross-account proof'].includes(defect))assert.equal(calls.length,0);
});

test('absent/oversized cookies and unavailable database fail closed; logout acknowledges revocation before clearing the cookie',async()=>{
  const {auth,state,calls,writes,env}=await sessionHarness();
  assert.equal(await auth.getSessionUser(),null);
  state.token='x'.repeat(4097);assert.equal(await auth.getSessionUser(),null);assert.equal(calls.length,0);
  state.token=await auth.signSession(sessionAccount,sessionAccount.passwordHash);
  state.database=false;assert.equal(await auth.getSessionUser(),null);assert.equal(calls.length,0);
  state.database=true;state.fail=true;assert.equal(await auth.getSessionUser(),null);
  state.fail=false;
  await auth.destroySession();assert.equal(state.token,'');assert.equal(writes.at(-1).options.maxAge,0);
  env.JWT_SECRET='';assert.equal(await auth.getSessionUser(),null);
});

for(const kind of ['Error','non-Error'])test(`identity endpoint ${kind} failure reveals no private diagnostic`,async()=>{
  const sensitive='SYNTHETIC-PRIVATE-IDENTITY-DIAGNOSTIC';const logs=[];
  const source=await readFile(new URL('../../apps/web/src/app/api/me/route.ts',import.meta.url),'utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  const context=vm.createContext({Error,console:{error:(...args)=>logs.push(args)}});
  const dependencies={'next/server':{NextResponse:{json:(body,options={})=>({body,headers:options.headers})}},'@/lib/auth':{getSessionUser:async()=>{throw kind==='Error'?new Error(sensitive):{message:sensitive};}}};
  const module=new vm.SourceTextModule(compiled,{context});
  await module.link(name=>{const values=dependencies[name];assert.ok(values);return new vm.SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);},{context});});await module.evaluate();
  const response=await module.namespace.GET();assert.equal(response.body.user,null);
  assert.match(response.headers['Cache-Control'],/no-store/);
  assert.ok(!JSON.stringify({response,logs}).includes(sensitive));
});

for (const endpoint of ['login', 'signup']) {
  for (const kind of ['Error', 'non-Error']) {
    test(`${endpoint} does not disclose database failure details (${kind})`, async () => {
      const sensitive = 'postgresql://test_user:synthetic_private_password@database.example.test/private_table';
      const thrown = kind === 'Error' ? new Error(sensitive) : { message: sensitive };
      const logs = [];
      const source = await readFile(new URL(`../../apps/web/src/app/api/auth/${endpoint}/route.ts`, import.meta.url), 'utf8');
      const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
      const chain = { email() { return this; }, min() { return this; }, max() { return this; }, optional() { return this; } };
      const dependencies = {
        'next/server': { NextResponse: { json: (body, options = {}) => ({ body, status: options.status ?? 200 }) } },
        bcryptjs: { default: { hash: async () => 'synthetic-hash' } },
        zod: { z: { string: () => chain, object: () => ({ safeParse: () => ({ success: true, data: { email: 'qa@example.test', password: 'synthetic-test-password' } }) }) } },
        '@/lib/launchPolicy': { PUBLIC_SIGNUP_ENABLED: true },
        '@/lib/neon': { createId: () => 'synthetic-id', hasUsableNeonDatabaseUrl: () => true, getNeonSql: () => async () => { throw thrown; } },
        '@/lib/auth': { getSessionCookieName: () => 'test-cookie', getSessionCookieOptions: () => ({}), isAuthConfigured: () => true, signSession: async () => 'synthetic-token' },
      };
      const context = vm.createContext({ Error, console: { error: (...values) => logs.push(values) } });
      const module = new vm.SourceTextModule(compiled, { context });
      await module.link((name) => {
        const values = dependencies[name];
        assert.ok(values, `Unexpected dependency ${name}`);
        return new vm.SyntheticModule(Object.keys(values), function () {
          for (const [key, value] of Object.entries(values)) this.setExport(key, value);
        }, { context });
      });
      await module.evaluate();
      const response = await module.namespace.POST({ json: async () => ({}) });
      assert.equal(response.status, 500);
      assert.equal(typeof response.body.error, 'string');
      assert.ok(response.body.error.length > 15);
      assert.ok(!JSON.stringify(response).includes(sensitive));
      assert.ok(!JSON.stringify(logs).includes(sensitive));
      assert.ok(!JSON.stringify(response).includes('private_table'));
    });
  }
}


test('copied signed token is rejected after logout while independent same-second login survives',async()=>{
  const {auth,state,writes}=await sessionHarness();
  const copied=await auth.signSession(sessionAccount,sessionAccount.passwordHash);
  const independent=await auth.signSession(sessionAccount,sessionAccount.passwordHash);
  assert.notEqual(copied,independent);
  state.token=copied;assert.ok(await auth.getSessionUser());
  await auth.destroySession();assert.equal(state.token,'');assert.equal(writes.at(-1).options.maxAge,0);
  assert.equal(state.revoked.size,1);
  assert.match([...state.revoked.keys()][0],/^[0-9a-f]{64}$/);
  assert.ok(!JSON.stringify([...state.revoked]).includes(copied));
  state.token=copied;assert.equal(await auth.getSessionUser(),null);
  await auth.destroySession();assert.equal(state.revoked.size,1);
  state.token=independent;assert.ok(await auth.getSessionUser());
});

for(const logoutEncoding of ['canonical','equivalent signature'])test(`logout using ${logoutEncoding} invalidates both equivalent token encodings`,async()=>{
  const {auth,state}=await sessionHarness();
  const canonical=await auth.signSession(sessionAccount,sessionAccount.passwordHash);
  const alternate=equivalentSignatureToken(canonical);assert.notEqual(canonical,alternate);
  state.token=alternate;assert.ok(await auth.getSessionUser());
  state.token=logoutEncoding==='canonical'?canonical:alternate;await auth.destroySession();
  state.token=canonical;assert.equal(await auth.getSessionUser(),null);
  state.token=alternate;assert.equal(await auth.getSessionUser(),null);
  assert.equal(state.revoked.size,1);
});

test('revocation outage fails authentication closed and failed logout preserves cookie for retry',async()=>{
  const {auth,state,writes}=await sessionHarness();
  state.token=await auth.signSession(sessionAccount,sessionAccount.passwordHash);
  const original=state.token;state.failRevocation=true;
  assert.equal(await auth.getSessionUser(),null);
  await assert.rejects(auth.destroySession());assert.equal(state.token,original);assert.equal(writes.length,0);
  state.failRevocation=false;await auth.destroySession();state.token=original;
  assert.equal(await auth.getSessionUser(),null);
});

for(const method of ['GET','POST'])test(`logout ${method} failure cannot claim success or leak private diagnostics`,async()=>{
  const source=await readFile(new URL('../../apps/web/src/app/api/auth/logout/route.ts',import.meta.url),'utf8');
  const context=vm.createContext({process:{env:{}},URL});
  const values={
    'next/server':{NextResponse:{json:(body,options)=>({body,...options}),redirect:()=>{throw Error('Unexpected redirect');}}},
    '@/lib/auth':{destroySession:async()=>{throw Error('SYNTHETIC-PRIVATE-REVOCATION-DETAIL');}}
  };
  const module=new vm.SourceTextModule(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText,{context});
  await module.link(name=>new vm.SyntheticModule(Object.keys(values[name]),function(){for(const[k,v]of Object.entries(values[name]))this.setExport(k,v);},{context}));
  await module.evaluate();const response=await module.namespace[method]();
  assert.equal(response.status,503);assert.equal(response.body.ok,false);assert.match(response.headers['Cache-Control'],/no-store/);
  assert.ok(!JSON.stringify(response).includes('SYNTHETIC-PRIVATE-REVOCATION-DETAIL'));
});


test('missing revocation state rejects identity and unconfirmed acknowledgement preserves logout cookie',async()=>{
  const {auth,state,writes}=await sessionHarness();
  state.token=await auth.signSession(sessionAccount,sessionAccount.passwordHash);const original=state.token;
  state.missingRevocation=true;assert.equal(await auth.getSessionUser(),null);
  await assert.rejects(auth.destroySession());assert.equal(state.token,original);assert.equal(writes.length,0);
  state.missingRevocation=false;state.unconfirmedRevocation=true;
  await assert.rejects(auth.destroySession());assert.equal(state.token,original);assert.equal(writes.length,0);
});
