// Persistent JSON backend for the Knowledge Store (atomic write via temp + rename).

import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { MentorState, StateBackend } from '../core/knowledge';

export class FileBackend implements StateBackend {
  private readonly file: string;

  constructor(dataDir: string) {
    this.file = join(dataDir, 'mentor-state.json');
  }

  async load(): Promise<unknown> {
    if (!existsSync(this.file)) return null;
    try {
      return JSON.parse(readFileSync(this.file, 'utf8')) as unknown;
    } catch {
      // Keep the unreadable file for manual recovery instead of overwriting it.
      renameSync(this.file, `${this.file}.corrupt-${Date.now()}`);
      return null;
    }
  }

  async save(state: MentorState): Promise<void> {
    mkdirSync(dirname(this.file), { recursive: true, mode: 0o700 });
    const tmp = `${this.file}.tmp`;
    writeFileSync(tmp, JSON.stringify(state, null, 2), { mode: 0o600 });
    renameSync(tmp, this.file);
  }

  async wipe(): Promise<void> {
    rmSync(this.file, { force: true });
  }

  location(): string {
    return this.file;
  }
}
