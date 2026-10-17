// The electron package's default export is the binary path when imported from Node.
import electronPath from 'electron';
import { _electron as electron, type ElectronApplication, type Page } from '@playwright/test';
import { createServer, type Server } from 'node:http';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';


export interface MockAnthropic {
  url: string;
  requests: Array<{ path: string; body: Record<string, unknown> }>;
  /** Next response status (200 = success). */
  status: number;
  close(): Promise<void>;
}

/** Local stand-in for the Messages API, so the real SDK adapter runs end to end. */
export async function startMockAnthropic(): Promise<MockAnthropic> {
  const mock = { requests: [] as MockAnthropic['requests'], status: 200 } as MockAnthropic;
  const server: Server = createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      const body = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      mock.requests.push({ path: req.url ?? '', body });
      if (mock.status !== 200) {
        res.writeHead(mock.status, { 'content-type': 'application/json', 'retry-after': '7' });
        res.end(JSON.stringify({ type: 'error', error: { type: 'rate_limit_error', message: 'slow down' } }));
        return;
      }
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify({
          id: 'msg_test',
          type: 'message',
          role: 'assistant',
          model: body.model,
          stop_reason: 'end_turn',
          stop_sequence: null,
          stop_details: null,
          content: [{ type: 'text', text: '## Beobachtung\nMock-Antwort vom Testserver.\n\n- Punkt eins\n- Punkt zwei' }],
          usage: { input_tokens: 42, output_tokens: 17 },
        }),
      );
    });
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  mock.url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  mock.close = () => new Promise((r) => server.close(() => r()));
  return mock;
}

export interface Launched {
  app: ElectronApplication;
  page: Page;
  dataDir: string;
  inboxDir: string;
}

export async function launch(opts: { dataDir?: string; inboxDir?: string; env?: Record<string, string> } = {}): Promise<Launched> {
  const dataDir = opts.dataDir ?? mkdtempSync(join(tmpdir(), 'mentor-data-'));
  const inboxDir = opts.inboxDir ?? mkdtempSync(join(tmpdir(), 'mentor-inbox-'));
  const env: Record<string, string> = {
    ...(process.env as Record<string, string>),
    KI_MENTOR_DATA_DIR: dataDir,
    KI_MENTOR_INBOX: inboxDir,
    KI_MENTOR_DEMO_DELAY_MS: '150',
    ANTHROPIC_API_KEY: '',
    ...opts.env,
  };
  const app = await electron.launch({ executablePath: electronPath as unknown as string, args: ['.', '--no-sandbox'], env, cwd: join(__dirname, '../..') });
  const page = await app.firstWindow();
  await page.waitForSelector('.titlebar');
  return { app, page, dataDir, inboxDir };
}

export async function shot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: join(__dirname, '../../qa/screenshots', `${name}.png`) });
}
