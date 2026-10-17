// Shared domain types. Pure data — no Electron, no DOM, no provider SDKs.

export type Mode = 'learn' | 'copilot';

/** precise = technisch präzise, simple = einfach, simplified = mehrfach vereinfacht + Analogie */
export type Depth = 'precise' | 'simple' | 'simplified';

export type ContextSource = 'manual' | 'file' | 'diff' | 'claude-code' | 'screen';

export type ActionKind =
  | 'explain'
  | 'example'
  | 'line-by-line'
  | 'why'
  | 'alternatives'
  | 'risks'
  | 'quiz';

export interface ContextItem {
  id: string;
  source: ContextSource;
  /** Human-readable origin, e.g. a file path or "Claude Code · Edit src/a.ts". */
  label: string;
  content: string;
  addedAt: string;
}

export interface ExplainRequest {
  mode: Mode;
  depth: Depth;
  action: ActionKind;
  question: string;
  context: ContextItem[];
}

export type ProviderKind = 'local' | 'external';

export interface ProviderInfo {
  id: string;
  label: string;
  kind: ProviderKind;
  model: string;
  configured: boolean;
  /** Why the provider is not usable, shown verbatim in the UI. */
  unavailableReason?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProviderRequest {
  system: string;
  messages: ChatMessage[];
  maxTokens: number;
  /** Local-only hints (never serialised to external providers). */
  meta?: { mode: Mode; depth: Depth; action: ActionKind };
}

export interface ProviderResponse {
  text: string;
  model: string;
  /** Set when a server-side fallback model answered instead of the requested one. */
  servedBy?: string;
  usage?: { inputTokens: number; outputTokens: number };
}

export interface RedactionFinding {
  kind: string;
  count: number;
}

/** Exactly what would leave the machine for one request — the "Versand-Manifest". */
export interface SendManifest {
  providerId: string;
  providerLabel: string;
  providerKind: ProviderKind;
  model: string;
  items: Array<{
    id: string;
    source: ContextSource;
    label: string;
    chars: number;
    redactions: RedactionFinding[];
  }>;
  questionChars: number;
  totalChars: number;
  /** Rough estimate (chars / 4); labelled as estimate in the UI. */
  estimatedTokens: number;
  redactionTotal: number;
  /** The fully redacted payload, viewable before sending. */
  payload: ProviderRequest;
}

export interface Explanation {
  id: string;
  request: Omit<ExplainRequest, 'context'> & { contextLabels: string[] };
  text: string;
  providerId: string;
  model: string;
  servedBy?: string;
  createdAt: string;
}
