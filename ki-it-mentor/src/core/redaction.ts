// Secret/PII redaction. Runs before anything is logged, stored from integrations,
// or sent to a provider. Pattern-based: it reduces risk, it cannot guarantee
// that every secret is found (documented in SECURITY.md).

import type { RedactionFinding } from './types';

interface Rule {
  kind: string;
  pattern: RegExp;
  /** Replacement; `$1`/`$2` keep captured parts such as `password=` or a quote. */
  replace: string;
  /** Optional check on the full match; false keeps the text unchanged. */
  validate?: (match: string) => boolean;
}

// Names that mark a value as secret. Matched inside identifiers (dbPassword, API_TOKEN).
const SECRET_NAME = String.raw`[\w-]*(?:password|passwd|pwd|secret|token|api[_-]?key|access[_-]?key|private[_-]?key|client[_-]?secret)[\w-]*`;

/** ISO 13616 mod-97 check — avoids treating arbitrary IDs as IBANs. */
function isValidIban(raw: string): boolean {
  const iban = raw.replace(/\s+/g, '').toUpperCase();
  if (iban.length < 15 || iban.length > 34) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const ch of rearranged) {
    const value = ch >= 'A' && ch <= 'Z' ? String(ch.charCodeAt(0) - 55) : ch;
    for (const digit of value) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

const RULES: Rule[] = [
  {
    kind: 'private-key',
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
    replace: '[REDACTED:private-key]',
  },
  { kind: 'anthropic-key', pattern: /\bsk-ant-[A-Za-z0-9_-]{10,}/g, replace: '[REDACTED:anthropic-key]' },
  { kind: 'openai-key', pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}/g, replace: '[REDACTED:api-key]' },
  { kind: 'stripe-key', pattern: /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}/g, replace: '[REDACTED:stripe-key]' },
  { kind: 'npm-token', pattern: /\bnpm_[A-Za-z0-9]{36}\b/g, replace: '[REDACTED:npm-token]' },
  { kind: 'gitlab-token', pattern: /\bglpat-[\w-]{20,}/g, replace: '[REDACTED:gitlab-token]' },
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
  { kind: 'basic-auth', pattern: /(\bBasic\s+)[A-Za-z0-9+/]{12,}={0,2}/g, replace: '$1[REDACTED:basic-auth]' },
  { kind: 'cli-credentials', pattern: /(\s(?:-u|--user)\s+['"]?[^\s:'"]+:)[^\s'"]+/g, replace: '$1[REDACTED:password]' },
  {
    kind: 'url-credentials',
    pattern: /(\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@]+:)[^\s@/]+(@)/gi,
    replace: '$1[REDACTED:password]$2',
  },
  {
    // password = "my secret pass", "apiKey": 'abc…' — quoted values may contain spaces.
    kind: 'secret-assignment',
    pattern: new RegExp(String.raw`(\b${SECRET_NAME}["']?\s*[:=]\s*)(["'])(?!\[REDACTED)(?:(?!\2).){6,}\2`, 'gi'),
    replace: '$1$2[REDACTED:secret]$2',
  },
  {
    // TOKEN=3f9a…, password: hunter2 — unquoted values only when they mix letters and digits,
    // so code such as `password = getPassword(user)`, `secretKey: string` or `maxTokens: 16000` stays intact.
    kind: 'secret-assignment',
    pattern: new RegExp(
      String.raw`(\b${SECRET_NAME}\s*[:=]\s*)(?!\[REDACTED|process\.env)(?=[^\s"',;()]*\d)(?=[^\s"',;()]*[A-Za-z])[^\s"',;()\[\]{}]{6,}(?![\w(])`,
      'gi',
    ),
    replace: '$1[REDACTED:secret]',
  },
  // git@github.com:org/repo is an SSH remote, not a person's address.
  { kind: 'email', pattern: /\b(?!git@)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, replace: '[REDACTED:email]' },
  { kind: 'iban', pattern: /\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){3,7}(?: ?[A-Z0-9]{1,3})?\b/g, replace: '[REDACTED:iban]', validate: isValidIban },
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
      const match = args[0] as string;
      if (rule.validate && !rule.validate(match)) return match;
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
