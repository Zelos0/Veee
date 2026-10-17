// Mentor-Ansicht: Kontextleiste → Antwort (drei Tiefen, Folgeaktionen, Quellenbeleg)
// → Eingabe mit Versand-Manifest. Externe Anbieter senden erst nach Bestätigung.

import { useCallback, useEffect, useRef, useState } from 'react';
import { ACTION_LABELS, DEPTH_LABELS, MAX_TOTAL_CHARS, SOURCE_LABELS, makeContextItem } from '../../core/explanation';
import type { ActionKind, ContextItem, ContextSource, Depth, ExplainRequest, Mode, ProviderInfo, SendManifest } from '../../core/types';
import type { InboxEvent } from '../../core/claude-code';
import { Markdown } from './Markdown';
import { Segmented } from './Segmented';

export interface Answer {
  key: string;
  depth: Depth;
  action: ActionKind;
  question: string;
  text: string;
  providerLabel: string;
  model: string;
  servedBy?: string;
  contextLabels: string[];
  local: boolean;
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'confirm'; manifest: SendManifest; request: ExplainRequest }
  | { kind: 'loading'; runId: string; startedAt: number; request: ExplainRequest; external: boolean }
  | { kind: 'error'; message: string; request: ExplainRequest; retryAfterSec?: number };

export interface AskIntent {
  question: string;
  action: ActionKind;
  nonce: number;
}

const FOLLOW_UPS: ActionKind[] = ['example', 'line-by-line', 'why', 'alternatives', 'risks', 'quiz'];
const DEPTHS: Depth[] = ['precise', 'simple', 'simplified'];

function threadKey(r: ExplainRequest): string {
  return [r.mode, r.action, r.question.trim(), r.context.map((c) => c.id).join(',')].join('|');
}

export function MentorPanel(props: {
  mode: Mode;
  depth: Depth;
  onDepthChange: (d: Depth) => void;
  provider: ProviderInfo | undefined;
  context: ContextItem[];
  onContextChange: (items: ContextItem[]) => void;
  inboxEnabled: boolean;
  intent: AskIntent | null;
  onAnswered: (answer: Answer) => void;
  onSaveNote: (answer: Answer) => void;
  announce: (message: string) => void;
}) {
  const { mode, depth, provider, context, onContextChange, announce } = props;
  const [question, setQuestion] = useState('');
  const [editor, setEditor] = useState<null | { source: ContextSource; label: string; content: string }>(null);
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [answers, setAnswers] = useState<Record<string, Partial<Record<Depth, Answer>>>>({});
  const [current, setCurrent] = useState<{ key: string; request: ExplainRequest } | null>(null);
  const [inbox, setInbox] = useState<InboxEvent[] | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showPayload, setShowPayload] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const questionRef = useRef<HTMLTextAreaElement>(null);

  const totalChars = context.reduce((s, c) => s + c.content.length, 0);

  // ---- running a request
  const run = useCallback(
    async (request: ExplainRequest) => {
      if (!provider) return;
      const runId = `run_${Date.now().toString(36)}`;
      setPhase({ kind: 'loading', runId, startedAt: Date.now(), request, external: provider.kind === 'external' });
      announce('Anfrage läuft …');
      const res = await window.mentor.run(runId, provider.id, request);
      if (!res.ok) {
        if (res.code === 'cancelled') {
          setPhase({ kind: 'idle' });
          announce('Abgebrochen.');
          return;
        }
        setPhase({ kind: 'error', message: res.message, request, retryAfterSec: res.retryAfterSec });
        announce(`Fehler: ${res.message}`);
        return;
      }
      const key = threadKey(request);
      const answer: Answer = {
        key,
        depth: request.depth,
        action: request.action,
        question: request.question,
        text: res.text,
        providerLabel: provider.label,
        model: res.model,
        servedBy: res.servedBy,
        contextLabels: request.context.map((c) => `${SOURCE_LABELS[c.source]}: ${c.label}`),
        local: provider.kind === 'local',
      };
      setAnswers((prev) => ({ ...prev, [key]: { ...prev[key], [request.depth]: answer } }));
      setCurrent({ key, request });
      setPhase({ kind: 'idle' });
      announce(`Antwort bereit (${DEPTH_LABELS[request.depth].label}).`);
      props.onAnswered(answer);
    },
    [provider, announce, props],
  );

  const ask = useCallback(
    async (request: ExplainRequest) => {
      if (!provider || !provider.configured) {
        setPhase({ kind: 'error', message: provider?.unavailableReason ?? 'Kein Anbieter gewählt.', request });
        return;
      }
      const cached = answers[threadKey(request)]?.[request.depth];
      if (cached) {
        setCurrent({ key: cached.key, request });
        announce(`${DEPTH_LABELS[request.depth].label}: aus dieser Sitzung.`);
        return;
      }
      if (provider.kind === 'external') {
        const manifest = await window.mentor.preview(provider.id, request);
        setShowPayload(false);
        setPhase({ kind: 'confirm', manifest, request });
        announce(`Versand-Manifest: ${manifest.items.length} Quelle(n), ca. ${manifest.estimatedTokens} Tokens an ${manifest.providerLabel}. Enter zum Senden, Escape zum Abbrechen.`);
        return;
      }
      await run(request);
    },
    [provider, answers, run, announce],
  );

  const buildRequest = (action: ActionKind, overrides: Partial<ExplainRequest> = {}): ExplainRequest => ({
    mode,
    depth,
    action,
    question: question.trim(),
    context,
    ...overrides,
  });

  const submit = (action: ActionKind = 'explain') => {
    if (phase.kind === 'loading' || phase.kind === 'confirm') return;
    if (!question.trim() && !context.length) {
      announce('Bitte eine Frage eingeben oder Kontext hinzufügen.');
      questionRef.current?.focus();
      return;
    }
    void ask(buildRequest(action));
  };

  const followUp = (action: ActionKind) => {
    if (!current) return;
    void ask({ ...current.request, action, depth });
  };

  // Depth change re-asks the current thread at the new depth (cached per session).
  const changeDepth = (d: Depth) => {
    props.onDepthChange(d);
    if (current && phase.kind === 'idle') void ask({ ...current.request, depth: d });
  };

  // External intent (e.g. "Erklären lassen" from the learning path).
  useEffect(() => {
    if (!props.intent) return;
    setQuestion(props.intent.question);
    void ask({ mode, depth, action: props.intent.action, question: props.intent.question, context });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.intent?.nonce]);

  useEffect(() => {
    if (phase.kind !== 'loading') return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - phase.startedAt) / 1000)), 250);
    setElapsed(0);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase.kind === 'confirm') requestAnimationFrame(() => confirmRef.current?.focus());
  }, [phase.kind]);

  // Claude Code inbox
  useEffect(() => {
    if (!props.inboxEnabled || inbox === null) return;
    return window.mentor.onInboxChanged(() => void window.mentor.listInbox().then(setInbox));
  }, [props.inboxEnabled, inbox]);

  const cancel = () => {
    if (phase.kind === 'loading') void window.mentor.cancel(phase.runId);
    if (phase.kind === 'confirm') {
      setPhase({ kind: 'idle' });
      announce('Nichts gesendet.');
      questionRef.current?.focus();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && (phase.kind === 'confirm' || phase.kind === 'loading')) {
      e.preventDefault();
      cancel();
    }
  };

  const addFromEditor = () => {
    if (!editor || !editor.content.trim()) return;
    onContextChange([...context, makeContextItem(editor.source, editor.label.trim() || (editor.source === 'diff' ? 'Diff' : 'Text'), editor.content)]);
    announce(`${SOURCE_LABELS[editor.source]} als Kontext hinzugefügt.`);
    setEditor(null);
  };

  const addFile = async () => {
    try {
      const file = await window.mentor.openFile();
      if (!file) return;
      onContextChange([...context, makeContextItem('file', file.truncated ? `${file.label} (gekürzt)` : file.label, file.content)]);
      announce(`Datei ${file.label} als Kontext hinzugefügt.`);
    } catch (error) {
      announce(`Datei konnte nicht gelesen werden: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const shown = current ? answers[current.key]?.[current.request.depth] : undefined;
  const busy = phase.kind === 'loading' || phase.kind === 'confirm';

  return (
    <div className="mentor" onKeyDown={onKeyDown}>
      {/* ---------------- context bar */}
      <section className="context-bar" aria-label="Kontext">
        <div className="context-head">
          <span>Kontext</span>
          <span className="meter mono" title="Zeichen im Kontext (vor Kürzung)">
            {context.length} Quelle{context.length === 1 ? '' : 'n'} · {totalChars.toLocaleString('de-DE')} / {MAX_TOTAL_CHARS.toLocaleString('de-DE')} Z.
          </span>
        </div>
        {context.length > 0 ? (
          <ul className="chips" aria-label="Angehängter Kontext" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {context.map((c) => (
              <li key={c.id} className="chip" title={`${SOURCE_LABELS[c.source]} · ${c.content.length} Zeichen`}>
                <span className="src">{SOURCE_LABELS[c.source]}</span>
                <span className="lbl">{c.label}</span>
                <button type="button" aria-label={`Kontext entfernen: ${c.label}`} onClick={() => onContextChange(context.filter((x) => x.id !== c.id))}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="faint" style={{ margin: 0, fontSize: 'var(--fs-sm)' }}>
            Kein Kontext. Der Mentor sieht nur, was du hier ausdrücklich hinzufügst.
          </p>
        )}
        {editor ? (
          <div className="inline-editor">
            <input
              type="text"
              aria-label="Bezeichnung"
              placeholder={editor.source === 'diff' ? 'Bezeichnung, z. B. „fix: login“' : 'Bezeichnung, z. B. „Fehlermeldung“'}
              value={editor.label}
              onChange={(e) => setEditor({ ...editor, label: e.target.value })}
            />
            <textarea
              className="code"
              rows={6}
              autoFocus
              aria-label={editor.source === 'diff' ? 'Diff einfügen' : 'Text oder Code einfügen'}
              placeholder={editor.source === 'diff' ? 'git diff einfügen …' : 'Code, Log oder Text einfügen …'}
              value={editor.content}
              onChange={(e) => setEditor({ ...editor, content: e.target.value })}
            />
            <div className="row">
              <button type="button" className="btn primary" onClick={addFromEditor} disabled={!editor.content.trim()}>
                Hinzufügen
              </button>
              <button type="button" className="btn ghost" onClick={() => setEditor(null)}>
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          <div className="add-row">
            <button type="button" className="btn ghost" onClick={() => setEditor({ source: 'manual', label: '', content: '' })}>
              + Text/Code
            </button>
            <button type="button" className="btn ghost" onClick={() => void addFile()}>
              + Datei
            </button>
            <button type="button" className="btn ghost" onClick={() => setEditor({ source: 'diff', label: '', content: '' })}>
              + Diff
            </button>
            {props.inboxEnabled && (
              <button type="button" className="btn ghost" aria-expanded={inbox !== null} onClick={() => (inbox === null ? void window.mentor.listInbox().then(setInbox) : setInbox(null))}>
                Claude Code{inbox ? ` (${inbox.length})` : ''}
              </button>
            )}
          </div>
        )}
        {inbox !== null && (
          <div className="card" aria-label="Claude Code Ereignisse">
            <div className="row">
              <strong style={{ fontSize: 'var(--fs-sm)' }}>Claude Code · letzte Ereignisse</strong>
              <span className="spacer" />
              <button type="button" className="btn ghost" onClick={() => void window.mentor.clearInbox().then(() => setInbox([]))}>
                Leeren
              </button>
            </div>
            {inbox.length === 0 ? (
              <p className="faint" style={{ margin: 0 }}>Keine Ereignisse. Ist der Hook installiert? (Setup → Claude Code)</p>
            ) : (
              <ul className="list" style={{ gap: 2 }}>
                {inbox.slice(0, 12).map((ev) => (
                  <li key={ev.id} className="row" style={{ fontSize: 'var(--fs-sm)' }}>
                    <span className="mono faint">{new Date(ev.receivedAt).toLocaleTimeString('de-DE')}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{ev.label}</span>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => {
                        onContextChange([...context, makeContextItem(ev.kind === 'diff' ? 'diff' : 'claude-code', `Claude Code · ${ev.label}`, ev.content)]);
                        announce(`Claude-Code-Ereignis übernommen: ${ev.label}`);
                      }}
                    >
                      Übernehmen
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* ---------------- answer */}
      <section className="answer-area" aria-label="Antwort">
        <div className="depth-row">
          <Segmented<Depth>
            label="Erklärtiefe"
            value={depth}
            onChange={changeDepth}
            disabled={busy}
            options={DEPTHS.map((d) => ({ value: d, label: DEPTH_LABELS[d].label, title: DEPTH_LABELS[d].hint }))}
          />
          <span className="hint">{DEPTH_LABELS[depth].hint}</span>
        </div>

        {phase.kind === 'loading' && (
          <div className="state-box loading" role="status">
            <div className="row">
              <span>
                {phase.external ? 'Wird an ' : 'Lokal: '}
                <strong>{provider?.label}</strong> {phase.external ? 'gesendet …' : 'wird erstellt …'}
              </span>
              <span className="spacer" />
              <span className="mono faint">{elapsed} s</span>
              <button type="button" className="btn ghost" onClick={cancel}>
                Abbrechen <kbd>Esc</kbd>
              </button>
            </div>
            <div className="scan" aria-hidden="true" />
          </div>
        )}

        {phase.kind === 'error' && (
          <div className="state-box error" role="alert">
            <span>{phase.message}</span>
            <div className="row">
              <button type="button" className="btn" onClick={() => void ask(phase.request)} disabled={!provider?.configured}>
                Erneut senden
              </button>
              <button type="button" className="btn ghost" onClick={() => setPhase({ kind: 'idle' })}>
                Schließen
              </button>
            </div>
          </div>
        )}

        {shown ? (
          <article className="answer" aria-label={`Antwort, ${DEPTH_LABELS[shown.depth].label}`} key={`${shown.key}-${shown.depth}`}>
            <p className="faint mono" style={{ fontSize: 'var(--fs-xs)', margin: '0 0 var(--s2)' }}>
              {ACTION_LABELS[shown.action]} · {DEPTH_LABELS[shown.depth].label} · {mode === 'learn' ? 'Lernmentor' : 'Copilot'}
            </p>
            <Markdown text={shown.text} />
            <details className="receipt">
              <summary>
                <span>
                  Beleg: {shown.contextLabels.length} Quelle{shown.contextLabels.length === 1 ? '' : 'n'} · {shown.providerLabel}
                </span>
              </summary>
              <ul>
                {shown.contextLabels.length ? shown.contextLabels.map((l) => <li key={l}>{l}</li>) : <li>Kein Kontext — allgemeine Antwort.</li>}
                <li>
                  Modell: <span className="mono">{shown.model}</span>
                  {shown.servedBy ? ` (beantwortet von ${shown.servedBy})` : ''} · {shown.local ? 'lokal, nichts gesendet' : 'extern, nach Bestätigung gesendet'}
                </li>
              </ul>
            </details>
            <div className="actions" role="group" aria-label="Folgeaktionen" style={{ marginTop: 'var(--s2)' }}>
              {FOLLOW_UPS.map((a) => (
                <button key={a} type="button" className="btn ghost" disabled={busy} onClick={() => followUp(a)}>
                  {ACTION_LABELS[a]}
                </button>
              ))}
              <button type="button" className="btn" onClick={() => props.onSaveNote(shown)}>
                Als Notiz speichern
              </button>
            </div>
          </article>
        ) : (
          phase.kind === 'idle' && (
            <div className="empty">
              <h2>{mode === 'learn' ? 'Was möchtest du verstehen?' : 'Woran arbeitest du?'}</h2>
              <ol>
                <li>Kontext hinzufügen: Code, Diff, Datei oder ein Claude-Code-Ereignis.</li>
                <li>Frage stellen — oder einfach „Erklären“.</li>
                <li>Tiefe wechseln: Präzise, Einfach, Schritt für Schritt.</li>
              </ol>
              <p className="faint" style={{ margin: 0 }}>
                {mode === 'learn' ? 'Lernmentor: erklärt das Warum und prüft dein Verständnis.' : 'Copilot: Ursache, Lösung, Risiken, Tests — du führst selbst aus.'}
              </p>
            </div>
          )
        )}
      </section>

      {/* ---------------- composer + manifest */}
      <section className="composer" aria-label="Frage">
        <div className="manifest-wrap" data-open={phase.kind === 'confirm'}>
          <div>
            {phase.kind === 'confirm' && (
              <div className="manifest" role="dialog" aria-modal="false" aria-labelledby="manifest-title">
                <h2 id="manifest-title">Versand-Manifest · verlässt diesen Rechner</h2>
                <table>
                  <tbody>
                    {phase.manifest.items.map((it, i) => (
                      <tr key={it.id} style={{ animationDelay: `calc(var(--stagger) * ${i})` }}>
                        <td className="src">{SOURCE_LABELS[it.source]}</td>
                        <td>
                          {it.label}
                          {it.redactions.length > 0 && (
                            <div className="redacted" style={{ fontSize: 'var(--fs-xs)' }}>
                              geschwärzt: {it.redactions.map((r) => `${r.kind} ×${r.count}`).join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="num mono">{it.chars.toLocaleString('de-DE')} Z.</td>
                      </tr>
                    ))}
                    <tr style={{ animationDelay: `calc(var(--stagger) * ${phase.manifest.items.length})` }}>
                      <td className="src">Frage</td>
                      <td>+ Systemanweisung (Modus, Tiefe, Aufgabe)</td>
                      <td className="num mono">{phase.manifest.questionChars.toLocaleString('de-DE')} Z.</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="src">Ziel</td>
                      <td>
                        {phase.manifest.providerLabel} · <span className="mono">{phase.manifest.model}</span>
                      </td>
                      <td className="num mono">≈ {phase.manifest.estimatedTokens.toLocaleString('de-DE')} Tok.</td>
                    </tr>
                  </tfoot>
                </table>
                <p className="faint" style={{ margin: 0, fontSize: 'var(--fs-xs)' }}>
                  {phase.manifest.redactionTotal > 0 ? `${phase.manifest.redactionTotal} Stelle(n) automatisch geschwärzt. ` : 'Keine Geheimnisse erkannt (Mustersuche, keine Garantie). '}
                  Token-Zahl ist eine Schätzung; Kosten fallen beim Anbieter an.
                </p>
                <button type="button" className="btn ghost" aria-expanded={showPayload} onClick={() => setShowPayload((v) => !v)}>
                  {showPayload ? 'Payload ausblenden' : 'Exakten Payload ansehen'}
                </button>
                {showPayload && <pre aria-label="Exakter Payload">{`[system]\n${phase.manifest.payload.system}\n\n[user]\n${phase.manifest.payload.messages[0]?.content ?? ''}`}</pre>}
                <div className="row">
                  <button ref={confirmRef} type="button" className="btn signal" onClick={() => void run(phase.request)}>
                    Senden <kbd>Enter</kbd>
                  </button>
                  <button type="button" className="btn ghost" onClick={cancel}>
                    Nicht senden <kbd>Esc</kbd>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <textarea
          ref={questionRef}
          aria-label="Frage an den Mentor"
          placeholder={mode === 'learn' ? 'Was ist unklar? (Strg+Enter)' : 'Frage oder Aufgabe … (Strg+Enter)'}
          value={question}
          disabled={busy}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <div className="composer-row">
          {provider && (
            <span className={`dest ${provider.kind}`} title={provider.kind === 'external' ? 'Sendet nach Bestätigung an einen externen Dienst' : 'Bleibt auf diesem Rechner'}>
              <span className="tag">{provider.kind === 'external' ? 'EXTERN' : 'LOKAL'}</span>
              {provider.label}
              {!provider.configured && <span className="due"> · nicht eingerichtet</span>}
            </span>
          )}
          <span className="spacer" />
          <button type="button" className="btn primary" onClick={() => submit()} disabled={busy}>
            {question.trim() ? 'Fragen' : 'Erklären'}
          </button>
        </div>
      </section>
    </div>
  );
}
