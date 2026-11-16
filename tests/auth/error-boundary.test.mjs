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
  const state={token:null,rows:[{...sessionAccount}],database:true,fail:false};
  const calls=[]; const writes=[];
  const env={JWT_SECRET:sessionSecret,NODE_ENV:'production'};
  const source=await readFile(new URL('../../apps/web/src/lib/auth.ts',import.meta.url),'utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  const context=vm.createContext({process:{env},crypto:globalThis.crypto,TextEncoder,Uint8Array,Error});
  const dependencies={
    jose:{SignJWT:jose.SignJWT,jwtVerify:jose.jwtVerify,base64url:jose.base64url},
    'next/headers':{cookies:async()=>({get:()=>state.token?{value:state.token}:undefined,set:(name,value,options)=>{state.token=value;writes.push({name,value,options});}})},
    '@/lib/neon':{hasUsableNeonDatabaseUrl:()=>state.database,getNeonSql:()=>async(strings,...params)=>{calls.push({sql:strings.join('?'),params});if(state.fail)throw new Error('SYNTHETIC-PRIVATE-DATABASE-DETAIL');return state.rows;}}
  };
  const module=new vm.SourceTextModule(compiled,{context});
  await module.link(name=>{const values=dependencies[name];assert.ok(values,`Unexpected dependency ${name}`);return new vm.SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);},{context});});
  await module.evaluate();
  return {auth:module.namespace,state,calls,writes,env};
}

async function forgedSession(payload,algorithm='HS256'){
  return new jose.SignJWT(payload).setProtectedHeader({alg:algorithm,typ:'JWT'}).sign(new TextEncoder().encode(sessionSecret));
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

for(const defect of ['legacy','expired','future issued','long lifetime','wrong issuer','wrong audience','wrong algorithm','bad signature','bad proof','cross-account proof'])test(`session rejects ${defect} token`,async()=>{
  const {auth,state,calls}=await sessionHarness();
  const valid=await auth.signSession(sessionAccount,sessionAccount.passwordHash);
  const claims=jose.decodeJwt(valid);const now=Math.floor(Date.now()/1000);
  if(defect==='legacy'){delete claims.ver;delete claims.accountProof;}
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

test('absent/oversized cookies and unavailable database fail closed; logout clears only this browser cookie',async()=>{
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
