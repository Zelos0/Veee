// Lokaler Demo-Anbieter: regelbasiert, offline, deterministisch — KEINE KI.
// Er macht das MVP ohne Schlüssel und ohne Netz benutzbar und testbar und sagt das
// in jeder Antwort offen. Er analysiert nur, was wirklich im Kontext steht.

import type { ActionKind, Depth, Mode, ProviderInfo, ProviderRequest, ProviderResponse } from '../types';
import { ProviderError, type Provider } from './provider';

interface CodeFacts {
  language: string;
  lines: number;
  functions: string[];
  imports: number;
  constructs: string[];
  isDiff: boolean;
  added: number;
  removed: number;
  firstLines: string[];
}

const LANGUAGE_HINTS: Array<[string, RegExp]> = [
  ['TypeScript', /\b(interface|type)\s+\w+\s*[={<]|:\s*(string|number|boolean)\b/],
  ['Python', /^\s*(def|class)\s+\w+.*:\s*$|^\s*import\s+\w+$|^\s*from\s+\S+\s+import\s/m],
  ['SQL', /\b(SELECT|INSERT|UPDATE|DELETE)\b[\s\S]*\b(FROM|INTO|SET|WHERE)\b/i],
  ['Rust', /\bfn\s+\w+\s*\(|\blet\s+mut\b|\bimpl\b/],
  ['Go', /\bfunc\s+\w+\s*\(|\bpackage\s+\w+/],
  ['Shell', /^#!.*\b(ba|z)?sh\b|^\s*(echo|export|cd|sudo)\s/m],
  ['JavaScript', /\b(function|const|let|var)\b|=>/],
];

const CONSTRUCTS: Array<[string, RegExp]> = [
  ['Verzweigungen (if/else)', /\bif\s*\(|\bif\s+\S.*:\s*$|\belse\b/m],
  ['Schleifen', /\bfor\b|\bwhile\b|\.forEach\(|\.map\(/],
  ['asynchroner Code (async/await/Promise)', /\basync\b|\bawait\b|Promise/],
  ['Fehlerbehandlung (try/catch)', /\btry\b[\s\S]*\b(catch|except)\b/],
  ['Netzwerkzugriff', /\bfetch\(|axios|requests\.|http\.|XMLHttpRequest/],
  ['Datenbankzugriff', /\b(SELECT|INSERT|UPDATE|DELETE)\b|\.query\(|\.execute\(/i],
  ['Dateisystemzugriff', /\bfs\.|open\(|readFile|writeFile/],
  ['Klassen/Objekte', /\bclass\s+\w+/],
];

export function analyzeCode(code: string): CodeFacts {
  const lines = code.split('\n');
  const isDiff = /^(diff --git|@@ |--- a\/|\+\+\+ b\/)/m.test(code);
  const functions = [
    ...code.matchAll(/\bfunction\s+(\w+)|\bdef\s+(\w+)|\bfn\s+(\w+)|\bfunc\s+(\w+)|\b(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g),
  ]
    .map((m) => m.slice(1).find(Boolean))
    .filter((name): name is string => Boolean(name));
  return {
    language: LANGUAGE_HINTS.find(([, re]) => re.test(code))?.[0] ?? 'unbekannt',
    lines: lines.length,
    functions: [...new Set(functions)].slice(0, 8),
    imports: lines.filter((l) => /^\s*(import|from\s+\S+\s+import|#include|use\s+\w+|require\()/.test(l)).length,
    constructs: CONSTRUCTS.filter(([, re]) => re.test(code)).map(([label]) => label),
    isDiff,
    added: isDiff ? lines.filter((l) => l.startsWith('+') && !l.startsWith('+++')).length : 0,
    removed: isDiff ? lines.filter((l) => l.startsWith('-') && !l.startsWith('---')).length : 0,
    firstLines: lines.filter((l) => l.trim()).slice(0, 12),
  };
}

function extract(request: ProviderRequest): { context: string; question: string } {
  const user = request.messages.filter((m) => m.role === 'user').at(-1)?.content ?? '';
  const context = [...user.matchAll(/<kontext[^>]*>\n([\s\S]*?)\n<\/kontext>/g)].map((m) => m[1] ?? '').join('\n');
  const question = /Frage: ([\s\S]*)$/.exec(user)?.[1]?.trim() ?? '';
  return { context, question };
}

function factsBlock(f: CodeFacts, depth: Depth): string {
  const rows = [
    `- Sprache (heuristisch erkannt): ${f.language}`,
    `- Umfang: ${f.lines} Zeile${f.lines === 1 ? '' : 'n'}${f.imports ? `, ${f.imports} Import(e)` : ''}`,
  ];
  if (f.functions.length) rows.push(`- Benannte Funktionen: ${f.functions.map((n) => `\`${n}\``).join(', ')}`);
  if (f.isDiff) rows.push(`- Diff: +${f.added} / −${f.removed} Zeilen`);
  if (f.constructs.length) rows.push(`- Erkannte Bausteine: ${f.constructs.join(', ')}`);
  if (depth !== 'precise') rows.push('- (Diese Liste stammt aus Mustersuche, nicht aus echtem Verständnis des Codes.)');
  return rows.join('\n');
}

function body(depth: Depth, mode: Mode, action: ActionKind, f: CodeFacts | null, question: string): string {
  const topic = f
    ? f.functions.length
      ? `den ${f.language}-Code mit ${f.functions.map((n) => `\`${n}\``).join(', ')}`
      : `den ${f.language}-Ausschnitt (${f.lines} Zeile${f.lines === 1 ? '' : 'n'})`
    : `deine Frage „${question}“`;

  const sections: string[] = [];
  if (f) sections.push(`## Beobachtung\n${factsBlock(f, depth)}`);

  if (depth === 'precise') {
    sections.push(
      `## Schlussfolgerung\nFür ${topic} lassen sich ohne Sprachmodell nur strukturelle Aussagen treffen: ${
        f?.constructs.length ? `Kontrollfluss und Seiteneffekte entstehen vermutlich über ${f.constructs.join(', ')}.` : 'keine besonderen Bausteine erkannt.'
      } Semantik, Korrektheit und Laufzeitverhalten sind damit nicht geprüft.`,
    );
  } else if (depth === 'simple') {
    sections.push(
      `## Einfach gesagt\nDu schaust dir ${topic} an. Ein *Baustein* ist hier ein typisches Programmiermuster, z. B. eine *Schleife* (etwas wird wiederholt) oder eine *Verzweigung* (je nach Bedingung passiert A oder B).${
        f?.constructs.length ? ` Gefunden wurden: ${f.constructs.join(', ')}.` : ''
      }`,
    );
  } else {
    sections.push(
      [
        '## Stufe 1',
        `Code ist eine Liste von Anweisungen, die der Computer der Reihe nach abarbeitet.`,
        '## Stufe 2',
        f?.constructs.length
          ? `Manche Anweisungen entscheiden (Verzweigung) oder wiederholen (Schleife). Hier vorhanden: ${f.constructs.join(', ')}.`
          : 'Manche Anweisungen entscheiden oder wiederholen etwas.',
        '## Analogie',
        'Wie ein Kochrezept: Schritte nacheinander („Wasser kochen“), Entscheidungen („wenn zu salzig, Wasser zugeben“), Wiederholungen („10 Minuten lang alle 2 Minuten umrühren“).',
        '## Was das technisch bedeutet',
        'Rezeptschritte = Anweisungen, „wenn …“ = if/else, „alle 2 Minuten“ = Schleife. Die Analogie endet dort, wo Code gleichzeitig (asynchron) läuft oder Daten zwischen Funktionen weitergibt.',
      ].join('\n'),
    );
  }

  if (action === 'risks') sections.push('## Was kann schiefgehen?\n- Ohne Sprachmodell keine inhaltliche Risikoanalyse möglich.\n- Prüfe mindestens: Eingabevalidierung, Fehlerfälle, Tests für Randfälle.');
  if (action === 'quiz' || mode === 'learn')
    sections.push(`## Prüfe dich selbst\nKannst du in einem Satz erklären, was ${f?.functions[0] ? `\`${f.functions[0]}\`` : 'dieser Code'} tut und welche Eingabe es erwartet?`);

  sections.push(
    '## Hinweis\nDies ist der **lokale Demo-Anbieter** (regelbasiert, ohne KI, ohne Netzwerk). Für echte Erklärungen in Einstellungen einen Modell-Anbieter einrichten.',
  );
  return sections.join('\n\n');
}

export class DemoProvider implements Provider {
  constructor(private readonly delayMs = 350) {}

  info(): ProviderInfo {
    return { id: 'demo', label: 'Lokaler Demo-Anbieter', kind: 'local', model: 'regelbasiert (keine KI)', configured: true };
  }

  async complete(request: ProviderRequest, signal: AbortSignal): Promise<ProviderResponse> {
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(resolve, this.delayMs);
      signal.addEventListener('abort', () => {
        clearTimeout(t);
        reject(new ProviderError('cancelled', 'Abgebrochen'));
      });
    });
    const meta = request.meta ?? { mode: 'copilot', depth: 'simple', action: 'explain' };
    const { context, question } = extract(request);
    const facts = context.trim() ? analyzeCode(context) : null;
    return { text: body(meta.depth, meta.mode, meta.action, facts, question), model: this.info().model };
  }
}
