import { describe, expect, it } from 'vitest';
import { redact } from '../../src/core/redaction';

describe('redact', () => {
  it('removes common secrets and keeps surrounding text', () => {
    const input = [
      'ANTHROPIC_API_KEY=sk-ant-api03-abcdefghijklmnopqrstuvwxyz',
      'token ghp_abcdefghijklmnopqrstuvwxyz0123456789',
      'aws AKIAIOSFODNN7EXAMPLE',
      'Authorization: Bearer abcdefghijklmnopqrstuvwxyz123456',
      'db postgres://admin:hunter2secret@db.local:5432/app',
      'password: "correct horse battery"',
      'mail max.mustermann@example.com',
    ].join('\n');
    const { text, total, findings } = redact(input);
    expect(text).not.toMatch(/sk-ant-api03|ghp_abc|AKIAIOSFODNN7|hunter2secret|max\.mustermann|correct horse/);
    expect(text).toContain('ANTHROPIC_API_KEY=');
    expect(text).toContain('postgres://admin:[REDACTED:password]@db.local');
    expect(text).toContain('Authorization: Bearer [REDACTED:token]');
    expect(total).toBeGreaterThanOrEqual(7);
    expect(findings.map((f) => f.kind)).toEqual(expect.arrayContaining(['anthropic-key', 'github-token', 'aws-access-key', 'email']));
  });

  it('redacts private key blocks entirely', () => {
    const { text } = redact('a\n-----BEGIN RSA PRIVATE KEY-----\nMIIEow\nxyz\n-----END RSA PRIVATE KEY-----\nb');
    expect(text).toBe('a\n[REDACTED:private-key]\nb');
  });

  it('leaves ordinary code untouched', () => {
    const code = 'function sum(a, b) {\n  return a + b; // password check happens elsewhere\n}';
    const res = redact(code);
    expect(res.text).toBe(code);
    expect(res.total).toBe(0);
  });

  it('catches secrets found missing in review round 1', () => {
    const cases = [
      'stripe sk_live_51HxAbCdEfGhIjKlMnOp',
      'NPM_TOKEN=npm_abcdefghijklmnopqrstuvwxyz0123456789',
      'gitlab glpat-abcdefghij0123456789xy',
      'Authorization: Basic YWRtaW46c3VwZXJzZWNyZXQ=',
      'curl -u admin:s3cretpass https://x',
      'TOKEN=3f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c',
      'password: "my secret pass"',
    ];
    for (const c of cases) {
      const res = redact(c);
      expect(res.total, c).toBeGreaterThan(0);
      expect(res.text).not.toMatch(/51HxAbCd|npm_abc|glpat-abc|YWRtaW46|s3cretpass|3f9a8b7c|my secret pass/);
    }
  });

  it('keeps ordinary code that merely mentions secrets', () => {
    const code = [
      'const password = getPassword(user);',
      'secretKey: string;',
      'const password_hash = bcrypt(pw);',
      'const apiKey = process.env.API_KEY;',
      'maxTokens: 16000,',
      'git clone git@github.com:org/repo.git',
      'const id = "AB12CDEF1234GHIJ5678";',
    ].join('\n');
    expect(redact(code).text).toBe(code);
  });

  it('round 2: config-style secrets without digits and CLI password flags', () => {
    const cases: Array<[string, string]> = [
      ['DB_PASSWORD=correcthorsebatterystaple', 'correcthorse'],
      ['password: correcthorse', 'correcthorse'],
      ['export API_TOKEN=abcdefghij', 'abcdefghij'],
      ['docker login -u me -p hunter2pass registry', 'hunter2pass'],
      ['mysql -uroot -pS3cret db', 'S3cret'],
      ['curl -u "admin:my pass" https://x', 'my pass'],
    ];
    for (const [input, secret] of cases) expect(redact(input).text, input).not.toContain(secret);
  });

  it('round 2: no false positives on names that only contain a secret word', () => {
    const code = [
      'tokenizer = "cl100k_base"',
      'tokenType: "Bearer"',
      'csrfToken: "{{ csrf_token }}"',
      'passwordLabel = "Passwort eingeben"',
      'TOKEN_URL="https://example.org/token"',
      'secretName: "prod-db-credentials"',
      'pwd = /home/user1/project',
      'This API uses Basic authentication with every request.',
      'const password = userInput;',
      'psql -h db -p 5432 app',
      'password: string;',
    ].join('\n');
    expect(redact(code).text).toBe(code);
  });

  it('round 2: stays fast on adversarial input (no catastrophic backtracking)', () => {
    const inputs = ['a-token-'.repeat(12_500), 'ab-cd-ef-gh-'.repeat(8_000), 'x'.repeat(100_000), 'password'.repeat(12_500), 'a_b-'.repeat(25_000)];
    for (const input of inputs) {
      const t = performance.now();
      redact(input);
      expect(performance.now() - t, input.slice(0, 12)).toBeLessThan(1_000);
    }
  });

  it('redacts a valid IBAN', () => {
    expect(redact('IBAN DE89 3704 0044 0532 0130 00').text).toBe('IBAN [REDACTED:iban]');
  });

  it('is idempotent', () => {
    const once = redact('api_key = "abcd1234efgh"').text;
    expect(redact(once).text).toBe(once);
  });
});
