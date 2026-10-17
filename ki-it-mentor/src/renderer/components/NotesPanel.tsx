import { useState } from 'react';
import { topicById } from '../../core/curriculum';
import type { MentorState } from '../../core/knowledge';
import { Markdown } from './Markdown';

export function NotesPanel(props: {
  state: MentorState;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  announce: (m: string) => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const notes = props.state.notes;

  const exportAs = async (format: 'json' | 'md') => {
    const res = await window.mentor.exportNotes(format);
    props.announce(res.saved ? `Exportiert nach ${res.path}` : 'Export abgebrochen.');
  };

  return (
    <div className="pad">
      <div className="row">
        <h2 className="section-title" style={{ margin: 0 }}>
          Lernnotizen · {notes.length}
        </h2>
        <span className="spacer" />
        <button type="button" className="btn ghost" onClick={() => void exportAs('md')} disabled={!notes.length}>
          Export .md
        </button>
        <button type="button" className="btn ghost" onClick={() => void exportAs('json')} disabled={!notes.length}>
          Export .json
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="muted">Noch keine Notizen. Speichere eine Antwort oder Übungslösung mit „Als Notiz speichern“.</p>
      ) : (
        <ul className="list">
          {notes.map((n) => (
            <li key={n.id} className="card">
              <div className="row">
                <h3 style={{ flex: 1 }}>{n.title}</h3>
                <button type="button" className="btn ghost" aria-expanded={open === n.id} onClick={() => setOpen(open === n.id ? null : n.id)}>
                  {open === n.id ? 'Zuklappen' : 'Öffnen'}
                </button>
                {confirmId === n.id ? (
                  <>
                    <button
                      type="button"
                      className="btn danger"
                      onClick={() => {
                        props.onDelete(n.id);
                        setConfirmId(null);
                        props.announce('Notiz gelöscht.');
                      }}
                    >
                      Wirklich löschen
                    </button>
                    <button type="button" className="btn ghost" onClick={() => setConfirmId(null)}>
                      Behalten
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn ghost" aria-label={`Notiz löschen: ${n.title}`} onClick={() => setConfirmId(n.id)}>
                    Löschen
                  </button>
                )}
              </div>
              <span className="faint mono" style={{ fontSize: 'var(--fs-xs)' }}>
                {new Date(n.createdAt).toLocaleString('de-DE')}
                {n.topicId ? ` · ${topicById(n.topicId)?.title ?? n.topicId}` : ''}
                {n.sources.length ? ` · Quellen: ${n.sources.join(', ')}` : ''}
              </span>
              {open === n.id && <Markdown text={n.body} />}
            </li>
          ))}
        </ul>
      )}

      {notes.length > 0 && (
        <div className="row">
          {confirmAll ? (
            <>
              <span>Alle {notes.length} Notizen endgültig löschen?</span>
              <button
                type="button"
                className="btn danger"
                onClick={() => {
                  props.onDeleteAll();
                  setConfirmAll(false);
                  props.announce('Alle Notizen gelöscht.');
                }}
              >
                Ja, alle löschen
              </button>
              <button type="button" className="btn ghost" onClick={() => setConfirmAll(false)}>
                Abbrechen
              </button>
            </>
          ) : (
            <button type="button" className="btn danger" onClick={() => setConfirmAll(true)}>
              Alle Notizen löschen
            </button>
          )}
        </div>
      )}
    </div>
  );
}
