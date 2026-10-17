import { describe, expect, it } from 'vitest';
import { ProviderError, completeWithTimeout, describeError, type Provider } from '../../src/core/providers/provider';
import type { ProviderRequest } from '../../src/core/types';

const request: ProviderRequest = { system: 's', messages: [{ role: 'user', content: 'u' }], maxTokens: 10 };

function slow(ms: number): Provider {
  return {
    info: () => ({ id: 'slow', label: 'slow', kind: 'local', model: 'm', configured: true }),
    complete: (_r, signal) =>
      new Promise((resolve, reject) => {
        const t = setTimeout(() => resolve({ text: 'ok', model: 'm' }), ms);
        signal.addEventListener('abort', () => {
          clearTimeout(t);
          reject(new Error('aborted'));
        });
      }),
  };
}

describe('completeWithTimeout', () => {
  it('returns the provider result', async () => {
    await expect(completeWithTimeout(slow(5), request, { timeoutMs: 1000 })).resolves.toMatchObject({ text: 'ok' });
  });

  it('times out with a typed error', async () => {
    await expect(completeWithTimeout(slow(500), request, { timeoutMs: 20 })).rejects.toMatchObject({ code: 'timeout' });
  });

  it('cancels via external signal', async () => {
    const c = new AbortController();
    const p = completeWithTimeout(slow(500), request, { timeoutMs: 5000, signal: c.signal });
    c.abort();
    await expect(p).rejects.toMatchObject({ code: 'cancelled' });
  });

  it('describes errors in German without leaking request content', () => {
    expect(describeError(new ProviderError('rate_limit', 'x', 30))).toMatch(/30 s/);
    expect(describeError(new ProviderError('network', 'x'))).toMatch(/Demo-Anbieter/);
  });
});
