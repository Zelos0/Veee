import { describe, expect, it } from 'vitest';
import { buildManifest, makeContextItem } from '../../src/core/explanation';
import { DemoProvider, analyzeCode } from '../../src/core/providers/demo';
import type { Depth, ExplainRequest } from '../../src/core/types';

const code = `import fs from 'fs';
async function loadUsers(path) {
  try {
    const raw = await fs.promises.readFile(path, 'utf8');
    return JSON.parse(raw).filter((u) => u.active);
  } catch (e) {
    return [];
  }
}`;

describe('analyzeCode', () => {
  it('finds functions and constructs', () => {
    const f = analyzeCode(code);
    expect(f.functions).toContain('loadUsers');
    expect(f.constructs).toEqual(expect.arrayContaining(['asynchroner Code (async/await/Promise)', 'Fehlerbehandlung (try/catch)']));
    expect(f.imports).toBe(1);
  });

  it('recognises diffs', () => {
    const f = analyzeCode('diff --git a/x b/x\n--- a/x\n+++ b/x\n@@ -1 +1 @@\n-old\n+new\n+more');
    expect(f.isDiff).toBe(true);
    expect(f.added).toBe(2);
    expect(f.removed).toBe(1);
  });
});

describe('DemoProvider', () => {
  const provider = new DemoProvider(0);
  const run = async (depth: Depth, mode: ExplainRequest['mode'] = 'copilot') => {
    const req: ExplainRequest = { mode, depth, action: 'explain', question: '', context: [makeContextItem('manual', 'code', code)] };
    return (await provider.complete(buildManifest(req, provider.info()).payload, new AbortController().signal)).text;
  };

  it('produces three distinct depths', async () => {
    const [p, s, x] = await Promise.all([run('precise'), run('simple'), run('simplified')]);
    expect(new Set([p, s, x]).size).toBe(3);
    expect(x).toMatch(/## Analogie/);
    expect(x).toMatch(/## Was das technisch bedeutet/);
    expect(s).toMatch(/Einfach gesagt/);
    expect(p).toMatch(/## Schlussfolgerung/);
  });

  it('always discloses that it is not an AI', async () => {
    expect(await run('simple')).toMatch(/lokale Demo-Anbieter/);
  });

  it('adds a self-check question in learning mode only', async () => {
    expect(await run('simple', 'learn')).toMatch(/Prüfe dich selbst/);
    expect(await run('simple', 'copilot')).not.toMatch(/Prüfe dich selbst/);
  });
});
