// Anthropic Claude adapter (runs only in the Electron main process; the API key
// never reaches the renderer). Uses the official SDK.

import Anthropic from '@anthropic-ai/sdk';
import type { ProviderInfo, ProviderRequest, ProviderResponse } from '../types';
import { ProviderError, type Provider } from './provider';

export const DEFAULT_ANTHROPIC_MODEL = 'claude-opus-5-5';

export type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

export interface AnthropicOptions {
  apiKey?: string;
  model?: string;
  effort?: Effort;
  /** Injected in tests. */
  client?: Pick<Anthropic, 'beta'>;
}

export class AnthropicProvider implements Provider {
  private readonly model: string;
  private readonly effort: Effort;
  private readonly client: Pick<Anthropic, 'beta'> | null;

  constructor(options: AnthropicOptions) {
    this.model = options.model || DEFAULT_ANTHROPIC_MODEL;
    this.effort = options.effort ?? 'medium';
    // maxRetries 1: the SDK retries 429/5xx/network once; the UI owns further retries.
    this.client = options.client ?? (options.apiKey ? new Anthropic({ apiKey: options.apiKey, maxRetries: 1 }) : null);
  }

  info(): ProviderInfo {
    return {
      id: 'anthropic',
      label: 'Anthropic Claude',
      kind: 'external',
      model: this.model,
      configured: this.client !== null,
      unavailableReason: this.client ? undefined : 'Kein API-Schlüssel. Setze ANTHROPIC_API_KEY vor dem Start (siehe README).',
    };
  }

  async complete(request: ProviderRequest, signal: AbortSignal): Promise<ProviderResponse> {
    if (!this.client) throw new ProviderError('not_configured', 'ANTHROPIC_API_KEY fehlt');
    try {
      // `meta` is local-only and deliberately not forwarded.
      const response = await this.client.beta.messages.create(
        {
          model: this.model,
          max_tokens: request.maxTokens,
          system: request.system,
          messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
          output_config: { effort: this.effort },
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
        },
        { signal },
      );

      if (response.stop_reason === 'refusal') {
        throw new ProviderError('refusal', response.stop_details?.category ?? 'refusal');
      }
      const text = response.content
        .flatMap((block) => (block.type === 'text' ? [block.text] : []))
        .join('\n')
        .trim();
      const fallbackRan = (response.usage.iterations ?? []).some((entry) => entry.type === 'fallback_message');
      return {
        text: text || '(Leere Antwort)',
        model: this.model,
        servedBy: fallbackRan ? response.model : undefined,
        usage: { inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens },
      };
    } catch (error) {
      throw mapAnthropicError(error);
    }
  }
}

export function mapAnthropicError(error: unknown): ProviderError {
  if (error instanceof ProviderError) return error;
  // Most specific first; APIConnectionError and APIUserAbortError extend APIError in the TS SDK.
  if (error instanceof Anthropic.APIUserAbortError) return new ProviderError('cancelled', 'Abgebrochen');
  if (error instanceof Anthropic.APIConnectionTimeoutError) return new ProviderError('timeout', 'Zeitüberschreitung');
  if (error instanceof Anthropic.APIConnectionError) return new ProviderError('network', 'Keine Verbindung');
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    return new ProviderError('auth', 'Authentifizierung fehlgeschlagen');
  }
  if (error instanceof Anthropic.RateLimitError) {
    const retryAfter = Number(error.headers?.get?.('retry-after'));
    return new ProviderError('rate_limit', 'Ratenlimit', Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined);
  }
  if (error instanceof Anthropic.BadRequestError || error instanceof Anthropic.NotFoundError) {
    return new ProviderError('bad_request', error.message);
  }
  if (error instanceof Anthropic.InternalServerError) return new ProviderError('overloaded', 'Serverfehler/Überlastung');
  if (error instanceof Anthropic.APIError) {
    return error.status === 529 ? new ProviderError('overloaded', 'Überlastet') : new ProviderError('unknown', error.message);
  }
  return new ProviderError('unknown', error instanceof Error ? error.message : String(error));
}
