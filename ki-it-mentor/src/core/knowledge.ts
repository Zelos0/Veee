// Knowledge Store: Lernnotizen, Lernfortschritt und Einstellungen als ein
// versioniertes JSON-Dokument. Reine Funktionen + ein austauschbares Backend.

import { initialProgress, type TopicProgress } from './learning';
import { newId } from './explanation';
import type { Depth, Mode } from './types';

export interface Note {
  id: string;
  title: string;
  body: string;
  topicId?: string;
  /** Which context sources the note was derived from (labels only, no content). */
  sources: string[];
  /** Identifies the answer a note was saved from, so the UI can show "saved" truthfully. */
  answerKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  providerId: string;
  mode: Mode;
  depth: Depth;
  alwaysOnTop: boolean;
  /** Ask before every external send. Cannot be disabled for external providers in the MVP. */
  confirmExternalSend: true;
  reducedMotion: 'system' | 'reduce';
  theme: 'system' | 'light' | 'dark';
  claudeCodeInbox: boolean;
}

export interface MentorState {
  version: 1;
  notes: Note[];
  progress: Record<string, TopicProgress>;
  settings: Settings;
}

export const DEFAULT_SETTINGS: Settings = {
  providerId: 'demo',
  mode: 'copilot',
  depth: 'simple',
  alwaysOnTop: false,
  confirmExternalSend: true,
  reducedMotion: 'system',
  theme: 'system',
  claudeCodeInbox: false,
};

export function emptyState(): MentorState {
  return { version: 1, notes: [], progress: {}, settings: { ...DEFAULT_SETTINGS } };
}

/** Accepts unknown JSON (e.g. a corrupted file) and returns a valid state. */
export function parseState(raw: unknown): MentorState {
  const base = emptyState();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<MentorState>;
  const notes = Array.isArray(r.notes)
    ? r.notes.filter((n): n is Note => Boolean(n && typeof n.id === 'string' && typeof n.body === 'string'))
    : [];
  const progress: Record<string, TopicProgress> = {};
  if (r.progress && typeof r.progress === 'object') {
    for (const [k, v] of Object.entries(r.progress)) {
      if (v && typeof v === 'object' && typeof (v as TopicProgress).status === 'string') progress[k] = v as TopicProgress;
    }
  }
  return {
    version: 1,
    notes,
    progress,
    settings: { ...base.settings, ...(r.settings ?? {}), confirmExternalSend: true },
  };
}

export function addNote(state: MentorState, input: { title: string; body: string; topicId?: string; sources?: string[]; answerKey?: string }): MentorState {
  const now = new Date().toISOString();
  const note: Note = {
    id: newId('note'),
    title: input.title.trim() || 'Ohne Titel',
    body: input.body,
    topicId: input.topicId,
    sources: input.sources ?? [],
    answerKey: input.answerKey,
    createdAt: now,
    updatedAt: now,
  };
  return { ...state, notes: [note, ...state.notes] };
}

export function deleteNote(state: MentorState, noteId: string): MentorState {
  return { ...state, notes: state.notes.filter((n) => n.id !== noteId) };
}

export function deleteAllNotes(state: MentorState): MentorState {
  return { ...state, notes: [] };
}

export function resetProgress(state: MentorState): MentorState {
  return { ...state, progress: {} };
}

export function getProgress(state: MentorState, topicId: string): TopicProgress {
  return state.progress[topicId] ?? initialProgress(topicId);
}

export function setProgress(state: MentorState, progress: TopicProgress): MentorState {
  return { ...state, progress: { ...state.progress, [progress.topicId]: progress } };
}

export function exportJson(state: MentorState): string {
  return JSON.stringify({ exportedAt: new Date().toISOString(), notes: state.notes, progress: state.progress }, null, 2);
}

export function exportMarkdown(state: MentorState): string {
  const lines = ['# KI-IT-Mentor — Lernnotizen', '', `Exportiert: ${new Date().toISOString()}`, ''];
  for (const note of state.notes) {
    lines.push(`## ${note.title}`, '', `_${note.createdAt}${note.topicId ? ` · Thema: ${note.topicId}` : ''}${note.sources.length ? ` · Quellen: ${note.sources.join(', ')}` : ''}_`, '', note.body, '');
  }
  if (!state.notes.length) lines.push('_Keine Notizen._');
  return lines.join('\n');
}

export interface StateBackend {
  load(): Promise<unknown>;
  save(state: MentorState): Promise<void>;
  wipe(): Promise<void>;
  location(): string;
}

export class MemoryBackend implements StateBackend {
  private data: unknown = null;
  async load() {
    return this.data;
  }
  async save(state: MentorState) {
    this.data = JSON.parse(JSON.stringify(state));
  }
  async wipe() {
    this.data = null;
  }
  location() {
    return 'Arbeitsspeicher (nicht persistent)';
  }
}
