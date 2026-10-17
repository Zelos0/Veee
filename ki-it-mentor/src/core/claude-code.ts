// Claude Code integration (hook-based). Claude Code runs the hook command with the
// event JSON on stdin; we keep only a small, redacted summary and append it to a
// local JSONL inbox. The mentor app reads the inbox; the user decides per event
// whether it becomes context. Nothing is ever sent back to Claude Code.

import { redactText } from './redaction';

export interface HookInput {
  session_id?: string;
  hook_event_name?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  cwd?: string;
  prompt?: string;
}

export interface InboxEvent {
  id: string;
  receivedAt: string;
  event: string;
  tool?: string;
  /** Short display label, e.g. "Edit · src/app.ts". */
  label: string;
  /** Redacted, truncated content usable as mentor context. */
  content: string;
  kind: 'diff' | 'command' | 'file' | 'prompt' | 'other';
  cwd?: string;
}

export const MAX_EVENT_CHARS = 6_000;

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** Redact a bounded prefix only (cost), then cap for storage. */
function safe(text: string): string {
  return cap(redactText(text.slice(0, MAX_EVENT_CHARS + 512)));
}

function cap(text: string): string {
  return text.length > MAX_EVENT_CHARS ? `${text.slice(0, MAX_EVENT_CHARS)}\n… [gekürzt]` : text;
}

function miniDiff(path: string, oldText: string, newText: string): string {
  const minus = oldText.split('\n').map((l) => `-${l}`);
  const plus = newText.split('\n').map((l) => `+${l}`);
  return [`--- a/${path}`, `+++ b/${path}`, '@@ Claude Code Edit @@', ...minus, ...plus].join('\n');
}

export function summarizeHookInput(input: HookInput, now = new Date()): InboxEvent | null {
  const event = str(input.hook_event_name) || 'unknown';
  const tool = str(input.tool_name) || undefined;
  const ti = input.tool_input ?? {};
  const rawPath = str(ti.file_path) || str(ti.notebook_path) || str(ti.path);
  const cwd = str(input.cwd);
  // Show project-relative paths; the full path stays available via `cwd`.
  const filePath = cwd && rawPath.startsWith(`${cwd}/`) ? rawPath.slice(cwd.length + 1) : rawPath;
  const base = { id: `cc_${now.getTime().toString(36)}_${Math.random().toString(36).slice(2, 7)}`, receivedAt: now.toISOString(), event, tool, cwd: input.cwd };

  if (event === 'UserPromptSubmit') {
    const prompt = str(input.prompt);
    if (!prompt) return null;
    return { ...base, kind: 'prompt', label: 'Prompt an Claude Code', content: safe(prompt) };
  }

  switch (tool) {
    case 'Edit':
      return { ...base, kind: 'diff', label: `Edit · ${filePath}`, content: safe(miniDiff(filePath, str(ti.old_string), str(ti.new_string))) };
    case 'MultiEdit': {
      const edits = Array.isArray(ti.edits) ? (ti.edits as Array<Record<string, unknown>>) : [];
      const diff = edits.map((e) => miniDiff(filePath, str(e.old_string), str(e.new_string))).join('\n');
      return { ...base, kind: 'diff', label: `MultiEdit · ${filePath} (${edits.length})`, content: safe(diff) };
    }
    case 'Write':
      return { ...base, kind: 'file', label: `Write · ${filePath}`, content: safe(str(ti.content)) };
    case 'Bash':
      return { ...base, kind: 'command', label: `Bash · ${redactText(str(ti.description) || str(ti.command).slice(0, 60))}`, content: safe(str(ti.command)) };
    case 'Read':
      // Only the path — file content stays with Claude Code.
      return { ...base, kind: 'other', label: `Read · ${filePath}`, content: `Claude Code hat die Datei ${filePath} gelesen.` };
    default:
      return tool ? { ...base, kind: 'other', label: `${tool}`, content: `Werkzeug ${tool} wurde ausgeführt.` } : null;
  }
}

export function parseInbox(jsonl: string): InboxEvent[] {
  const events: InboxEvent[] = [];
  for (const line of jsonl.split('\n')) {
    if (!line.trim()) continue;
    try {
      const value = JSON.parse(line) as InboxEvent;
      if (value && typeof value.id === 'string' && typeof value.label === 'string' && typeof value.content === 'string') events.push(value);
    } catch {
      // Malformed lines are skipped; the inbox is append-only and may be cut mid-write.
    }
  }
  return events;
}

/** Settings snippet the user adds to .claude/settings(.local).json themselves. */
export function hookSettingsSnippet(hookCommand: string): object {
  return {
    hooks: {
      PostToolUse: [{ matcher: 'Edit|MultiEdit|Write|Bash', hooks: [{ type: 'command', command: hookCommand }] }],
    },
  };
}
