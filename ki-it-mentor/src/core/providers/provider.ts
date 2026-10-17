// Provider-neutral model interface. UI and learning logic only see this file.

import type { ProviderInfo, ProviderRequest, ProviderResponse } from '../types';

export type ProviderErrorCode =
  | 'not_configured'
  | 'auth'
  | 'rate_limit'
  | 'overloaded'
  | 'network'
  | 'timeout'
  | 'cancelled'
  | 'refusal'
  | 'bad_request'
  | 'unknown';

export class ProviderError extends Error {
  constructor(
    readonly code: ProviderErrorCode,
    message: string,
    readonly retryAfterSec?: number,
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export interface Provider {
  info(): ProviderInfo;
  complete(request: ProviderRequest, signal: AbortSignal): Promise<ProviderResponse>;
}

/** User-facing German message per error class; never includes request content. */
export function describeError(error: ProviderError): string {
  switch (error.code) {
    case 'not_configured':
      return `Anbieter nicht eingerichtet: ${error.message}`;
    case 'auth':
      return 'Anmeldung beim Anbieter fehlgeschlagen. Prüfe den API-Schlüssel (er wird nie angezeigt oder geloggt).';
    case 'rate_limit':
      return error.retryAfterSec
        ? `Ratenlimit erreicht. Neuer Versuch frühestens in ${error.retryAfterSec} s möglich.`
        : 'Ratenlimit erreicht. Bitte kurz warten und erneut senden.';
    case 'overloaded':
      return 'Der Anbieter ist gerade überlastet. Später erneut versuchen oder den lokalen Demo-Anbieter nutzen.';
    case 'network':
      return 'Keine Verbindung zum Anbieter (offline?). Der lokale Demo-Anbieter funktioniert ohne Netz.';
    case 'timeout':
      return 'Zeitüberschreitung — die Anfrage wurde abgebrochen. Kontext verkleinern oder erneut senden.';
    case 'cancelled':
      return 'Abgebrochen.';
    case 'refusal':
      return 'Der Anbieter hat diese Anfrage abgelehnt. Formuliere die Frage um oder entferne Kontext.';
    case 'bad_request':
      return `Anfrage ungültig: ${error.message}`;
    default:
      return `Unerwarteter Fehler: ${error.message}`;
  }
}

export function toProviderError(error: unknown): ProviderError {
  if (error instanceof ProviderError) return error;
  if (error instanceof Error && error.name === 'AbortError') return new ProviderError('cancelled', 'Abgebrochen');
  return new ProviderError('unknown', error instanceof Error ? error.message : String(error));
}

/**
 * Runs a provider call with timeout and external cancellation. The provider gets a
 * single signal that fires on either; the resulting error says which one happened.
 */
export async function completeWithTimeout(
  provider: Provider,
  request: ProviderRequest,
  options: { timeoutMs: number; signal?: AbortSignal },
): Promise<ProviderResponse> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs);
  const onAbort = () => controller.abort();
  options.signal?.addEventListener('abort', onAbort, { once: true });
  if (options.signal?.aborted) controller.abort();

  try {
    const abortPromise = new Promise<never>((_, reject) => {
      controller.signal.addEventListener(
        'abort',
        () =>
          reject(
            timedOut
              ? new ProviderError('timeout', `Keine Antwort nach ${Math.round(options.timeoutMs / 1000)} s`)
              : new ProviderError('cancelled', 'Abgebrochen'),
          ),
        { once: true },
      );
    });
    return await Promise.race([provider.complete(request, controller.signal), abortPromise]);
  } catch (error) {
    if (timedOut) throw new ProviderError('timeout', `Keine Antwort nach ${Math.round(options.timeoutMs / 1000)} s`);
    if (controller.signal.aborted) throw new ProviderError('cancelled', 'Abgebrochen');
    throw toProviderError(error);
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', onAbort);
  }
}
