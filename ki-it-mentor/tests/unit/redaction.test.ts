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

  it('is idempotent', () => {
    const once = redact('api_key = "abcd1234efgh"').text;
    expect(redact(once).text).toBe(once);
  });
});
