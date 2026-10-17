import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { launch, shot, startMockAnthropic } from './fixtures';

const CODE = `async function loadUsers(path) {
  try {
    const raw = await fs.promises.readFile(path, 'utf8');
    return JSON.parse(raw).filter((u) => u.active);
  } catch (e) {
    return [];
  }
}
const API_KEY = "sk-ant-api03-THISMUSTNEVERLEAVE";`;

async function addTextContext(page: import('@playwright/test').Page, label: string, content: string) {
  await page.getByRole('button', { name: '+ Text/Code' }).click();
  await page.getByRole('textbox', { name: 'Bezeichnung' }).fill(label);
  await page.getByRole('textbox', { name: 'Text oder Code einfügen' }).fill(content);
  await page.getByRole('button', { name: 'Hinzufügen' }).click();
}

test('erste Ansicht, Kontext, drei Tiefen, Folgeaktion, Notiz (lokal)', async () => {
  const { app, page } = await launch();
  await expect(page.getByRole('heading', { name: 'Woran arbeitest du?' })).toBeVisible();
  await expect(page.getByText('LOKAL')).toBeVisible();
  await shot(page, '01-leer-copilot');

  await addTextContext(page, 'loadUsers.js', CODE);
  await expect(page.locator('.chip')).toContainText('loadUsers.js');

  await page.getByRole('button', { name: 'Erklären' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'wird erstellt' })).toBeVisible();
  const answer = page.getByRole('article');
  await expect(answer).toContainText('Einfach gesagt');
  await shot(page, '02-antwort-einfach');

  await page.getByRole('radio', { name: 'Präzise' }).click();
  await expect(answer).toContainText('Schlussfolgerung');
  await page.getByRole('radio', { name: 'Schritt für Schritt' }).click();
  await expect(answer).toContainText('Analogie');
  await expect(answer).toContainText('Was das technisch bedeutet');
  await shot(page, '03-antwort-vereinfacht');

  // Cached per session: switching back is instant and identical.
  await page.getByRole('radio', { name: 'Einfach' }).click();
  await expect(answer).toContainText('Einfach gesagt');

  await page.getByRole('button', { name: 'Was kann schiefgehen?' }).click();
  await expect(answer).toContainText('Was kann schiefgehen?');

  await page.getByRole('button', { name: 'Als Notiz speichern' }).click();
  await page.getByRole('tab', { name: /Notizen/ }).click();
  await expect(page.locator('.card')).toHaveCount(1);
  await page.getByRole('button', { name: /Notiz löschen/ }).click();
  await page.getByRole('button', { name: 'Wirklich löschen' }).click();
  await expect(page.getByText('Noch keine Notizen')).toBeVisible();
  await app.close();
});

test('externer Anbieter: Versand-Manifest, Schwärzung, Abbruch sendet nichts, Fehlerzustand', async () => {
  const mock = await startMockAnthropic();
  const { app, page } = await launch({ env: { ANTHROPIC_API_KEY: 'test-key-not-real', ANTHROPIC_BASE_URL: mock.url } });
  await page.getByRole('tab', { name: 'Setup' }).click();
  await page.getByRole('radio', { name: /Anthropic Claude/ }).check();
  await page.getByRole('tab', { name: 'Mentor' }).click();
  await expect(page.getByText('EXTERN')).toBeVisible();

  await addTextContext(page, 'loadUsers.js', CODE);
  await page.getByRole('textbox', { name: 'Frage an den Mentor' }).fill('Ist das robust?');
  await page.getByRole('button', { name: 'Fragen' }).click();

  const manifest = page.getByRole('dialog', { name: /Versand-Manifest/ });
  await expect(manifest).toBeVisible();
  await expect(manifest).toContainText('loadUsers.js');
  await expect(manifest).toContainText('geschwärzt: anthropic-key ×1');
  await expect(manifest).toContainText('claude-opus-5-5');
  await expect(page.getByRole('button', { name: /Senden/ })).toBeFocused();
  await manifest.getByRole('button', { name: 'Exakten Payload ansehen' }).click();
  await expect(manifest.getByLabel('Exakter Payload')).toContainText('[REDACTED:anthropic-key]');
  await expect(manifest.getByLabel('Exakter Payload')).not.toContainText('THISMUSTNEVERLEAVE');
  await shot(page, '04-versand-manifest');

  await page.keyboard.press('Escape');
  await expect(manifest).toBeHidden();
  expect(mock.requests).toHaveLength(0);

  await page.getByRole('button', { name: 'Fragen' }).click();
  await expect(page.getByRole('button', { name: /Senden/ })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('article')).toContainText('Mock-Antwort vom Testserver');
  expect(mock.requests).toHaveLength(1);
  const sent = JSON.stringify(mock.requests[0]!.body);
  expect(sent).not.toContain('THISMUSTNEVERLEAVE');
  expect(sent).toContain('[REDACTED:anthropic-key]');
  expect(sent).not.toContain('"meta"');
  expect(mock.requests[0]!.body.model).toBe('claude-opus-5-5');
  await page.getByText(/Beleg: 1 Quelle/).click();
  await expect(page.getByText('extern, nach Bestätigung gesendet')).toBeVisible();
  await shot(page, '05-antwort-extern-beleg');

  // Rate limit → typed, understandable error with retry.
  mock.status = 429;
  await page.getByRole('radio', { name: 'Präzise' }).click();
  await page.getByRole('button', { name: /Senden/ }).click();
  // The SDK honours retry-after (7 s) once before giving up; the UI shows elapsed time meanwhile.
  await expect(page.getByRole('alert')).toContainText('Ratenlimit', { timeout: 20_000 });
  expect(mock.requests).toHaveLength(3);
  await shot(page, '06-fehler-ratenlimit');
  await app.close();
  await mock.close();
});

test('Lernpfad: Lesen ≠ Können, Übung hebt Status, Fortschritt bleibt nach Neustart', async () => {
  const first = await launch();
  const { page } = first;
  await page.keyboard.press('Alt+2');
  await expect(page.getByRole('tab', { name: 'Lernpfad' })).toHaveAttribute('aria-selected', 'true');
  await shot(page, '07-lernpfad');
  await page.getByRole('button', { name: /Commit, Staging und Historie/ }).click();

  await page.getByRole('button', { name: 'Vom Mentor erklären lassen' }).click();
  await expect(page.getByRole('article')).toContainText('Prüfe dich selbst');
  await expect(page.locator('.app')).toHaveAttribute('data-mode', 'learn');

  await page.getByRole('tab', { name: 'Lernpfad' }).click();
  await expect(page.getByRole('button', { name: /Commit, Staging und Historie, Status: Eingeführt/ })).toBeVisible();
  await page.getByRole('button', { name: /Commit, Staging und Historie/ }).click();

  await page.getByRole('listitem').filter({ hasText: 'Erkläre mit eigenen Worten' }).getByRole('button', { name: 'Starten' }).click();
  await page.getByRole('textbox', { name: 'Deine Antwort' }).fill('Damit kann ich gezielt auswählen, welche Änderungen in den nächsten Commit kommen.');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await expect(page.locator('.feedback.pass')).toContainText('Bestanden');
  await expect(page.locator('.level-up')).toContainText('Selbst erklärt');
  await shot(page, '08-uebung-bestanden');
  await page.getByRole('button', { name: 'Als Notiz speichern' }).click();
  await page.waitForTimeout(400); // debounce persist
  await first.app.close();

  const second = await launch({ dataDir: first.dataDir });
  await second.page.getByRole('tab', { name: 'Lernpfad' }).click();
  await expect(second.page.getByRole('button', { name: /Commit, Staging und Historie, Status: Selbst erklärt/ })).toBeVisible();
  await second.page.getByRole('tab', { name: /Notizen/ }).click();
  await expect(second.page.locator('.card')).toHaveCount(1);

  await second.page.getByRole('tab', { name: 'Setup' }).click();
  await second.page.getByRole('button', { name: 'Alle lokalen Daten löschen' }).click();
  await second.page.getByRole('button', { name: 'Endgültig löschen' }).click();
  await second.page.getByRole('tab', { name: 'Notizen' }).click();
  await expect(second.page.getByText('Noch keine Notizen')).toBeVisible();
  await second.app.close();
});

test('Claude Code Hook → Inbox → als Kontext übernehmen', async () => {
  const { app, page, inboxDir } = await launch();
  const hook = join(__dirname, '../../dist/claude-code-hook.cjs');
  execFileSync('node', [hook], {
    input: JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Edit', tool_input: { file_path: 'src/login.ts', old_string: 'if (user)', new_string: 'if (user && user.active)' } }),
    env: { ...process.env, KI_MENTOR_INBOX: inboxDir },
  });
  await page.getByRole('tab', { name: 'Setup' }).click();
  await page.getByRole('checkbox', { name: /Ereignisse aus Claude Code/ }).check();
  await shot(page, '09-setup');
  await page.getByRole('tab', { name: 'Mentor' }).click();
  await page.getByRole('button', { name: 'Claude Code' }).click();
  await expect(page.getByText('Edit · src/login.ts')).toBeVisible();
  await page.getByRole('button', { name: 'Übernehmen' }).click();
  await expect(page.locator('.chip')).toContainText('Claude Code · Edit · src/login.ts');
  await expect(page.locator('.chip .src')).toHaveText('Diff');
  await shot(page, '10-claude-code-kontext');
  await app.close();
});

test('Reduced Motion, Hell-Modus und schmale Breite', async () => {
  const { app, page } = await launch();
  await page.getByRole('tab', { name: 'Setup' }).click();
  await page.getByRole('checkbox', { name: /Bewegung reduzieren/ }).check();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce');
  const dur = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--dur-med').trim());
  expect(dur).toBe('0ms');

  await page.getByRole('combobox', { name: 'Farbschema' }).selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]!.setSize(360, 560));
  await page.getByRole('tab', { name: 'Mentor' }).click();
  await addTextContext(page, 'ein-sehr-langer-dateiname-der-umbrechen-oder-abgeschnitten-werden-muss.ts', 'const x = 1;');
  await page.getByRole('button', { name: 'Erklären' }).click();
  await expect(page.getByRole('article')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
  await shot(page, '11-hell-schmal');

  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]!.setSize(440, 700));
  await page.getByRole('tab', { name: 'Setup' }).click();
  await page.getByRole('combobox', { name: 'Farbschema' }).selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('tab', { name: 'Mentor' }).click();
  await page.getByRole('radio', { name: 'Lernen' }).click();
  await expect(page.locator('.app')).toHaveAttribute('data-mode', 'learn');
  await shot(page, '12-dunkel-lernmodus');
  await app.close();
});
