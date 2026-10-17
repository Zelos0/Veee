import { useEffect, useState } from 'react';
import type { Settings } from '../../core/knowledge';
import type { ProviderInfo } from '../../core/types';
import type { AppInfo } from '../../shared/ipc';

export function SetupPanel(props: {
  settings: Settings;
  providers: ProviderInfo[];
  onSettings: (patch: Partial<Settings>) => void;
  onWipe: () => void;
  announce: (m: string) => void;
}) {
  const { settings, providers } = props;
  const [info, setInfo] = useState<AppInfo | null>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);

  useEffect(() => {
    void window.mentor.appInfo().then(setInfo);
  }, []);

  return (
    <div className="pad">
      <section aria-labelledby="prov-h">
        <h2 id="prov-h" className="section-title">Modell-Anbieter</h2>
        <div className="list" role="radiogroup" aria-labelledby="prov-h">
          {providers.map((p) => (
            <label key={p.id} className="radio-card">
              <input
                type="radio"
                name="provider"
                checked={settings.providerId === p.id}
                disabled={!p.configured}
                onChange={() => {
                  props.onSettings({ providerId: p.id });
                  props.announce(`Anbieter: ${p.label}`);
                }}
              />
              <span>
                {p.label} <span className={`dest ${p.kind}`}><span className="tag">{p.kind === 'external' ? 'EXTERN' : 'LOKAL'}</span></span>
              </span>
              <span className="desc">
                {p.configured ? <>Modell: <span className="mono">{p.model}</span></> : p.unavailableReason}
                {p.kind === 'external' && ' · Jede Anfrage wird vorher als Versand-Manifest angezeigt und muss bestätigt werden.'}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section aria-labelledby="win-h">
        <h2 id="win-h" className="section-title">Fenster & Bewegung</h2>
        <div className="list">
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.alwaysOnTop}
              onChange={async (e) => {
                const value = await window.mentor.setAlwaysOnTop(e.target.checked);
                props.onSettings({ alwaysOnTop: value });
              }}
            />
            Immer im Vordergrund
          </label>
          <label className="switch">
            <input type="checkbox" checked={settings.reducedMotion === 'reduce'} onChange={(e) => props.onSettings({ reducedMotion: e.target.checked ? 'reduce' : 'system' })} />
            Bewegung reduzieren (sonst Systemeinstellung)
          </label>
          <dl className="kv">
            <dt><span className="kbd">Strg/Cmd+Umschalt+M</span></dt><dd>Overlay ein-/ausblenden (global)</dd>
            <dt><span className="kbd">Strg+Alt+Pfeile</span></dt><dd>Fenster per Tastatur verschieben</dd>
            <dt><span className="kbd">Alt+1…4</span></dt><dd>Bereiche wechseln</dd>
            <dt><span className="kbd">Strg+Enter</span></dt><dd>Frage senden · <span className="kbd">Esc</span> abbrechen</dd>
          </dl>
        </div>
      </section>

      <section aria-labelledby="cc-h">
        <h2 id="cc-h" className="section-title">Claude Code (Hook-Integration)</h2>
        <div className="list">
          <label className="switch">
            <input type="checkbox" checked={settings.claudeCodeInbox} onChange={(e) => props.onSettings({ claudeCodeInbox: e.target.checked })} />
            Ereignisse aus Claude Code im Mentor anzeigen
          </label>
          <p className="muted" style={{ margin: 0, fontSize: 'var(--fs-sm)' }}>
            Ein <code className="mono">PostToolUse</code>-Hook schreibt geschwärzte Kurzfassungen von Edit/Write/Bash-Ereignissen in eine lokale Datei. Der Mentor liest nur diese Datei; übernommen wird ein Ereignis erst durch dich. Installation: siehe README → „Claude Code“.
          </p>
          {info && (
            <dl className="kv">
              <dt>Hook-Befehl</dt>
              <dd className="mono">{info.hookCommand}</dd>
              <dt>Inbox</dt>
              <dd className="mono">{info.inboxFile}</dd>
            </dl>
          )}
          <p className="faint" style={{ margin: 0, fontSize: 'var(--fs-xs)' }}>
            Claude Desktop: kein unterstützter Weg, Chats auszulesen. Fallback: Inhalte manuell als Kontext einfügen.
          </p>
        </div>
      </section>

      <section aria-labelledby="data-h">
        <h2 id="data-h" className="section-title">Daten & Datenschutz</h2>
        {info && (
          <dl className="kv">
            <dt>Speicherort</dt>
            <dd className="mono">{info.dataLocation}</dd>
            <dt>Version</dt>
            <dd className="mono">
              {info.versions.app} · Electron {info.versions.electron} · {info.platform}
            </dd>
          </dl>
        )}
        <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>
          Notizen, Lernstand und Einstellungen liegen nur lokal. Kontext wird nicht gespeichert. API-Schlüssel kommen ausschließlich aus Umgebungsvariablen und erreichen die Oberfläche nie.
        </p>
        <div className="row">
          {confirmWipe ? (
            <>
              <span>Alle Notizen, Lernstand und Einstellungen löschen?</span>
              <button
                type="button"
                className="btn danger"
                onClick={() => {
                  props.onWipe();
                  setConfirmWipe(false);
                }}
              >
                Endgültig löschen
              </button>
              <button type="button" className="btn ghost" onClick={() => setConfirmWipe(false)}>
                Abbrechen
              </button>
            </>
          ) : (
            <button type="button" className="btn danger" onClick={() => setConfirmWipe(true)}>
              Alle lokalen Daten löschen
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
