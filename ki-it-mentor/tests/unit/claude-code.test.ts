import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseInbox, summarizeHookInput } from '../../src/core/claude-code';
import { appendEvent, installInto, uninstallFrom } from '../../src/integrations/claude-code-hook';
import { inboxFile } from '../../src/integrations/inbox-path';

describe('summarizeHookInput', () => {
  it('turns an Edit into a redacted mini diff', () => {
    const ev = summarizeHookInput({
      hook_event_name: 'PostToolUse',
      tool_name: 'Edit',
      tool_input: { file_path: 'src/a.ts', old_string: 'const k = 1;', new_string: 'const k = "sk-ant-api03-ABCDEFGHIJKLMNOP";' },
    })!;
    expect(ev.kind).toBe('diff');
    expect(ev.label).toBe('Edit · src/a.ts');
    expect(ev.content).toContain('-const k = 1;');
    expect(ev.content).toContain('[REDACTED:anthropic-key]');
    expect(ev.content).not.toContain('ABCDEFGHIJKLMNOP');
  });

  it('keeps only the path for Read and redacts Bash commands', () => {
    expect(summarizeHookInput({ hook_event_name: 'PostToolUse', tool_name: 'Read', tool_input: { file_path: '/x/.env' } })!.content).not.toMatch(/=/);
    const bash = summarizeHookInput({ hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: 'curl -H "Authorization: Bearer abcdefghijklmnopqrstu12345" x' } })!;
    expect(bash.content).toContain('[REDACTED:token]');
  });

  it('shows paths relative to the project directory', () => {
    const ev = summarizeHookInput({ hook_event_name: 'PostToolUse', tool_name: 'Write', cwd: '/w/p', tool_input: { file_path: '/w/p/src/x.ts', content: '' } })!;
    expect(ev.label).toBe('Write · src/x.ts');
  });

  it('ignores events without a tool', () => {
    expect(summarizeHookInput({ hook_event_name: 'Stop' })).toBeNull();
  });
});

describe('hook CLI', () => {
  it('appends to the inbox and skips malformed input', () => {
    const env = { KI_MENTOR_INBOX: mkdtempSync(join(tmpdir(), 'inbox-')) };
    expect(appendEvent('not json', env)).toBe(false);
    expect(appendEvent(JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: 'b.md', content: 'hi' } }), env)).toBe(true);
    const file = inboxFile(env);
    writeFileSync(file, `${readFileSync(file, 'utf8')}{broken\n`);
    const events = parseInbox(readFileSync(file, 'utf8'));
    expect(events).toHaveLength(1);
    expect(events[0]!.label).toBe('Write · b.md');
  });

  it('installs into and removes from a settings file without touching other hooks', () => {
    const dir = mkdtempSync(join(tmpdir(), 'settings-'));
    const path = join(dir, '.claude', 'settings.local.json');
    installInto(path, 'node /opt/other-hook.js');
    // Simulate an unrelated existing hook plus ours.
    const other = JSON.parse(readFileSync(path, 'utf8'));
    installInto(path, 'node "/app/dist/claude-code-hook.cjs"');
    installInto(path, 'node "/app/dist/claude-code-hook.cjs"');
    const settings = JSON.parse(readFileSync(path, 'utf8'));
    const commands = settings.hooks.PostToolUse.flatMap((e: { hooks: { command: string }[] }) => e.hooks.map((h) => h.command));
    expect(commands.filter((c: string) => c.includes('claude-code-hook.cjs'))).toHaveLength(1);
    expect(commands).toContain('node /opt/other-hook.js');
    expect(other.hooks.PostToolUse).toHaveLength(1);
    const cleaned = uninstallFrom(settings);
    expect(JSON.stringify(cleaned)).not.toContain('claude-code-hook.cjs');
    expect(JSON.stringify(cleaned)).toContain('other-hook');
    expect(existsSync(path)).toBe(true);
  });
});
