import { describe, expect, it } from 'vitest';
import { MAX_ITEM_CHARS, buildManifest, buildSystemPrompt, makeContextItem } from '../../src/core/explanation';
import type { ExplainRequest, ProviderInfo } from '../../src/core/types';

const external: ProviderInfo = { id: 'x', label: 'Extern', kind: 'external', model: 'm', configured: true };

function req(overrides: Partial<ExplainRequest> = {}): ExplainRequest {
  return { mode: 'copilot', depth: 'simple', action: 'explain', question: 'Was macht das?', context: [], ...overrides };
}

describe('system prompts', () => {
  it('differ per depth and mode', () => {
    const prompts = new Set(
      (['precise', 'simple', 'simplified'] as const).flatMap((d) => (['learn', 'copilot'] as const).map((m) => buildSystemPrompt(m, d, 'explain'))),
    );
    expect(prompts.size).toBe(6);
    expect(buildSystemPrompt('learn', 'simplified', 'explain')).toMatch(/Analogie/);
    expect(buildSystemPrompt('learn', 'simplified', 'explain')).toMatch(/Was das technisch bedeutet/);
    expect(buildSystemPrompt('copilot', 'precise', 'explain')).toMatch(/TECHNISCH PRÄZISE/);
    expect(buildSystemPrompt('copilot', 'precise', 'risks')).toMatch(/schiefgehen/);
  });

  it('treats context as untrusted data', () => {
    expect(buildSystemPrompt('copilot', 'simple', 'explain')).toMatch(/untrusted data/);
  });
});

describe('buildManifest', () => {
  it('redacts context before it reaches the payload and reports it', () => {
    const ctx = makeContextItem('manual', 'config', 'const key = "sk-ant-api03-SECRETSECRETSECRET";');
    const m = buildManifest(req({ context: [ctx] }), external);
    const content = m.payload.messages[0]!.content;
    expect(content).not.toContain('SECRETSECRET');
    expect(content).toContain('[REDACTED:anthropic-key]');
    expect(m.items[0]!.redactions).toEqual([{ kind: 'anthropic-key', count: 1 }]);
    expect(m.redactionTotal).toBe(1);
    expect(m.providerKind).toBe('external');
  });

  it('labels every context source and truncates oversized items', () => {
    const big = makeContextItem('file', 'big.log', 'x'.repeat(MAX_ITEM_CHARS + 500));
    const diff = makeContextItem('diff', 'fix', '+a\n-b');
    const m = buildManifest(req({ context: [big, diff] }), external);
    const content = m.payload.messages[0]!.content;
    expect(content).toContain('quelle="Datei" label="big.log"');
    expect(content).toContain('quelle="Diff" label="fix"');
    expect(content).toContain('[gekürzt: 500 Zeichen nicht gesendet]');
    expect(m.estimatedTokens).toBe(Math.ceil(m.totalChars / 4));
  });

  it('escapes labels so a filename cannot break the context envelope', () => {
    const m = buildManifest(req({ context: [makeContextItem('file', 'a"><x>', 'y')] }), external);
    expect(m.payload.messages[0]!.content).toContain('label="a&quot;&gt;&lt;x&gt;"');
  });

  it('says when no context is attached', () => {
    expect(buildManifest(req(), external).payload.messages[0]!.content).toMatch(/Kein Kontext angehängt/);
  });
});
