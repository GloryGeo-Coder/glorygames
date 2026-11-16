import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../apps/web/package.json', import.meta.url));
const ts = require('typescript');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const base = new URL('../../apps/web/src/', import.meta.url);
const source = name => readFile(new URL(name, base), 'utf8');
const transpile = text => ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const allowed = 'postgresql://wga_runtime:PUBLIC-SYNTHETIC@ep-example-a1-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function load(file, url, extras = {}) {
  const context = vm.createContext({ URL, Response, console, process: { env: { DATABASE_URL: url, NODE_ENV: 'production' } } });
  const cache = new Map();
  async function module(name) {
    if (cache.has(name)) return cache.get(name);
    let result;
    if (name === '@/lib/runtimeDatabaseUrl') {
      result = new vm.SourceTextModule(transpile(await source('lib/runtimeDatabaseUrl.ts')), { context });
      cache.set(name, result); await result.link(() => { throw Error('Unexpected URL policy dependency'); });
    } else {
      const values = extras[name]; assert.ok(values, `Unexpected dependency ${name}`);
      result = new vm.SyntheticModule(Object.keys(values), function () { for (const [key, value] of Object.entries(values)) this.setExport(key, value); }, { context });
      cache.set(name, result);
    }
    return result;
  }
  const entry = new vm.SourceTextModule(transpile(await source(file)), { context });
  await entry.link(module); await entry.evaluate();
  return entry.namespace;
}

for (const rejected of [undefined, 'not a URL', allowed.replace('wga_runtime:', 'neondb_owner:'),
  allowed.replace('wga_runtime:', 'postgres:'), allowed.replace('/neondb?', '/other?'),
  allowed.replace('ep-example-a1-pooler.us-east-1.aws.neon.tech', 'localhost'),
  allowed.replace('ep-example-a1-pooler.us-east-1.aws.neon.tech', 'attacker.invalid')]) {
  test(`owner/malformed/unreviewed URL is rejected before a driver receives it: ${rejected ? new URL(rejected.includes('://') ? rejected : 'https://invalid.test').username || 'invalid' : 'absent'}`, async () => {
    let calls = 0;
    const forbidden = () => { calls++; throw Error('Driver received rejected connection'); };
    const neon = await load('lib/neon.ts', rejected, { '@neondatabase/serverless': { neon: forbidden } });
    assert.equal(neon.hasUsableNeonDatabaseUrl(), false);
    assert.throws(() => neon.getNeonSql(), error => !error.message.includes('PUBLIC-SYNTHETIC') && !error.message.includes('neon.tech'));
    const prisma = await load('lib/prisma.ts', rejected, { '@/generated/prisma/client': { PrismaClient: forbidden }, '@prisma/adapter-pg': { PrismaPg: forbidden } });
    assert.equal(prisma.hasUsableDatabaseUrl(), false);
    assert.throws(() => prisma.getPrisma()); assert.equal(calls, 0);
  });
}

test('both drivers receive the restricted connection unchanged', async () => {
  const neon = await load('lib/neon.ts', allowed, { '@neondatabase/serverless': { neon: value => { assert.equal(value, allowed); return 'restricted-sql'; } } });
  assert.equal(neon.getNeonSql(), 'restricted-sql');
  const prisma = await load('lib/prisma.ts', allowed, {
    '@/generated/prisma/client': { PrismaClient: class { constructor(options) { this.options = options; } } },
    '@prisma/adapter-pg': { PrismaPg: class { constructor(options) { assert.equal(options.connectionString, allowed); } } },
  });
  assert.ok(prisma.getPrisma());
});

for (const action of ['sync-games', 'create-game']) test(`public maintenance ${action} cannot access a request, key, filesystem or database`, async () => {
  const route = await load(`app/api/admin/${action}/route.ts`, allowed, {
    'next/server': { NextResponse: { json: (body, options) => new Response(JSON.stringify(body), options) } },
  });
  const response = await route.POST(new Proxy({}, { get() { throw Error('Request access'); } }));
  assert.equal(response.status, 403); assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal((await response.json()).error, 'MAINTENANCE_PAUSED');
});

test('existing-account login still checks a password and returns no password hash', async () => {
  const password = 'PUBLIC synthetic login fixture';
  const hash = bcrypt.hashSync(password, 4);
  let queryCalls = 0, signed = 0, cookie;
  const route = await load('app/api/auth/login/route.ts', allowed, {
    'next/server': { NextRequest: class {}, NextResponse: { json(body, options) { const response = new Response(JSON.stringify(body), options); response.cookies = { set(...args) { cookie = args; } }; return response; } } },
    bcryptjs: { default: bcrypt }, zod: { z },
    '@/lib/neon': { hasUsableNeonDatabaseUrl: () => true, getNeonSql: () => async (strings, ...values) => {
      queryCalls++; assert.match(strings.join('?'), /SELECT id, email, "displayName", "passwordHash"/);
      assert.equal(values[0], 'synthetic@example.invalid');
      return [{ id: 'synthetic', email: 'synthetic@example.invalid', displayName: 'Synthetic', passwordHash: hash }];
    } },
    '@/lib/auth': { isAuthConfigured: () => true, getSessionCookieName: () => 'test_session', getSessionCookieOptions: () => ({ httpOnly: true }), signSession: user => { signed++; assert.equal(user.passwordHash, undefined); return 'PUBLIC-SYNTHETIC-TOKEN'; } },
  });
  const response = await route.POST({ json: async () => ({ email: 'synthetic@example.invalid', password }) });
  const body = await response.json();
  assert.equal(response.status, 200); assert.equal(body.ok, true);
  assert.equal(body.user.passwordHash, undefined); assert.equal(queryCalls, 1); assert.equal(signed, 1);
  assert.equal(cookie[0], 'test_session');
});
