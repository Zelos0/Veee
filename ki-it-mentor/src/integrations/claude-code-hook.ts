// Claude Code hook CLI.
//
//   node dist/claude-code-hook.cjs                 Hook-Modus: Event-JSON von stdin lesen
//   node dist/claude-code-hook.cjs print-config    Settings-Snippet ausgeben
//   node dist/claude-code-hook.cjs install   --settings <pfad>   Hook in eine Settings-Datei eintragen
//   node dist/claude-code-hook.cjs uninstall --settings <pfad>   Hook wieder entfernen
//
// Im Hook-Modus endet der Prozess immer mit Exit-Code 0 und ohne stdout-Ausgabe:
// der Mentor darf Claude Code nie blockieren oder beeinflussen.

import { appendFileSync, existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { hookSettingsSnippet, summarizeHookInput, type HookInput } from '../core/claude-code';
import { inboxFile } from './inbox-path';

export const MAX_INBOX_BYTES = 512 * 1024;

export function appendEvent(rawStdin: string, env: NodeJS.ProcessEnv = process.env): boolean {
  let input: HookInput;
  try {
    input = JSON.parse(rawStdin) as HookInput;
  } catch {
    return false;
  }
  const event = summarizeHookInput(input);
  if (!event) return false;
  const file = inboxFile(env);
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  if (existsSync(file) && statSync(file).size > MAX_INBOX_BYTES) renameSync(file, `${file}.1`);
  appendFileSync(file, `${JSON.stringify(event)}\n`, { mode: 0o600 });
  return true;
}

const MARKER = 'claude-code-hook.cjs';

function hookCommand(): string {
  return `node ${JSON.stringify(resolve(__filename))}`;
}

type HookEntry = { matcher?: string; hooks?: Array<{ type: string; command: string }> };
type SettingsFile = { hooks?: Record<string, HookEntry[]> } & Record<string, unknown>;

export function installInto(settingsPath: string, command = hookCommand()): void {
  const settings: SettingsFile = existsSync(settingsPath) ? (JSON.parse(readFileSync(settingsPath, 'utf8')) as SettingsFile) : {};
  uninstallFrom(settings);
  const snippet = hookSettingsSnippet(command) as { hooks: Record<string, HookEntry[]> };
  settings.hooks = settings.hooks ?? {};
  for (const [event, entries] of Object.entries(snippet.hooks)) {
    settings.hooks[event] = [...(settings.hooks[event] ?? []), ...entries];
  }
  mkdirSync(dirname(settingsPath), { recursive: true });
  writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
}

export function uninstallFrom(settings: SettingsFile): SettingsFile {
  if (!settings.hooks) return settings;
  for (const [event, entries] of Object.entries(settings.hooks)) {
    const kept = entries
      .map((e) => ({ ...e, hooks: (e.hooks ?? []).filter((h) => !h.command.includes(MARKER)) }))
      .filter((e) => e.hooks.length > 0);
    if (kept.length) settings.hooks[event] = kept;
    else delete settings.hooks[event];
  }
  if (!Object.keys(settings.hooks).length) delete settings.hooks;
  return settings;
}

function argValue(args: string[], flag: string): string | undefined {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}

function main(): void {
  const [command, ...rest] = process.argv.slice(2);
  if (command === 'print-config') {
    process.stdout.write(`${JSON.stringify(hookSettingsSnippet(hookCommand()), null, 2)}\n`);
    process.stdout.write(`\n# Inbox: ${inboxFile()}\n`);
    return;
  }
  if (command === 'install' || command === 'uninstall') {
    const path = argValue(rest, '--settings');
    if (!path) {
      process.stderr.write('Fehlt: --settings <pfad>, z. B. .claude/settings.local.json\n');
      process.exitCode = 2;
      return;
    }
    if (command === 'install') installInto(path);
    else if (existsSync(path)) writeFileSync(path, `${JSON.stringify(uninstallFrom(JSON.parse(readFileSync(path, 'utf8')) as SettingsFile), null, 2)}\n`);
    process.stdout.write(`${command === 'install' ? 'Installiert' : 'Entfernt'}: ${path}\n`);
    return;
  }

  let data = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => (data += chunk));
  process.stdin.on('end', () => {
    try {
      appendEvent(data);
    } catch {
      // Never fail the host tool call.
    }
    process.exitCode = 0;
  });
}

if (require.main === module) main();
