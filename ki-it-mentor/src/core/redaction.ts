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

// Secret-bearing names must END with one of these words (dbPassword, API_TOKEN, apiKey),
// so tokenizer, tokenType, passwordLabel or TOKEN_URL are not treated as secrets.
const SECRET_NAME_END = /(?:password|passwd|pwd|secret|token|api[_-]?key|access[_-]?key|private[_-]?key|client[_-]?secret)$/i;
// Values that are code or configuration references, not secrets.
const NON_SECRET_VALUE = /^(?:\{\{|\$\{|\$[A-Za-z_]|https?:\/\/|[./~]|process\.env|string$|number$|boolean$|any$|unknown$|null$|undefined$|true$|false$|\[REDACTED)/i;

/**
 * Linear-time scan for `name = value` / `name: value` / `"name": "value"`.
 * Names are bounded identifiers (no nested quantifiers → no catastrophic backtracking);
 * whether the name is secret-bearing is decided in the replacer, not in the regex.
 */
const ASSIGNMENT = /(?<![\w-])([A-Za-z_][\w-]{0,63})(["']?[ \t]*[:=][ \t]*)(?:(["'])([^"'\n]{1,300}?)\3|([^\s"',;()[\]{}]{4,300})(?![\w(]))/g;

function redactAssignments(text: string, count: (kind: string) => void): string {
  return text.replace(ASSIGNMENT, (match: string, name: string, sep: string, quote: string | undefined, quoted: string | undefined, bare: string | undefined, offset: number) => {
    if (!SECRET_NAME_END.test(name)) return match;
    const value = quoted ?? bare ?? '';
    if (NON_SECRET_VALUE.test(value)) return match;
    if (quoted !== undefined) {
      if (value.length < 4) return match;
      count('secret-assignment');
      return `${name}${sep}${quote}[REDACTED:secret]${quote}`;
    }
    // Unquoted: config-style lines (`DB_PASSWORD=…`, `password: …` at line start) are always
    // secrets; inside code we require letters AND digits so `password = userInput` stays readable.
    const lineStart = text.lastIndexOf('\n', offset - 1) + 1;
    const configLine = /^\s*(?:export\s+)?$/.test(text.slice(lineStart, offset));
    const screaming = /^[A-Z0-9_]+$/.test(name);
    if (!configLine && !screaming && !(/\d/.test(value) && /[A-Za-z]/.test(value))) return match;
    count('secret-assignment');
    return `${name}${sep}[REDACTED:secret]`;
  });
}

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
  // Only in an Authorization header, so prose like "uses Basic authentication" stays.
  { kind: 'basic-auth', pattern: /(\bAuthorization:[ \t]*Basic[ \t]+)[A-Za-z0-9+/]{8,}={0,2}/gi, replace: '$1[REDACTED:basic-auth]' },
  { kind: 'cli-credentials', pattern: /(\s(?:-u|--user)[ \t]+(["'])[^"':\n]{1,100}:)[^"'\n]{1,200}(\2)/g, replace: '$1[REDACTED:password]$3' },
  { kind: 'cli-credentials', pattern: /(\s(?:-u|--user)[ \t]+[^\s:'"]{1,100}:)[^\s'"]{1,200}/g, replace: '$1[REDACTED:password]' },
  {
    // mysql -pS3cret, mysql -p S3cret, docker login -p pass, --password=pass (psql -p is a port: excluded)
    kind: 'cli-credentials',
    pattern: /(\b(?:mysql|mysqldump|mariadb|docker[ \t]+login)\b[^\n]{0,200}?[ \t](?:-p[ \t]?|--password[= ]))([^\s'"-][^\s'"]{2,200})/g,
    replace: '$1[REDACTED:password]',
  },
  {
    kind: 'url-credentials',
    pattern: /((?<![a-z0-9+.-])[a-z][a-z0-9+.-]{0,30}:\/\/[^\s:/@]{1,256}:)[^\s@/]{1,256}(@)/gi,
    replace: '$1[REDACTED:password]$2',
  },
  // git@github.com:org/repo is an SSH remote, not a person's address.
  // Lookbehind anchors matching to the start of a run → linear time on long word chains.
  { kind: 'email', pattern: /(?<![A-Za-z0-9._%+-])(?!git@)[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,24}\b/g, replace: '[REDACTED:email]' },
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
  const count = (kind: string) => counts.set(kind, (counts.get(kind) ?? 0) + 1);
  for (const rule of RULES) {
    text = text.replace(rule.pattern, (...args: unknown[]) => {
      const match = args[0] as string;
      if (rule.validate && !rule.validate(match)) return match;
      count(rule.kind);
      const groups = args.slice(1, -2) as Array<string | undefined>;
      return rule.replace.replace(/\$(\d)/g, (_m, n: string) => groups[Number(n) - 1] ?? '');
    });
  }
  text = redactAssignments(text, count);
  const findings = [...counts.entries()].map(([kind, count]) => ({ kind, count }));
  return { text, findings, total: findings.reduce((sum, f) => sum + f.count, 0) };
}

/** Convenience for log lines and integration payloads. */
export function redactText(input: string): string {
  return redact(input).text;
}
