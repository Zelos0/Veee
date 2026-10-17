// Accessible segmented control (radiogroup with roving focus + arrow keys).
// The sliding indicator is the only motion; it is purely decorative — the checked
// state is also carried by text colour and aria-checked.

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';

export interface SegOption<T extends string> {
  value: T;
  label: string;
  title?: string;
}

export function Segmented<T extends string>(props: {
  label: string;
  value: T;
  options: SegOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current?.querySelector<HTMLButtonElement>('button[aria-checked="true"]');
      if (el) setIndicator({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    // Re-measure when fonts load or the window is resized.
    const observer = new ResizeObserver(measure);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [props.value, props.options]);

  const onKey = (e: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const idx = props.options.findIndex((o) => o.value === props.value);
    const n = props.options.length;
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (idx + (e.key === 'ArrowRight' ? 1 : -1) + n) % n;
    props.onChange(props.options[next]!.value);
    requestAnimationFrame(() => ref.current?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus());
  };

  return (
    <div ref={ref} role="radiogroup" aria-label={props.label} className={`seg ${props.className ?? ''}`} onKeyDown={onKey}>
      {indicator && <span className="seg-indicator" aria-hidden="true" style={{ transform: `translateX(${indicator.x - 2}px)`, width: indicator.w, left: 2 }} />}
      {props.options.map((o) => {
        const checked = o.value === props.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            data-value={o.value}
            title={o.title}
            disabled={props.disabled}
            onClick={() => props.onChange(o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
