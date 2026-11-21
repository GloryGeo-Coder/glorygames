// Invoked only by the owned, network-isolated restore runner. Synthetic accounts only.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
const require=createRequire(new URL('../../apps/web/package.json',import.meta.url));
const ts=require('typescript');
const jose=await import(pathToFileURL(require.resolve('jose')).href);
const container=process.argv[2];
if(!/^wga-revoke-[0-9a-f]{12}$/.test(container??''))throw Error('Isolated runner required');
const checks=[];
let phase='application harness';
const check=(label,condition)=>{assert.ok(condition);checks.push(label);};
function execute(statement,role='wga_runtime'){
  const result=spawnSync('docker',['exec','-i',container,'psql','-X','-qAt','-w','-U',role,'-d','wga_restore','-v','ON_ERROR_STOP=1'],
    {input:statement,encoding:'utf8',timeout:20000,windowsHide:true});
  if(result.status!==0)throw Error('Isolated SQL rejected; diagnostics omitted');
  return result.stdout.trim();
}
const literal=value=>typeof value==='number'?String(value):"'"+String(value).replaceAll("'","''")+"'";
const render=query=>query.strings.reduce((text,part,index)=>text+part+(index<query.params.length?literal(query.params[index]):''),'');
const rows=query=>JSON.parse(execute('SELECT coalesce(json_agg(t),\'[]\'::json) FROM ('+render(query)+') t;'));
const sql=(strings,...params)=>({strings,params,then:(resolve,reject)=>Promise.resolve().then(()=>rows({strings,params})).then(resolve,reject)});
sql.transaction=async(queries,options)=>{
  assert.equal(options.readOnly,false);
  assert.equal(render(queries[0]),'SET TRANSACTION READ WRITE');
  assert.equal(queries.length,2);
  const result=execute('BEGIN READ WRITE;\n'+render(queries[0])+';\nSELECT coalesce(json_agg(t),\'[]\'::json) FROM ('+render(queries[1])+') t;\nCOMMIT;');
  return [[],JSON.parse(result)];
};
let token=null;const writes=[];
const source=await readFile(new URL('../../apps/web/src/lib/auth.ts',import.meta.url),'utf8');
const context=vm.createContext({process:{env:{JWT_SECRET:'SYNTHETIC-OFFLINE-SESSION-KEY-'.repeat(3),NODE_ENV:'production'}},
  crypto:globalThis.crypto,TextEncoder,Uint8Array,Error});
const dependencies={jose,
  'next/headers':{cookies:async()=>({get:()=>token?{value:token}:undefined,set:(name,value,options)=>{token=value;writes.push(options);}})},
  '@/lib/neon':{getNeonSql:()=>sql,hasUsableNeonDatabaseUrl:()=>true}};
const module=new vm.SourceTextModule(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText,{context});
try{
  await module.link(name=>{
    const values=dependencies[name];assert.ok(values);
    return new vm.SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);},{context});
  });await module.evaluate();const auth=module.namespace;
  const a={id:'wga-revoke-synthetic-a',email:'revoke-a@example.invalid',displayName:'Synthetic A'};
  const b={id:'wga-revoke-synthetic-b',email:'revoke-b@example.invalid',displayName:'Synthetic B'};
  phase='real signed session and database account lookup';
  const copied=await auth.signSession(a,'SYNTHETIC-HASH-A');
  const independent=await auth.signSession(a,'SYNTHETIC-HASH-A');
  const other=await auth.signSession(b,'SYNTHETIC-HASH-B');
  const parts=copied.split('.');const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const signature=parts[2];const last=alphabet.indexOf(signature.at(-1));
  parts[2]=signature.slice(0,-1)+alphabet[(last&~3)+1];
  assert.deepEqual(jose.base64url.decode(parts[2]),jose.base64url.decode(signature));
  const alternate=parts.join('.');assert.notEqual(copied,alternate);
  check('independent same-account sessions have unique signed tokens',copied!==independent);
  token=copied;check('actual auth module accepts synthetic A through real restricted SQL', (await auth.getSessionUser())?.id===a.id);
  token=alternate;check('equivalent signature encoding is accepted before logout',(await auth.getSessionUser())?.id===a.id);
  token=other;check('actual auth module accepts synthetic B through real restricted SQL',(await auth.getSessionUser())?.id===b.id);
  token=copied;
  phase='acknowledged logout and copied-token replay';
  await auth.destroySession();check('logout commits revocation then clears the cookie',token===''&&writes.at(-1).maxAge===0);
  token=copied;check('copied token is rejected after completed logout',await auth.getSessionUser()===null);
  token=alternate;check('equivalent signature encoding cannot bypass confirmed logout',await auth.getSessionUser()===null);
  await auth.destroySession();
  check('duplicate logout remains idempotent',execute('SELECT count(*)=1 FROM wga_session_private.revoked_tokens;','wga_restore_admin')==='t');
  token=independent;check('independent A session remains accepted',(await auth.getSessionUser())?.id===a.id);
  token=other;check('B session is not revoked by A logout',(await auth.getSessionUser())?.id===b.id);
  phase='revocation-store permission outage';
  execute('REVOKE EXECUTE ON FUNCTION wga_session_private.is_revoked(text),wga_session_private.revoke(text,bigint) FROM wga_runtime;','wga_restore_admin');
  token=independent;check('revocation-store access failure rejects authentication',await auth.getSessionUser()===null);
  const before=writes.length;let denied=false;try{await auth.destroySession();}catch{denied=true;}
  check('failed logout does not clear cookie or claim revocation',denied&&token===independent&&writes.length===before);
  execute('GRANT EXECUTE ON FUNCTION wga_session_private.is_revoked(text),wga_session_private.revoke(text,bigint) TO wga_runtime;','wga_restore_admin');
  await auth.destroySession();token=independent;
  check('retry after restored access revokes copied token',await auth.getSessionUser()===null);
  phase='current account invalidation';
  token=other;execute('UPDATE public."User" SET "passwordHash"=\'SYNTHETIC-CHANGED\' WHERE id=\'wga-revoke-synthetic-b\';','wga_restore_admin');
  check('password change still rejects a valid signed token',await auth.getSessionUser()===null);
  execute('DELETE FROM public."User" WHERE id=\'wga-revoke-synthetic-b\';','wga_restore_admin');
  check('deleted account still rejects a valid signed token',await auth.getSessionUser()===null);
  phase='minimal persistence';
  check('revocation table stores only fingerprints and expiry',execute("SELECT array_agg(column_name ORDER BY ordinal_position)::text FROM information_schema.columns WHERE table_schema='wga_session_private' AND table_name='revoked_tokens';",'wga_restore_admin')==='{fingerprint,expires_at}');
  check('persisted fingerprints are fixed SHA-256 values',execute("SELECT bool_and(fingerprint ~ '^[0-9a-f]{64}$') FROM wga_session_private.revoked_tokens;",'wga_restore_admin')==='t');
  process.stdout.write(JSON.stringify({passed:true,checks,rawTokensRetained:false}));
}catch{
  process.stdout.write(JSON.stringify({passed:false,checks,stoppedAt:phase,rawTokensRetained:false}));process.exitCode=1;
}
