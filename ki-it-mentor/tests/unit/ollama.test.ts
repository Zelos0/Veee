import { describe, expect, it, vi } from 'vitest';
import { OllamaProvider } from '../../src/core/providers/ollama';

const request = { system: 's', messages: [{ role: 'user' as const, content: 'u' }], maxTokens: 9000, meta: { mode: 'learn' as const, depth: 'simple' as const, action: 'explain' as const } };

describe('OllamaProvider', () => {
  it('is unconfigured without a model', () => {
    expect(new OllamaProvider().info().configured).toBe(false);
  });

  it('posts system + messages to /api/chat and parses the reply', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: { content: ' Hallo ' }, prompt_eval_count: 3, eval_count: 4 })));
    const p = new OllamaProvider({ model: 'qwen', baseUrl: 'http://h:1/', fetchImpl });
    const res = await p.complete(request, new AbortController().signal);
    expect(res).toMatchObject({ text: 'Hallo', usage: { inputTokens: 3, outputTokens: 4 } });
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('http://h:1/api/chat');
    const body = JSON.parse(init.body);
    expect(body.messages[0]).toEqual({ role: 'system', content: 's' });
    expect(body.options.num_predict).toBe(4096);
    expect(init.body).not.toContain('meta');
  });

  it('maps connection failure and missing model', async () => {
    const down = new OllamaProvider({ model: 'qwen', fetchImpl: vi.fn().mockRejectedValue(new TypeError('fetch failed')) });
    await expect(down.complete(request, new AbortController().signal)).rejects.toMatchObject({ code: 'network' });
    const missing = new OllamaProvider({ model: 'qwen', fetchImpl: vi.fn().mockResolvedValue(new Response('{}', { status: 404 })) });
    await expect(missing.complete(request, new AbortController().signal)).rejects.toMatchObject({ code: 'bad_request' });
  });
});
