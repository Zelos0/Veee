// Optionaler lokaler Anbieter über einen laufenden Ollama-Server (HTTP /api/chat).
// Daten verlassen den Rechner nicht, Qualität hängt stark vom Modell und der Hardware ab.

import type { ProviderInfo, ProviderRequest, ProviderResponse } from '../types';
import { ProviderError, type Provider } from './provider';

export interface OllamaOptions {
  baseUrl?: string;
  model?: string;
  fetchImpl?: typeof fetch;
}

export class OllamaProvider implements Provider {
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: OllamaOptions = {}) {
    this.baseUrl = (options.baseUrl || 'http://127.0.0.1:11434').replace(/\/$/, '');
    this.model = options.model || '';
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  info(): ProviderInfo {
    return {
      id: 'ollama',
      label: 'Lokales Modell (Ollama)',
      kind: 'local',
      model: this.model || '—',
      configured: Boolean(this.model),
      unavailableReason: this.model ? undefined : 'Kein Modell gesetzt. Setze KI_MENTOR_OLLAMA_MODEL (z. B. „qwen2.5-coder“) und starte Ollama.',
    };
  }

  async complete(request: ProviderRequest, signal: AbortSignal): Promise<ProviderResponse> {
    if (!this.model) throw new ProviderError('not_configured', 'KI_MENTOR_OLLAMA_MODEL fehlt');
    let res: Response;
    try {
      res = await this.fetchImpl(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          stream: false,
          messages: [{ role: 'system', content: request.system }, ...request.messages],
          options: { num_predict: Math.min(request.maxTokens, 4096) },
        }),
        signal,
      });
    } catch (error) {
      if (signal.aborted) throw new ProviderError('cancelled', 'Abgebrochen');
      throw new ProviderError('network', `Ollama nicht erreichbar unter ${this.baseUrl}: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (res.status === 404) throw new ProviderError('bad_request', `Modell „${this.model}“ nicht installiert (ollama pull ${this.model})`);
    if (!res.ok) throw new ProviderError(res.status >= 500 ? 'overloaded' : 'bad_request', `Ollama HTTP ${res.status}`);
    const data = (await res.json()) as { message?: { content?: string }; prompt_eval_count?: number; eval_count?: number };
    return {
      text: data.message?.content?.trim() || '(Leere Antwort)',
      model: this.model,
      usage:
        data.prompt_eval_count !== undefined
          ? { inputTokens: data.prompt_eval_count, outputTokens: data.eval_count ?? 0 }
          : undefined,
    };
  }
}
