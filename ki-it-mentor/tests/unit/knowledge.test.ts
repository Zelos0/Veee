import { describe, expect, it } from 'vitest';
import { MemoryBackend, addNote, deleteAllNotes, deleteNote, emptyState, exportJson, exportMarkdown, parseState } from '../../src/core/knowledge';

describe('knowledge store', () => {
  it('adds, deletes and wipes notes', () => {
    let s = addNote(emptyState(), { title: 'A', body: 'a', sources: ['Datei: x.ts'] });
    s = addNote(s, { title: 'B', body: 'b' });
    expect(s.notes.map((n) => n.title)).toEqual(['B', 'A']);
    s = deleteNote(s, s.notes[0]!.id);
    expect(s.notes.map((n) => n.title)).toEqual(['A']);
    expect(deleteAllNotes(s).notes).toEqual([]);
  });

  it('recovers from corrupted or foreign data', () => {
    expect(parseState('nope')).toEqual(emptyState());
    const s = parseState({ notes: [{ id: 1 }, { id: 'n', body: 'ok', title: 't', sources: [] }], progress: { a: 5 }, settings: { mode: 'learn', confirmExternalSend: false } });
    expect(s.notes).toHaveLength(1);
    expect(s.progress).toEqual({});
    expect(s.settings.mode).toBe('learn');
    // The external-send confirmation cannot be switched off through stored data.
    expect(s.settings.confirmExternalSend).toBe(true);
  });

  it('exports JSON and Markdown', () => {
    const s = addNote(emptyState(), { title: 'Merge', body: '## Kern\nText', topicId: 'git-merge-rebase' });
    expect(JSON.parse(exportJson(s)).notes[0].title).toBe('Merge');
    expect(exportMarkdown(s)).toMatch(/## Merge[\s\S]*Thema: git-merge-rebase[\s\S]*## Kern/);
    expect(exportMarkdown(emptyState())).toMatch(/Keine Notizen/);
  });

  it('memory backend round-trips and wipes', async () => {
    const b = new MemoryBackend();
    const s = addNote(emptyState(), { title: 'x', body: 'y' });
    await b.save(s);
    expect(parseState(await b.load()).notes[0]!.title).toBe('x');
    await b.wipe();
    expect(await b.load()).toBeNull();
  });
});
