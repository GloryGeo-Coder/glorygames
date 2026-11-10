import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

for (const endpoint of ['login', 'signup']) {
  for (const kind of ['Error', 'non-Error']) {
    test(`${endpoint} does not disclose database failure details (${kind})`, async () => {
      const sensitive = 'postgresql://test_user:synthetic_private_password@database.example.test/private_table';
      const thrown = kind === 'Error' ? new Error(sensitive) : { message: sensitive };
      const logs = [];
      const source = await readFile(new URL(`../apps/web/src/app/api/auth/${endpoint}/route.ts`, import.meta.url), 'utf8');
      const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
      const chain = { email() { return this; }, min() { return this; }, max() { return this; }, optional() { return this; } };
      const dependencies = {
        'next/server': { NextResponse: { json: (body, options = {}) => ({ body, status: options.status ?? 200 }) } },
        bcryptjs: { default: { hash: async () => 'synthetic-hash' } },
        zod: { z: { string: () => chain, object: () => ({ safeParse: () => ({ success: true, data: { email: 'qa@example.test', password: 'synthetic-test-password' } }) }) } },
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
