// Location of the Claude Code inbox, shared by the hook CLI and the app.
// Kept separate from the CLI entry so importing it never starts the CLI.

import { homedir } from 'node:os';
import { join } from 'node:path';

export function inboxDir(env: NodeJS.ProcessEnv = process.env): string {
  return env.KI_MENTOR_INBOX || join(homedir(), '.ki-it-mentor', 'inbox');
}

export function inboxFile(env: NodeJS.ProcessEnv = process.env): string {
  return join(inboxDir(env), 'claude-code.jsonl');
}
