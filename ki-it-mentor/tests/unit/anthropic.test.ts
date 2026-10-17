import Anthropic from '@anthropic-ai/sdk';
import { describe, expect, it, vi } from 'vitest';
import { AnthropicProvider, DEFAULT_ANTHROPIC_MODEL, mapAnthropicError } from '../../src/core/providers/anthropic';
import type { ProviderRequest } from '../../src/core/types';

const request: ProviderRequest = {
  system: 'sys',
  messages: [{ role: 'user', content: 'hallo' }],
  maxTokens: 1000,
  meta: { mode: 'learn', depth: 'simple', action: 'explain' },
};

function fakeClient(response: unknown) {
  const create = vi.fn().mockResolvedValue(response);
  return { create, client: { beta: { messages: { create } } } as unknown as Pick<Anthropic, 'beta'> };
}

const ok = {
  model: DEFAULT_ANTHROPIC_MODEL,
  stop_reason: 'end_turn',
  stop_details: null,
  content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: 'Antwort' }],
  usage: { input_tokens: 10, output_tokens: 5, iterations: [] },
};

describe('AnthropicProvider', () => {
  it('reports not configured without key', () => {
    const info = new AnthropicProvider({}).info();
    expect(info.configured).toBe(false);
    expect(info.kind).toBe('external');
    expect(info.unavailableReason).toMatch(/ANTHROPIC_API_KEY/);
  });

  it('sends system + messages, never the local meta, with fallbacks enabled', async () => {
    const { create, client } = fakeClient(ok);
    const res = await new AnthropicProvider({ client }).complete(request, new AbortController().signal);
    expect(res.text).toBe('Antwort');
    const [body, opts] = create.mock.calls[0]!;
    expect(body).toMatchObject({ model: 'claude-opus-5-5', system: 'sys', max_tokens: 1000, fallbacks: 'default', betas: ['server-side-fallback-2026-07-01'], output_config: { effort: 'medium' } });
    expect(JSON.stringify(body)).not.toContain('meta');
    expect(body.thinking).toBeUndefined();
    expect(opts.signal).toBeInstanceOf(AbortSignal);
  });

  it('flags a refusal as typed error', async () => {
    const { client } = fakeClient({ ...ok, stop_reason: 'refusal', stop_details: { type: 'refusal', category: 'cyber' } });
    await expect(new AnthropicProvider({ client }).complete(request, new AbortController().signal)).rejects.toMatchObject({ code: 'refusal' });
  });

  it('reports a server-side fallback model', async () => {
    const { client } = fakeClient({ ...ok, model: 'claude-opus-4-8', usage: { ...ok.usage, iterations: [{ type: 'fallback_message' }] } });
    const res = await new AnthropicProvider({ client }).complete(request, new AbortController().signal);
    expect(res.servedBy).toBe('claude-opus-4-8');
  });
});

describe('mapAnthropicError', () => {
  const headers = new Headers({ 'retry-after': '12' });
  it.each([
    [new Anthropic.AuthenticationError(401, {}, 'no', headers), 'auth'],
    [new Anthropic.RateLimitError(429, {}, 'slow', headers), 'rate_limit'],
    [new Anthropic.BadRequestError(400, {}, 'bad', headers), 'bad_request'],
    [new Anthropic.InternalServerError(500, {}, 'boom', headers), 'overloaded'],
    [new Anthropic.APIConnectionError({ message: 'down' }), 'network'],
    [new Anthropic.APIUserAbortError(), 'cancelled'],
  ])('%s → %s', (error, code) => {
    expect(mapAnthropicError(error).code).toBe(code);
  });

  it('keeps retry-after for rate limits', () => {
    expect(mapAnthropicError(new Anthropic.RateLimitError(429, {}, 'slow', headers)).retryAfterSec).toBe(12);
  });
});
