import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const { z } = createRequire(new URL('../../apps/web/package.json', import.meta.url))('zod');
const ts = createRequire(new URL('../../apps/web/package.json', import.meta.url))('typescript');
import { createStandaloneScoreBridge } from '../../apps/web/public/games/_shared/game-tab-score.mjs';

const policySource = await readFile(new URL('../../apps/web/src/lib/launchPolicy.ts', import.meta.url), 'utf8');
const transpile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
for (const [route, method] of [
  ['auth/signup', 'POST'], ['chat', 'POST'], ['chat/report', 'POST'],
  ['games/[slug]/score', 'POST'], ['daily-challenge/submit', 'POST'],
  ['games/[slug]/review', 'POST'], ['games/[slug]/session/start', 'POST'],
  ['games/[slug]/session/end', 'POST'], ['chat', 'GET'], ['daily-challenge', 'GET'],
]) {
  test(`${method} ${route} stops before body, identity, database or parameter access`, async () => {
    const forbidden = () => { throw Error('Launch hold allowed an application side effect'); };
    const context = vm.createContext({ console, Response });
    const dependencies = {
      'next/server': { NextResponse: { json: (body, options = {}) => new Response(JSON.stringify(body), { status: options.status ?? 200, headers: options.headers }) } },
      zod: { z }, bcryptjs: { default: { hash: forbidden } },
      '@/lib/neon': { createId: forbidden, getNeonSql: forbidden, hasUsableNeonDatabaseUrl: forbidden },
      '@/lib/prisma': { prisma: new Proxy({}, { get: forbidden }) },
      '@/lib/auth': Object.fromEntries(['getSessionUser', 'getSessionCookieName', 'getSessionCookieOptions', 'isAuthConfigured', 'signSession'].map(name => [name, forbidden])),
      '@/lib/gamesDb': { isPublicGameSlug: forbidden },
    };
    const policy = new vm.SourceTextModule(transpile(policySource), { context });
    await policy.link(forbidden); await policy.evaluate();
    const source = await readFile(new URL(`../../apps/web/src/app/api/${route}/route.ts`, import.meta.url), 'utf8');
    const module = new vm.SourceTextModule(transpile(source), { context });
    await module.link(name => {
      if (name === '@/lib/launchPolicy') return policy;
      const values = dependencies[name]; assert.ok(values, `Unreviewed route dependency ${name}`);
      return new vm.SyntheticModule(Object.keys(values), function () { for (const [key, value] of Object.entries(values)) this.setExport(key, value); }, { context });
    });
    await module.evaluate();
    const request = new Proxy({}, { get: forbidden });
    const response = await module.namespace[method](request, new Proxy({}, { get: forbidden }));
    assert.equal(response.status, method === 'POST' ? 403 : 200);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    const body = await response.json();
    if (method === 'POST') assert.equal(body.ok, false);
    else assert.equal(body.status, 'paused');
  });
}

test('standalone game scores remain local without any identity or score HTTP request', async () => {
  const local = []; let requests = 0;
  const bridge = createStandaloneScoreBridge({ slug: 'recycle-rush', origin: 'https://example.test',
    fetcher: async () => { requests++; throw Error('Unexpected HTTP'); }, onScore: score => local.push(score) });
  await bridge.connect();
  assert.equal(bridge.report({ type: 'GG_SCORE', gameSlug: 'recycle-rush', score: 100, final: true }), true);
  await bridge.flush(); bridge.dispose();
  assert.deepEqual(local, [100]); assert.equal(requests, 0);
});
