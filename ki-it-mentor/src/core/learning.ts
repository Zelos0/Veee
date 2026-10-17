// Learning Engine: status model, evidence-driven transitions, spaced repetition,
// and exercise evaluation. Reading an explanation alone never proves mastery:
// it can at most move a topic to `introduced`.

export type LearningStatus =
  | 'unseen'
  | 'introduced'
  | 'explained_back'
  | 'applied_guided'
  | 'applied_independently'
  | 'needs_review';

export const STATUS_LABELS: Record<LearningStatus, string> = {
  unseen: 'Neu',
  introduced: 'Eingeführt',
  explained_back: 'Selbst erklärt',
  applied_guided: 'Angeleitet angewendet',
  applied_independently: 'Selbstständig angewendet',
  needs_review: 'Wiederholen',
};

const STATUS_RANK: Record<LearningStatus, number> = {
  unseen: 0,
  needs_review: 1,
  introduced: 1,
  explained_back: 2,
  applied_guided: 3,
  applied_independently: 4,
};

export type LearningEvidence =
  | { kind: 'explanation_viewed' }
  | { kind: 'explain_back'; passed: boolean }
  | { kind: 'guided_exercise'; passed: boolean }
  | { kind: 'independent_exercise'; passed: boolean };

export interface TopicProgress {
  topicId: string;
  status: LearningStatus;
  /** Highest status ever reached — used to restore after a successful review. */
  best: LearningStatus;
  attempts: number;
  successes: number;
  /** Index into REVIEW_INTERVALS_DAYS. */
  intervalIndex: number;
  lastPracticedAt?: string;
  nextReviewAt?: string;
}

/** Expanding intervals (days). Simple and explainable; not a full FSRS model. */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 16, 35];

const DAY_MS = 86_400_000;

export function initialProgress(topicId: string): TopicProgress {
  return { topicId, status: 'unseen', best: 'unseen', attempts: 0, successes: 0, intervalIndex: 0 };
}

function higher(a: LearningStatus, b: LearningStatus): LearningStatus {
  return STATUS_RANK[a] >= STATUS_RANK[b] ? a : b;
}

const TARGET: Record<Exclude<LearningEvidence['kind'], 'explanation_viewed'>, LearningStatus> = {
  explain_back: 'explained_back',
  guided_exercise: 'applied_guided',
  independent_exercise: 'applied_independently',
};

export function applyEvidence(progress: TopicProgress, evidence: LearningEvidence, now = new Date()): TopicProgress {
  if (evidence.kind === 'explanation_viewed') {
    // Reading is exposure, not proof. Only unseen → introduced.
    return progress.status === 'unseen' ? { ...progress, status: 'introduced', best: higher(progress.best, 'introduced') } : progress;
  }

  const attempts = progress.attempts + 1;
  const lastPracticedAt = now.toISOString();

  if (!evidence.passed) {
    const hadMastery = STATUS_RANK[progress.best] >= STATUS_RANK.explained_back;
    return {
      ...progress,
      attempts,
      lastPracticedAt,
      status: hadMastery ? 'needs_review' : progress.status === 'unseen' ? 'introduced' : progress.status,
      intervalIndex: 0,
      nextReviewAt: new Date(now.getTime() + REVIEW_INTERVALS_DAYS[0]! * DAY_MS).toISOString(),
    };
  }

  const reached = TARGET[evidence.kind];
  const wasReview = progress.status === 'needs_review';
  const best = higher(progress.best, reached);
  const intervalIndex = Math.min(progress.intervalIndex + (wasReview ? 0 : 1), REVIEW_INTERVALS_DAYS.length - 1);
  return {
    ...progress,
    attempts,
    successes: progress.successes + 1,
    lastPracticedAt,
    // A passed review restores the best level reached earlier.
    status: wasReview ? best : higher(progress.status, reached),
    best,
    intervalIndex,
    nextReviewAt: new Date(now.getTime() + REVIEW_INTERVALS_DAYS[intervalIndex]! * DAY_MS).toISOString(),
  };
}

/** Topics whose review date passed are shown as due; status flips to needs_review. */
export function refreshDue(progress: TopicProgress, now = new Date()): TopicProgress {
  if (!progress.nextReviewAt || progress.status === 'needs_review' || progress.status === 'unseen') return progress;
  return new Date(progress.nextReviewAt).getTime() <= now.getTime() ? { ...progress, status: 'needs_review' } : progress;
}

export function isDue(progress: TopicProgress, now = new Date()): boolean {
  return refreshDue(progress, now).status === 'needs_review';
}

// ---------------------------------------------------------------- exercises

export type ExerciseKind = 'explain-back' | 'multiple-choice' | 'guided';

export interface Exercise {
  id: string;
  topicId: string;
  kind: ExerciseKind;
  prompt: string;
  /** multiple-choice */
  options?: string[];
  correctIndex?: number;
  /** explain-back / guided: concepts a good answer mentions (synonyms separated by |). */
  rubric?: string[];
  hints?: string[];
  /** Explanation shown after answering. */
  solution: string;
}

export interface Evaluation {
  passed: boolean;
  score: number;
  feedback: string;
  matched: string[];
  missing: string[];
  method: 'exact' | 'rubric-heuristic';
}

function normalise(text: string): string {
  return text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
}

export function evaluateAnswer(exercise: Exercise, answer: string | number, usedHints = 0): Evaluation {
  if (exercise.kind === 'multiple-choice') {
    const passed = Number(answer) === exercise.correctIndex;
    return {
      passed,
      score: passed ? 1 : 0,
      feedback: passed ? 'Richtig.' : `Nicht ganz. ${exercise.solution}`,
      matched: [],
      missing: [],
      method: 'exact',
    };
  }

  const text = normalise(String(answer));
  const rubric = exercise.rubric ?? [];
  const matched: string[] = [];
  const missing: string[] = [];
  for (const concept of rubric) {
    const variants = concept.split('|').map((v) => normalise(v.trim()));
    (variants.some((v) => v && text.includes(v)) ? matched : missing).push(concept.split('|')[0]!.trim());
  }
  const words = text.split(/\s+/).filter(Boolean).length;
  const coverage = rubric.length ? matched.length / rubric.length : 0;
  // Hints lower the score a little: guided success is still success, but less evidence.
  const score = Math.max(0, coverage - usedHints * 0.1);
  const passed = words >= 6 && score >= 0.6;
  const feedback = passed
    ? `Gut erklärt. Abgedeckt: ${matched.join(', ')}.${missing.length ? ` Ergänzen könntest du: ${missing.join(', ')}.` : ''}`
    : words < 6
      ? 'Bitte in mindestens einem ganzen Satz mit eigenen Worten erklären.'
      : `Noch nicht ausreichend. Es fehlen: ${missing.join(', ')}. ${exercise.solution}`;
  return { passed, score, feedback, matched, missing, method: 'rubric-heuristic' };
}

/** Maps an exercise result to learning evidence. */
export function evidenceFor(exercise: Exercise, evaluation: Evaluation, usedHints: number): LearningEvidence {
  if (exercise.kind === 'explain-back') return { kind: 'explain_back', passed: evaluation.passed };
  if (exercise.kind === 'guided' || usedHints > 0) return { kind: 'guided_exercise', passed: evaluation.passed };
  return { kind: 'independent_exercise', passed: evaluation.passed };
}
