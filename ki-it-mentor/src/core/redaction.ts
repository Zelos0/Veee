// Secret/PII redaction. Runs before anything is logged, stored from integrations,
// or sent to a provider. Pattern-based: it reduces risk, it cannot guarantee
// that every secret is found (documented in SECURITY.md).

import type { RedactionFinding } from './types';

interface Rule {
  kind: string;
  pattern: RegExp;
  /** Replacement; `$1` keeps a captured prefix such as `password=`. */
  replace: string;
}

const RULES: Rule[] = [
  {
    kind: 'private-key',
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
    replace: '[REDACTED:private-key]',
  },
  { kind: 'anthropic-key', pattern: /\bsk-ant-[A-Za-z0-9_-]{10,}/g, replace: '[REDACTED:anthropic-key]' },
  { kind: 'openai-key', pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}/g, replace: '[REDACTED:api-key]' },
  { kind: 'github-token', pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})/g, replace: '[REDACTED:github-token]' },
  { kind: 'aws-access-key', pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g, replace: '[REDACTED:aws-key]' },
  { kind: 'slack-token', pattern: /\bxox[abprs]-[A-Za-z0-9-]{10,}/g, replace: '[REDACTED:slack-token]' },
  { kind: 'google-api-key', pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g, replace: '[REDACTED:google-key]' },
  {
    kind: 'jwt',
    pattern: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g,
    replace: '[REDACTED:jwt]',
  },
  { kind: 'bearer-token', pattern: /(\bBearer\s+)[A-Za-z0-9._~+/=-]{16,}/gi, replace: '$1[REDACTED:token]' },
  {
    kind: 'url-credentials',
    pattern: /(\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@]+:)[^\s@/]+(@)/gi,
    replace: '$1[REDACTED:password]$2',
  },
  {
    kind: 'secret-assignment',
    // password=..., "api_key": "...", SECRET: ... — keeps the key name, drops the value.
    pattern:
      /(\b[\w-]*(?:password|passwd|pwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret)[\w-]*["']?\s*[:=]\s*["']?)(?!\[REDACTED)[^\s"',;]{4,}/gi,
    replace: '$1[REDACTED:secret]',
  },
  { kind: 'email', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, replace: '[REDACTED:email]' },
  { kind: 'iban', pattern: /\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){3,7}(?: ?[A-Z0-9]{1,3})?\b/g, replace: '[REDACTED:iban]' },
];

export interface RedactionResult {
  text: string;
  findings: RedactionFinding[];
  total: number;
}

export function redact(input: string): RedactionResult {
  let text = input;
  const counts = new Map<string, number>();
  for (const rule of RULES) {
    text = text.replace(rule.pattern, (...args: unknown[]) => {
      counts.set(rule.kind, (counts.get(rule.kind) ?? 0) + 1);
      const groups = args.slice(1, -2) as Array<string | undefined>;
      return rule.replace.replace(/\$(\d)/g, (_m, n: string) => groups[Number(n) - 1] ?? '');
    });
  }
  const findings = [...counts.entries()].map(([kind, count]) => ({ kind, count }));
  return { text, findings, total: findings.reduce((sum, f) => sum + f.count, 0) };
}

/** Convenience for log lines and integration payloads. */
export function redactText(input: string): string {
  return redact(input).text;
}
