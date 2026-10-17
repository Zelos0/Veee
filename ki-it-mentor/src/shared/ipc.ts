// Typed contract between renderer and main. The renderer has no Node access;
// everything privileged (keys, files, network) goes through this API.

import type { InboxEvent } from '../core/claude-code';
import type { MentorState } from '../core/knowledge';
import type { ProviderErrorCode } from '../core/providers/provider';
import type { ExplainRequest, ProviderInfo, SendManifest } from '../core/types';

export type RunResult =
  | { ok: true; text: string; model: string; servedBy?: string; providerId: string; usage?: { inputTokens: number; outputTokens: number } }
  | { ok: false; code: ProviderErrorCode; message: string; retryAfterSec?: number };

export interface AppInfo {
  dataLocation: string;
  inboxFile: string;
  hookCommand: string;
  platform: string;
  versions: { electron: string; app: string };
}

export interface MentorApi {
  getState(): Promise<MentorState>;
  saveState(state: MentorState): Promise<void>;
  wipeAll(): Promise<MentorState>;
  listProviders(): Promise<ProviderInfo[]>;
  preview(providerId: string, request: ExplainRequest): Promise<SendManifest>;
  run(runId: string, providerId: string, request: ExplainRequest): Promise<RunResult>;
  cancel(runId: string): Promise<void>;
  openFile(): Promise<{ label: string; content: string; truncated: boolean } | null>;
  exportNotes(format: 'json' | 'md'): Promise<{ saved: boolean; path?: string }>;
  setAlwaysOnTop(value: boolean): Promise<boolean>;
  nudgeWindow(dx: number, dy: number): Promise<void>;
  nextDisplay(): Promise<{ index: number; count: number }>;
  hideWindow(): Promise<void>;
  listInbox(): Promise<InboxEvent[]>;
  clearInbox(): Promise<void>;
  onInboxChanged(listener: () => void): () => void;
  appInfo(): Promise<AppInfo>;
}

declare global {
  interface Window {
    mentor: MentorApi;
  }
}
