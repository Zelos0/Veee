// Lernpfad: Themen nach Bereich, Statusleiter, fällige Wiederholungen, Übungen.
// Status steigt nur durch eigene Leistung (Übungen), nie durch bloßes Lesen.

import { useEffect, useMemo, useRef, useState } from 'react';
import { DOMAINS, TOPICS, exercisesFor, topicById, type Topic } from '../../core/curriculum';
import { getProgress, type MentorState } from '../../core/knowledge';
import {
  STATUS_LABELS,
  applyEvidence,
  evaluateAnswer,
  evidenceFor,
  isDue,
  refreshDue,
  type Evaluation,
  type Exercise,
  type LearningStatus,
  type TopicProgress,
} from '../../core/learning';

const LADDER: LearningStatus[] = ['introduced', 'explained_back', 'applied_guided', 'applied_independently'];

function ladderLevel(p: TopicProgress): number {
  const s = p.status === 'needs_review' ? p.best : p.status;
  return LADDER.indexOf(s) + 1;
}

function Ladder({ progress }: { progress: TopicProgress }) {
  const level = ladderLevel(progress);
  return (
    <span className={`ladder ${progress.status === 'needs_review' ? 'review' : ''}`} aria-hidden="true">
      {LADDER.map((s, i) => (
        <i key={s} className={i < level ? 'on' : ''} />
      ))}
    </span>
  );
}

export function LearnPanel(props: {
  state: MentorState;
  onProgress: (p: TopicProgress) => void;
  onExplain: (topic: Topic) => void;
  onSaveNote: (title: string, body: string, topicId: string) => void;
  announce: (m: string) => void;
}) {
  const [topicId, setTopicId] = useState<string | null>(null);
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const now = new Date();

  // Return focus to the row of the topic we came back from.
  useEffect(() => {
    if (!topicId && returnTo) document.getElementById(`topic-${returnTo}`)?.focus();
  }, [topicId, returnTo]);

  const due = useMemo(() => TOPICS.filter((t) => isDue(getProgress(props.state, t.id), now)), [props.state]); // eslint-disable-line react-hooks/exhaustive-deps

  if (topicId) {
    const topic = topicById(topicId)!;
    return (
      <TopicDetail
        topic={topic}
        progress={refreshDue(getProgress(props.state, topic.id))}
        onBack={() => {
          setReturnTo(topicId);
          setTopicId(null);
        }}
        onProgress={props.onProgress}
        onExplain={() => props.onExplain(topic)}
        onSaveNote={(title, body) => props.onSaveNote(title, body, topic.id)}
        announce={props.announce}
      />
    );
  }

  return (
    <div className="learn">
      <p className="faint" style={{ margin: 0, fontSize: 'var(--fs-xs)' }}>
        Leiter: 1 Eingeführt · 2 Selbst erklärt · 3 Angeleitet angewendet · 4 Selbstständig angewendet. Aufsteigen nur durch Übungen.
      </p>
      {due.length > 0 && (
        <section aria-label="Fällige Wiederholungen">
          <h2 className="section-title due">Fällig zur Wiederholung · {due.length}</h2>
          <TopicList topics={due} state={props.state} onOpen={setTopicId} />
        </section>
      )}
      {DOMAINS.map((domain) => {
        const topics = TOPICS.filter((t) => t.domain === domain);
        if (!topics.length) return null;
        return (
          <section key={domain} aria-label={domain}>
            <h2 className="section-title">{domain}</h2>
            <TopicList topics={topics} state={props.state} onOpen={setTopicId} />
          </section>
        );
      })}
      <p className="faint" style={{ fontSize: 'var(--fs-xs)', margin: 0 }}>
        Weitere Bereiche ({DOMAINS.filter((d) => !TOPICS.some((t) => t.domain === d)).join(', ') || '—'}) sind angelegt, aber noch ohne Themen.
      </p>
    </div>
  );
}

function TopicList({ topics, state, onOpen }: { topics: Topic[]; state: MentorState; onOpen: (id: string) => void }) {
  return (
    <ul className="topic-list">
      {topics.map((t) => {
        const p = refreshDue(getProgress(state, t.id));
        const exercises = exercisesFor(t.id).length;
        return (
          <li key={t.id}>
            <button type="button" id={`topic-${t.id}`} className="topic-row" onClick={() => onOpen(t.id)} aria-label={`${t.title}, Status: ${STATUS_LABELS[p.status]}`}>
              <span>{t.title}</span>
              <span className="st">
                <Ladder progress={p} />
                <span className={p.status === 'needs_review' ? 'due' : ''}>{STATUS_LABELS[p.status]}</span>
              </span>
              <span className="dom">{exercises ? `${exercises} Übung${exercises === 1 ? '' : 'en'}` : 'nur Erklärung'}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function TopicDetail(props: {
  topic: Topic;
  progress: TopicProgress;
  onBack: () => void;
  onProgress: (p: TopicProgress) => void;
  onExplain: () => void;
  onSaveNote: (title: string, body: string) => void;
  announce: (m: string) => void;
}) {
  const { topic, progress } = props;
  const exercises = exercisesFor(topic.id);
  const [active, setActive] = useState<Exercise | null>(null);
  const [levelUp, setLevelUp] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);

  return (
    <div className="learn">
      <div className="row">
        <button type="button" className="btn ghost" onClick={props.onBack}>
          ← Alle Themen
        </button>
      </div>
      <header style={{ display: 'grid', gap: 'var(--s1)' }}>
        <span className="mono faint" style={{ fontSize: 'var(--fs-xs)' }}>{topic.domain}</span>
        <h2 ref={headingRef} tabIndex={-1} style={{ margin: 0, fontSize: 'var(--fs-lg)' }}>
          {topic.title}
        </h2>
        <p className="muted" style={{ margin: 0 }}>{topic.summary}</p>
        <div className="row" style={{ fontSize: 'var(--fs-sm)' }}>
          <Ladder progress={progress} />
          <span>{STATUS_LABELS[progress.status]}</span>
          <span className="faint mono">
            {progress.successes}/{progress.attempts} gelöst
            {progress.nextReviewAt ? ` · nächste Wiederholung ${new Date(progress.nextReviewAt).toLocaleDateString('de-DE')}` : ''}
          </span>
          {levelUp && (
            <span className="level-up" key={levelUp}>
              {levelUp}
            </span>
          )}
        </div>
      </header>
      <div className="row">
        <button type="button" className="btn" onClick={props.onExplain}>
          Vom Mentor erklären lassen
        </button>
        <span className="faint" style={{ fontSize: 'var(--fs-xs)' }}>Lesen zählt als „Eingeführt“, nicht als „Beherrscht“.</span>
      </div>

      {active ? (
        <ExerciseRunner
          key={active.id}
          exercise={active}
          onDone={(evaluation, usedHints) => {
            const next = applyEvidence(progress, evidenceFor(active, evaluation, usedHints));
            props.onProgress(next);
            setLevelUp(ladderLevel(next) > ladderLevel(progress) ? `↑ ${STATUS_LABELS[next.status]}` : null);
            props.announce(
              `${evaluation.passed ? 'Bestanden' : 'Noch nicht bestanden'}. ${evaluation.feedback}${next.status !== progress.status ? ` Status: ${STATUS_LABELS[next.status]}.` : ''}`,
            );
          }}
          onSaveNote={props.onSaveNote}
          onClose={() => {
            setActive(null);
            requestAnimationFrame(() => headingRef.current?.focus());
          }}
        />
      ) : (
        <section aria-label="Übungen">
          <h3 className="section-title">Übungen</h3>
          {exercises.length === 0 ? (
            <p className="faint">Für dieses Thema gibt es noch keine Übungen. Nutze im Mentor „Teste mein Verständnis“.</p>
          ) : (
            <ul className="list">
              {exercises.map((ex) => (
                <li key={ex.id} className="card">
                  <span className="mono faint" style={{ fontSize: 'var(--fs-xs)' }}>
                    {ex.kind === 'multiple-choice' ? 'Auswahl' : ex.kind === 'explain-back' ? 'Mit eigenen Worten erklären' : 'Angeleitete Aufgabe'}
                  </span>
                  <span>{ex.prompt}</span>
                  <div className="row">
                    <button type="button" className="btn" onClick={() => setActive(ex)}>
                      Starten
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function ExerciseRunner(props: {
  exercise: Exercise;
  onDone: (evaluation: Evaluation, usedHints: number) => void;
  onSaveNote: (title: string, body: string) => void;
  onClose: () => void;
}) {
  const { exercise } = props;
  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [hints, setHints] = useState(0);
  const [result, setResult] = useState<Evaluation | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (result) feedbackRef.current?.focus();
  }, [result]);

  const submit = () => {
    const evaluation = evaluateAnswer(exercise, exercise.kind === 'multiple-choice' ? (choice ?? -1) : text, hints);
    setResult(evaluation);
    props.onDone(evaluation, hints);
  };

  return (
    <section className="exercise" aria-label="Übung">
      <strong>{exercise.prompt.split('`').map((part, i) => (i % 2 ? <code key={i} className="mono">{part}</code> : part))}</strong>
      {exercise.kind === 'multiple-choice' ? (
        <fieldset disabled={Boolean(result)}>
          <legend className="sr-only">Antwort wählen</legend>
          {exercise.options!.map((opt, i) => (
            <label key={i} className="opt">
              <input type="radio" name={exercise.id} checked={choice === i} onChange={() => setChoice(i)} />
              <span>{opt}</span>
            </label>
          ))}
        </fieldset>
      ) : (
        <textarea rows={4} aria-label="Deine Antwort" value={text} disabled={Boolean(result)} onChange={(e) => setText(e.target.value)} placeholder="Mit eigenen Worten …" />
      )}
      {exercise.hints && !result && (
        <div className="row">
          {exercise.hints.slice(0, hints).map((h) => (
            <p key={h} className="muted" style={{ margin: 0, width: '100%' }}>
              Hinweis: {h}
            </p>
          ))}
          {hints < exercise.hints.length && (
            <button type="button" className="btn ghost" onClick={() => setHints((n) => n + 1)}>
              Hinweis anzeigen ({hints}/{exercise.hints.length})
            </button>
          )}
        </div>
      )}
      {result ? (
        <>
          <div ref={feedbackRef} tabIndex={-1} className={`feedback ${result.passed ? 'pass' : 'fail'}`}>
            <strong>{result.passed ? 'Bestanden' : 'Noch nicht'}</strong> — {result.feedback}
            {result.method === 'rubric-heuristic' && (
              <div className="faint" style={{ fontSize: 'var(--fs-xs)' }}>
                Heuristische Bewertung nach Schlüsselbegriffen ({Math.round(result.score * 100)} %) — keine KI-Bewertung.
              </div>
            )}
          </div>
          <div className="row">
            <button type="button" className="btn" onClick={() => props.onSaveNote(exercise.prompt.replace(/`/g, ''), `${exercise.solution}${text ? `\n\nMeine Antwort:\n${text}` : ''}`)}>
              Als Notiz speichern
            </button>
            <button type="button" className="btn ghost" onClick={props.onClose}>
              Fertig
            </button>
          </div>
        </>
      ) : (
        <div className="row">
          <button type="button" className="btn primary" onClick={submit} disabled={exercise.kind === 'multiple-choice' ? choice === null : !text.trim()}>
            Prüfen
          </button>
          <button type="button" className="btn ghost" onClick={props.onClose}>
            Abbrechen
          </button>
        </div>
      )}
    </section>
  );
}
