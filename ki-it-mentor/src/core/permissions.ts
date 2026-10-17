// Permission levels are separate and ordered. The MVP never grants `execute`:
// the mentor reads, analyses and suggests — it does not run commands or edit files.

export type PermissionLevel = 'read' | 'analyze' | 'suggest' | 'execute';

const ORDER: PermissionLevel[] = ['read', 'analyze', 'suggest', 'execute'];

/** Highest level this build can ever grant. */
export const MVP_CEILING: PermissionLevel = 'suggest';

export interface PermissionDecision {
  allowed: boolean;
  reason?: string;
}

export function rank(level: PermissionLevel): number {
  return ORDER.indexOf(level);
}

export function check(
  required: PermissionLevel,
  granted: PermissionLevel,
  ceiling: PermissionLevel = MVP_CEILING,
): PermissionDecision {
  if (rank(required) > rank(ceiling)) {
    return {
      allowed: false,
      reason: `„${required}“ ist in dieser Version gesperrt (Obergrenze: „${ceiling}“). Der Mentor schlägt nur vor; ausführen musst du selbst.`,
    };
  }
  if (rank(required) > rank(granted)) {
    return { allowed: false, reason: `Benötigt Stufe „${required}“, freigegeben ist „${granted}“.` };
  }
  return { allowed: true };
}
