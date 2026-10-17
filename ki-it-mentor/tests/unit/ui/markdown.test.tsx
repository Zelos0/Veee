import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Markdown } from '../../../src/renderer/components/Markdown';

describe('Markdown', () => {
  it('renders headings, lists, code and inline formatting', () => {
    const { container } = render(<Markdown text={'## Titel\n- **fett** und `code`\n\n```ts\nconst a = 1;\n```\nText'} />);
    expect(container.querySelector('h2')?.textContent).toBe('Titel');
    expect(container.querySelector('li strong')?.textContent).toBe('fett');
    expect(container.querySelector('li code')?.textContent).toBe('code');
    expect(container.querySelector('pre code')?.textContent).toBe('const a = 1;');
  });

  it('never interprets model output as HTML', () => {
    const { container } = render(<Markdown text={'<img src=x onerror="alert(1)"> <script>alert(2)</script>'} />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
    expect(container.textContent).toContain('<img src=x');
  });
});
