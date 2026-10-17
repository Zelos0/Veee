import { describe, expect, it } from 'vitest';
import { EXERCISES, TOPICS, exercisesFor } from '../../src/core/curriculum';
import { REVIEW_INTERVALS_DAYS, applyEvidence, evaluateAnswer, evidenceFor, initialProgress, isDue, refreshDue } from '../../src/core/learning';

const t0 = new Date('2026-10-01T10:00:00Z');
const days = (n: number) => new Date(t0.getTime() + n * 86_400_000);

describe('learning status', () => {
  it('reading only reaches "introduced"', () => {
    let p = initialProgress('git-commit');
    p = applyEvidence(p, { kind: 'explanation_viewed' }, t0);
    p = applyEvidence(p, { kind: 'explanation_viewed' }, t0);
    expect(p.status).toBe('introduced');
    expect(p.attempts).toBe(0);
  });

  it('climbs only through passed exercises', () => {
    let p = applyEvidence(initialProgress('x'), { kind: 'explain_back', passed: true }, t0);
    expect(p.status).toBe('explained_back');
    p = applyEvidence(p, { kind: 'guided_exercise', passed: true }, t0);
    expect(p.status).toBe('applied_guided');
    p = applyEvidence(p, { kind: 'independent_exercise', passed: true }, t0);
    expect(p.status).toBe('applied_independently');
    // An easier success never lowers the status.
    p = applyEvidence(p, { kind: 'explain_back', passed: true }, t0);
    expect(p.status).toBe('applied_independently');
  });

  it('a failure after mastery requires review; a passed review restores the best level', () => {
    let p = applyEvidence(initialProgress('x'), { kind: 'guided_exercise', passed: true }, t0);
    p = applyEvidence(p, { kind: 'independent_exercise', passed: false }, t0);
    expect(p.status).toBe('needs_review');
    expect(p.intervalIndex).toBe(0);
    p = applyEvidence(p, { kind: 'explain_back', passed: true }, t0);
    expect(p.status).toBe('applied_guided');
  });

  it('a failure without prior mastery does not punish a beginner', () => {
    const p = applyEvidence(initialProgress('x'), { kind: 'explain_back', passed: false }, t0);
    expect(p.status).toBe('introduced');
  });

  it('schedules expanding reviews and becomes due', () => {
    let p = applyEvidence(initialProgress('x'), { kind: 'explain_back', passed: true }, t0);
    expect(new Date(p.nextReviewAt!).getTime()).toBe(days(REVIEW_INTERVALS_DAYS[1]!).getTime());
    p = applyEvidence(p, { kind: 'guided_exercise', passed: true }, t0);
    expect(new Date(p.nextReviewAt!).getTime()).toBe(days(REVIEW_INTERVALS_DAYS[2]!).getTime());
    expect(isDue(p, days(1))).toBe(false);
    expect(isDue(p, days(8))).toBe(true);
    expect(refreshDue(p, days(8)).status).toBe('needs_review');
  });
});

describe('exercises', () => {
  it('every exercise references a known topic and is well-formed', () => {
    for (const ex of EXERCISES) {
      expect(TOPICS.some((t) => t.id === ex.topicId)).toBe(true);
      if (ex.kind === 'multiple-choice') expect(ex.options![ex.correctIndex!]).toBeDefined();
      else expect(ex.rubric!.length).toBeGreaterThan(0);
    }
  });

  it('multiple choice is exact', () => {
    const ex = exercisesFor('git-commit').find((e) => e.kind === 'multiple-choice')!;
    expect(evaluateAnswer(ex, ex.correctIndex!).passed).toBe(true);
    expect(evaluateAnswer(ex, (ex.correctIndex! + 1) % 4).passed).toBe(false);
  });

  it('explain-back uses the rubric and needs a real sentence', () => {
    const ex = exercisesFor('git-commit').find((e) => e.kind === 'explain-back')!;
    expect(evaluateAnswer(ex, 'commit').passed).toBe(false);
    const good = evaluateAnswer(ex, 'Damit kann ich gezielt auswählen, welche Änderungen in den nächsten Commit kommen.');
    expect(good.passed).toBe(true);
    expect(good.method).toBe('rubric-heuristic');
    const weak = evaluateAnswer(ex, 'Das ist ein Ort in Git wo Dateien liegen bevor etwas passiert.');
    expect(weak.passed).toBe(false);
    expect(weak.missing.length).toBeGreaterThan(0);
  });

  it('hints turn independent success into guided evidence', () => {
    const ex = exercisesFor('sql-injection')[0]!;
    const evaluation = evaluateAnswer(ex, 'Die Benutzer-Eingabe wird als Code ausgeführt; ein Prepared Statement mit Parameter verhindert das.', 1);
    expect(evaluation.passed).toBe(true);
    expect(evidenceFor(ex, evaluation, 1)).toEqual({ kind: 'guided_exercise', passed: true });
  });
});
