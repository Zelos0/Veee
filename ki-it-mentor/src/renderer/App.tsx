import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { addNote, deleteAllNotes, deleteNote, getProgress, setProgress, type MentorState, type Settings } from '../core/knowledge';
import { applyEvidence, type TopicProgress } from '../core/learning';
import type { Topic } from '../core/curriculum';
import { ACTION_LABELS } from '../core/explanation';
import type { ContextItem, Depth, Mode, ProviderInfo } from '../core/types';
import { LearnPanel } from './components/LearnPanel';
import { MentorPanel, type AskIntent } from './components/MentorPanel';
import { NotesPanel } from './components/NotesPanel';
import { Segmented } from './components/Segmented';
import { SetupPanel } from './components/SetupPanel';

type Tab = 'mentor' | 'learn' | 'notes' | 'setup';
const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'mentor', label: 'Fragen' },
  { id: 'learn', label: 'Lernpfad' },
  { id: 'notes', label: 'Notizen' },
  { id: 'setup', label: 'Setup' },
];

export function App() {
  const [state, setState] = useState<MentorState | null>(null);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [tab, setTab] = useState<Tab>('mentor');
  const [context, setContext] = useState<ContextItem[]>([]);
  const [intent, setIntent] = useState<AskIntent | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const latest = useRef<MentorState | null>(null);
  latest.current = state;

  // Flush a pending debounced save synchronously when the window goes away.
  useEffect(() => {
    const flush = () => {
      if (saveTimer.current === undefined || !latest.current) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = undefined;
      window.mentor.saveStateSync(latest.current);
    };
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
    };
  }, []);

  useEffect(() => {
    void Promise.all([window.mentor.getState(), window.mentor.listProviders()]).then(([s, p]) => {
      setState(s);
      setProviders(p);
    });
  }, []);

  useEffect(() => {
    if (!state) return;
    document.documentElement.dataset.motion = state.settings.reducedMotion === 'reduce' ? 'reduce' : '';
  }, [state?.settings.reducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  const theme = state?.settings.theme ?? 'system';
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const apply = () => {
      document.documentElement.dataset.theme = theme === 'system' ? (media.matches ? 'light' : 'dark') : theme;
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  const update = useCallback((fn: (s: MentorState) => MentorState) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveTimer.current = undefined;
        void window.mentor.saveState(next);
      }, 250);
      return next;
    });
  }, []);

  const announce = useCallback((m: string) => {
    // Re-set to re-trigger the live region even for identical messages.
    setMessage('');
    requestAnimationFrame(() => setMessage(m));
  }, []);

  const patchSettings = useCallback((patch: Partial<Settings>) => update((s) => ({ ...s, settings: { ...s.settings, ...patch } })), [update]);

  // Reading an explanation of a learning-path topic counts as exposure only (unseen → introduced).
  const onAnswered = useCallback(() => {
    if (activeTopic) update((s) => setProgress(s, applyEvidence(getProgress(s, activeTopic), { kind: 'explanation_viewed' })));
  }, [activeTopic, update]);

  const onKeyDown = (e: KeyboardEvent | globalThis.KeyboardEvent) => {
    if (e.altKey && !e.ctrlKey && /^[1-4]$/.test(e.key)) {
      e.preventDefault();
      setTab(TABS[Number(e.key) - 1]!.id);
    }
    if (e.ctrlKey && e.altKey && e.key.startsWith('Arrow')) {
      e.preventDefault();
      const step = e.shiftKey ? 80 : 20;
      const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key] ?? [0, 0];
      void window.mentor.nudgeWindow(d[0]!, d[1]!);
    }
  };

  // Window-level so shortcuts also work when nothing inside the app has focus.
  const keyHandler = useRef(onKeyDown);
  keyHandler.current = onKeyDown;
  useEffect(() => {
    const listener = (e: globalThis.KeyboardEvent) => keyHandler.current(e);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  if (!state) return <div className="pad muted" role="status">Lade …</div>;

  const provider = providers.find((p) => p.id === state.settings.providerId) ?? providers.find((p) => p.id === 'demo');
  const mode = state.settings.mode;

  return (
    <div className="app" data-mode={mode}>
      <header className="titlebar">
        <span className="brand">
          <span className="brand-dot" aria-hidden="true" />
          <span className="brand-text">KI-IT-Mentor</span>
        </span>
        <Segmented<Mode>
          label="Modus"
          className="mode"
          value={mode}
          onChange={(m) => {
            patchSettings({ mode: m });
            announce(m === 'learn' ? 'Lernmentor-Modus' : 'Copilot-Modus');
          }}
          options={[
            { value: 'learn', label: 'Lernen', title: 'Lernmentor: Verständnis, Übungen, Wiederholung' },
            { value: 'copilot', label: 'Copilot', title: 'Technischer Copilot: Ursache, Lösung, Risiken' },
          ]}
        />
        <span className="spacer" />
        <button
          type="button"
          className="icon-btn"
          aria-pressed={state.settings.alwaysOnTop}
          aria-label="Immer im Vordergrund"
          title="Immer im Vordergrund"
          onClick={async () => patchSettings({ alwaysOnTop: await window.mentor.setAlwaysOnTop(!state.settings.alwaysOnTop) })}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M10 1l5 5-2 1-2.5 2.5L10 13l-1.5 1.5L6 12l-4 4-1-1 4-4-2.5-2.5L4 7l3.5-.5L10 4z" /></svg>
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="Auf nächsten Monitor verschieben"
          title="Auf nächsten Monitor"
          onClick={async () => {
            const r = await window.mentor.nextDisplay();
            announce(r.count > 1 ? `Monitor ${r.index + 1} von ${r.count}` : 'Nur ein Monitor erkannt.');
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M1 2h14v9H9v2h2v1H5v-1h2v-2H1zm1 1v7h12V3z" /></svg>
        </button>
        <button type="button" className="icon-btn" aria-label="Ausblenden (Strg/Cmd+Umschalt+M)" title="Ausblenden" onClick={() => void window.mentor.hideWindow()}>
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M3 8h10v1H3z" /></svg>
        </button>
      </header>

      <nav className="tabs" role="tablist" aria-label="Bereiche">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={tab === t.id ? `panel-${t.id}` : undefined}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
              const i = TABS.findIndex((x) => x.id === tab);
              const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length]!;
              setTab(next.id);
              requestAnimationFrame(() => document.getElementById(`tab-${next.id}`)?.focus());
            }}
          >
            {t.label}
            {t.id === 'notes' && state.notes.length > 0 && <span className="badge mono faint">{state.notes.length}</span>}
          </button>
        ))}
      </nav>

      <main className="panel" id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        <div hidden={tab !== 'mentor'} style={{ height: '100%' }}>
          <MentorPanel
            mode={mode}
            depth={state.settings.depth}
            onDepthChange={(d: Depth) => patchSettings({ depth: d })}
            provider={provider}
            context={context}
            onContextChange={setContext}
            inboxEnabled={state.settings.claudeCodeInbox}
            intent={intent}
            onAnswered={onAnswered}
            onSaveNote={(a) => {
              update((s) => addNote(s, { title: a.question || ACTION_LABELS[a.action], body: a.text, sources: a.contextLabels, topicId: activeTopic ?? undefined }));
              announce('Als Notiz gespeichert.');
            }}
            onOpenSetup={() => setTab('setup')}
            announce={announce}
          />
        </div>
        {/* Kept mounted so an exercise in progress survives tab switches. */}
        <div hidden={tab !== 'learn'}>
          <LearnPanel
            state={state}
            onProgress={(p: TopicProgress) => update((s) => setProgress(s, p))}
            onExplain={(topic: Topic) => {
              setActiveTopic(topic.id);
              patchSettings({ mode: 'learn' });
              setIntent({ question: `Erkläre mir: ${topic.title} — ${topic.summary}`, action: 'explain', nonce: Date.now() });
              setTab('mentor');
            }}
            onSaveNote={(title, body, topicId) => {
              update((s) => addNote(s, { title, body, topicId, sources: ['Übung'] }));
              announce('Als Notiz gespeichert.');
            }}
            announce={announce}
          />
        </div>
        {tab === 'notes' && (
          <NotesPanel state={state} onDelete={(id) => update((s) => deleteNote(s, id))} onDeleteAll={() => update(deleteAllNotes)} announce={announce} />
        )}
        {tab === 'setup' && (
          <SetupPanel
            settings={state.settings}
            providers={providers}
            onSettings={patchSettings}
            onWipe={async () => {
              // Cancel a pending save first, or it could write the old state back after the wipe.
              clearTimeout(saveTimer.current);
              saveTimer.current = undefined;
              const fresh = await window.mentor.wipeAll();
              setState(fresh);
              setContext([]);
              announce('Alle lokalen Daten gelöscht.');
            }}
            announce={announce}
          />
        )}
      </main>

      <div className="sr-only" role="status" aria-live="polite" data-testid="live">
        {message}
      </div>
    </div>
  );
}
