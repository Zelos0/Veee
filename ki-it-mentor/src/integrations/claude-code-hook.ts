// Claude Code hook CLI.
//
//   node dist/claude-code-hook.cjs                 Hook-Modus: Event-JSON von stdin lesen
//   node dist/claude-code-hook.cjs print-config    Settings-Snippet ausgeben
//   node dist/claude-code-hook.cjs install   --settings <pfad>   Hook in eine Settings-Datei eintragen
//   node dist/claude-code-hook.cjs uninstall --settings <pfad>   Hook wieder entfernen
//
// Im Hook-Modus endet der Prozess immer mit Exit-Code 0 und ohne stdout-Ausgabe:
// der Mentor darf Claude Code nie blockieren oder beeinflussen.

import { appendFileSync, chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { hookSettingsSnippet, summarizeHookInput, type HookInput } from '../core/claude-code';
import { hookCommandFor, inboxFile } from './inbox-path';

export const MAX_INBOX_BYTES = 512 * 1024;
export const MAX_ROTATED_FILES = 3;
/** Hard upper bound for one hook run; Claude Code must never wait on the mentor. */
export const HOOK_DEADLINE_MS = 3_000;

function rotate(file: string): void {
  // Unique name per rotation so concurrent hooks never overwrite each other's archive.
  renameSync(file, `${file}.${Date.now()}-${process.pid}`);
  const dir = dirname(file);
  const archives = readdirSync(dir)
    .filter((n) => n.startsWith(`${basename(file)}.`))
    .sort();
  for (const old of archives.slice(0, Math.max(0, archives.length - MAX_ROTATED_FILES))) rmSync(join(dir, old), { force: true });
}

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
  // Tighten permissions only on a directory we created — never on a user-chosen KI_MENTOR_INBOX.
  if (mkdirSync(dirname(file), { recursive: true, mode: 0o700 })) chmodSync(dirname(file), 0o700);
  if (existsSync(file) && statSync(file).size > MAX_INBOX_BYTES) rotate(file);
  appendFileSync(file, `${JSON.stringify(event)}\n`, { mode: 0o600 });
  chmodSync(file, 0o600);
  return true;
}

const MARKER = 'claude-code-hook.cjs';

function hookCommand(): string {
  return hookCommandFor(resolve(__filename));
}

function writeAtomic(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  // Follow symlinks (e.g. dotfile managers) and keep the existing file mode.
  const target = existsSync(path) ? realpathSync(path) : path;
  const mode = existsSync(target) ? statSync(target).mode & 0o777 : 0o644;
  const tmp = `${target}.tmp-${process.pid}`;
  writeFileSync(tmp, content, { mode });
  renameSync(tmp, target);
}

type HookEntry = { matcher?: string; hooks?: Array<{ type: string; command?: string }> };
type SettingsFile = { hooks?: Record<string, HookEntry[]> } & Record<string, unknown>;

export function installInto(settingsPath: string, command = hookCommand()): void {
  const settings: SettingsFile = existsSync(settingsPath) ? (JSON.parse(readFileSync(settingsPath, 'utf8')) as SettingsFile) : {};
  uninstallFrom(settings);
  const snippet = hookSettingsSnippet(command) as { hooks: Record<string, HookEntry[]> };
  settings.hooks = settings.hooks ?? {};
  for (const [event, entries] of Object.entries(snippet.hooks)) {
    const existing = settings.hooks[event];
    if (existing !== undefined && !Array.isArray(existing)) {
      throw new Error(`hooks.${event} in ${settingsPath} ist kein Array — bitte manuell prüfen; nichts geändert.`);
    }
    settings.hooks[event] = [...(existing ?? []), ...entries];
  }
  writeAtomic(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
}

export function uninstallFrom(settings: SettingsFile): SettingsFile {
  if (!settings.hooks) return settings;
  for (const [event, entries] of Object.entries(settings.hooks)) {
    // Foreign structures (non-arrays, prompt hooks without `command`) are left untouched.
    if (!Array.isArray(entries)) continue;
    const ours = (h: { command?: unknown }) => typeof h?.command === 'string' && h.command.includes(MARKER);
    const kept = entries
      .map((e) => (Array.isArray(e?.hooks) ? { ...e, hooks: e.hooks.filter((h) => !ours(h)) } : e))
      .filter((e) => !Array.isArray(e?.hooks) || e.hooks.length > 0);
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
    else if (existsSync(path)) writeAtomic(path, `${JSON.stringify(uninstallFrom(JSON.parse(readFileSync(path, 'utf8')) as SettingsFile), null, 2)}\n`);
    process.stdout.write(`${command === 'install' ? 'Installiert' : 'Entfernt'}: ${path}\n`);
    return;
  }

  // Interactive terminal: nothing to read — exit instead of waiting forever.
  if (process.stdin.isTTY) return;
  setTimeout(() => process.exit(0), HOOK_DEADLINE_MS).unref();
  process.stdin.on('error', () => process.exit(0));
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
