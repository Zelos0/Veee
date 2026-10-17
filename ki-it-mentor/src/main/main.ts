// Electron main process: Overlay-Fenster, Berechtigungsgrenze, Provider-Aufrufe,
// Dateizugriff nur über Dialoge, lokale Persistenz.

import { app, BrowserWindow, dialog, globalShortcut, ipcMain, screen, shell } from 'electron';
import { existsSync, readFileSync, statSync, unwatchFile, watchFile, writeFileSync, rmSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseInbox } from '../core/claude-code';
import { buildManifest } from '../core/explanation';
import { exportJson, exportMarkdown, parseState, emptyState, type MentorState } from '../core/knowledge';
import { AnthropicProvider, type Effort } from '../core/providers/anthropic';
import { DemoProvider } from '../core/providers/demo';
import { OllamaProvider } from '../core/providers/ollama';
import { completeWithTimeout, describeError, toProviderError, type Provider } from '../core/providers/provider';
import { redactText } from '../core/redaction';
import type { ExplainRequest } from '../core/types';
import { inboxFile } from '../integrations/inbox-path';
import type { AppInfo, RunResult } from '../shared/ipc';
import { FileBackend } from './file-backend';

const MAX_FILE_BYTES = 200 * 1024;
const REQUEST_TIMEOUT_MS = Number(process.env.KI_MENTOR_TIMEOUT_MS) || 120_000;

if (process.env.KI_MENTOR_DATA_DIR) app.setPath('userData', process.env.KI_MENTOR_DATA_DIR);

const providers = new Map<string, Provider>();
function registerProviders(): void {
  providers.set('demo', new DemoProvider(Number(process.env.KI_MENTOR_DEMO_DELAY_MS ?? 350)));
  providers.set(
    'anthropic',
    new AnthropicProvider({
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.KI_MENTOR_ANTHROPIC_MODEL,
      effort: (process.env.KI_MENTOR_ANTHROPIC_EFFORT as Effort | undefined) ?? 'medium',
    }),
  );
  providers.set('ollama', new OllamaProvider({ baseUrl: process.env.KI_MENTOR_OLLAMA_URL, model: process.env.KI_MENTOR_OLLAMA_MODEL }));
}

let backend: FileBackend;
let win: BrowserWindow | null = null;
const running = new Map<string, AbortController>();

// ---------------------------------------------------------------- window

interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
}

function windowStateFile(): string {
  return join(app.getPath('userData'), 'window-state.json');
}

function loadWindowState(): WindowState {
  const fallback: WindowState = { width: 440, height: 700 };
  try {
    const s = JSON.parse(readFileSync(windowStateFile(), 'utf8')) as WindowState;
    // Multi-monitor: only restore a position that is still on a connected display.
    if (s.x !== undefined && s.y !== undefined) {
      const area = screen.getDisplayMatching({ x: s.x, y: s.y, width: s.width, height: s.height }).workArea;
      const visible = s.x < area.x + area.width - 40 && s.x + s.width > area.x + 40 && s.y >= area.y - 10 && s.y < area.y + area.height - 40;
      if (!visible) return { width: s.width, height: s.height };
    }
    return { ...fallback, ...s };
  } catch {
    return fallback;
  }
}

function saveWindowState(): void {
  if (!win || win.isDestroyed()) return;
  const b = win.getBounds();
  writeFileSync(windowStateFile(), JSON.stringify({ x: b.x, y: b.y, width: b.width, height: b.height }));
}

function createWindow(state: MentorState): void {
  const ws = loadWindowState();
  win = new BrowserWindow({
    ...ws,
    minWidth: 360,
    minHeight: 460,
    frame: false,
    show: false,
    backgroundColor: '#14151a',
    alwaysOnTop: state.settings.alwaysOnTop,
    title: 'KI-IT-Mentor',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });
  if (state.settings.alwaysOnTop) win.setAlwaysOnTop(true, 'floating');

  // The renderer may never navigate or open windows; external links go to the OS browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event) => event.preventDefault());

  win.once('ready-to-show', () => win?.show());
  win.on('moved', saveWindowState);
  win.on('resized', saveWindowState);
  void win.loadFile(join(__dirname, '../renderer/index.html'));
}

function toggleWindow(): void {
  if (!win) return;
  if (win.isVisible() && win.isFocused()) win.hide();
  else {
    win.show();
    win.focus();
  }
}

// ---------------------------------------------------------------- IPC

function provider(id: string): Provider {
  const p = providers.get(id);
  if (!p) throw new Error(`Unbekannter Anbieter: ${id}`);
  return p;
}

function registerIpc(): void {
  ipcMain.handle('state:get', async () => parseState(await backend.load()));
  ipcMain.handle('state:save', async (_e, state: unknown) => backend.save(parseState(state)));
  ipcMain.handle('state:wipe', async () => {
    await backend.wipe();
    rmSync(windowStateFile(), { force: true });
    return emptyState();
  });

  ipcMain.handle('providers:list', () => [...providers.values()].map((p) => p.info()));

  ipcMain.handle('explain:preview', (_e, providerId: string, request: ExplainRequest) => buildManifest(request, provider(providerId).info()));

  ipcMain.handle('explain:run', async (_e, runId: string, providerId: string, request: ExplainRequest): Promise<RunResult> => {
    const p = provider(providerId);
    const info = p.info();
    // Rebuilt here (not taken from the renderer) so exactly the previewed, redacted payload is sent.
    const manifest = buildManifest(request, info);
    const controller = new AbortController();
    running.set(runId, controller);
    try {
      const res = await completeWithTimeout(p, manifest.payload, { timeoutMs: REQUEST_TIMEOUT_MS, signal: controller.signal });
      return { ok: true, text: res.text, model: res.model, servedBy: res.servedBy, providerId, usage: res.usage };
    } catch (error) {
      const err = toProviderError(error);
      // Log class and provider only — never request content.
      console.warn(`[mentor] ${providerId} ${err.code}: ${redactText(err.message)}`);
      return { ok: false, code: err.code, message: describeError(err), retryAfterSec: err.retryAfterSec };
    } finally {
      running.delete(runId);
    }
  });

  ipcMain.handle('explain:cancel', (_e, runId: string) => running.get(runId)?.abort());

  ipcMain.handle('file:open', async () => {
    if (!win) return null;
    const result = await dialog.showOpenDialog(win, { title: 'Datei als Kontext wählen (nur lesen)', properties: ['openFile'] });
    const path = result.filePaths[0];
    if (result.canceled || !path) return null;
    const size = statSync(path).size;
    const raw = readFileSync(path);
    if (raw.subarray(0, 8000).includes(0)) throw new Error('Binärdatei — nur Textdateien werden unterstützt.');
    const truncated = size > MAX_FILE_BYTES;
    return { label: basename(path), content: raw.subarray(0, MAX_FILE_BYTES).toString('utf8'), truncated };
  });

  ipcMain.handle('notes:export', async (_e, format: 'json' | 'md') => {
    if (!win) return { saved: false };
    const state = parseState(await backend.load());
    const result = await dialog.showSaveDialog(win, {
      title: 'Lernnotizen exportieren',
      defaultPath: `ki-mentor-notizen.${format}`,
    });
    if (result.canceled || !result.filePath) return { saved: false };
    writeFileSync(result.filePath, format === 'json' ? exportJson(state) : exportMarkdown(state));
    return { saved: true, path: result.filePath };
  });

  ipcMain.handle('window:alwaysOnTop', (_e, value: boolean) => {
    win?.setAlwaysOnTop(value, 'floating');
    return win?.isAlwaysOnTop() ?? false;
  });
  ipcMain.handle('window:nudge', (_e, dx: number, dy: number) => {
    if (!win) return;
    const b = win.getBounds();
    win.setBounds({ ...b, x: b.x + Math.round(dx), y: b.y + Math.round(dy) });
    saveWindowState();
  });
  ipcMain.handle('window:nextDisplay', () => {
    const displays = screen.getAllDisplays();
    if (!win) return { index: 0, count: displays.length };
    const current = screen.getDisplayMatching(win.getBounds());
    const index = (displays.findIndex((d) => d.id === current.id) + 1) % displays.length;
    const area = displays[index]!.workArea;
    const b = win.getBounds();
    win.setBounds({ x: area.x + area.width - b.width - 24, y: area.y + 24, width: b.width, height: Math.min(b.height, area.height - 48) });
    saveWindowState();
    return { index, count: displays.length };
  });
  ipcMain.handle('window:hide', () => win?.hide());

  ipcMain.handle('inbox:list', () => {
    const file = inboxFile();
    return existsSync(file) ? parseInbox(readFileSync(file, 'utf8')).slice(-50).reverse() : [];
  });
  ipcMain.handle('inbox:clear', () => {
    rmSync(inboxFile(), { force: true });
    rmSync(`${inboxFile()}.1`, { force: true });
  });

  ipcMain.handle('app:info', (): AppInfo => ({
    dataLocation: backend.location(),
    inboxFile: inboxFile(),
    hookCommand: `node ${JSON.stringify(join(__dirname, '../claude-code-hook.cjs'))}`,
    platform: process.platform,
    versions: { electron: process.versions.electron ?? '', app: app.getVersion() },
  }));
}

// ---------------------------------------------------------------- lifecycle

app.whenReady().then(async () => {
  backend = new FileBackend(app.getPath('userData'));
  registerProviders();
  registerIpc();
  const state = parseState(await backend.load());
  createWindow(state);

  if (!globalShortcut.register('CommandOrControl+Shift+M', toggleWindow)) {
    console.warn('[mentor] Tastenkürzel Strg/Cmd+Umschalt+M ist belegt — Fenster bleibt über Taskleiste erreichbar.');
  }

  const file = inboxFile();
  watchFile(file, { interval: 1000 }, () => win?.webContents.send('inbox:changed'));
  app.on('will-quit', () => {
    unwatchFile(file);
    globalShortcut.unregisterAll();
  });
});

app.on('window-all-closed', () => app.quit());
