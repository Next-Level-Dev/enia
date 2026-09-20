'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

const BASE_MS = 1100;
const MS_PER_CHAR = 30;
const MIN_MS = 2600;
const MAX_MS = 15000;

function durationFor(message: string): number {
  return Math.min(MAX_MS, Math.max(MIN_MS, BASE_MS + message.length * MS_PER_CHAR));
}

interface TipPos {
  top: number;
  left: number;
}

export default function Tip({ children }: { children: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<TipPos | null>(null);
  const [nonce, setNonce] = useState(0);
  const anchor = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | null>(null);

  const tick = useCallback(() => {
    if (!anchor.current || !panel.current) return;
    const a = anchor.current.getBoundingClientRect();
    const gap = 10;
    const margin = 12;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const panelWidth = panel.current.offsetWidth || Math.min(352, vw - margin * 2);

    let left = a.left + a.width / 2 - panelWidth / 2;
    left = Math.max(margin, Math.min(left, vw - panelWidth - margin));

    const panelHeight = panel.current.offsetHeight || 40;
    const below = a.bottom + gap;
    const above = a.top - gap - panelHeight;
    const top = below + panelHeight > vh - margin && above >= margin ? above : below;
    const clamped = Math.max(margin, Math.min(top, vh - panelHeight - margin));

    setPos({ top: clamped, left });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    panel.current?.classList.add('tip-measure');
    tick();
    panel.current?.classList.remove('tip-measure');

    function onViewportChange() {
      tick();
    }
    window.addEventListener('scroll', onViewportChange, true);
    window.addEventListener('resize', onViewportChange);

    timer.current = window.setTimeout(() => {
      setOpen(false);
    }, durationFor(children));

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = null;
      window.removeEventListener('scroll', onViewportChange, true);
      window.removeEventListener('resize', onViewportChange);
    };
  }, [open, nonce, tick, children]);

  function show() {
    setNonce((current) => current + 1);
    setOpen(true);
  }

  function dismiss() {
    setOpen(false);
  }

  return (
    <span className="relative inline-flex items-center">
      <button
        ref={anchor}
        type="button"
        aria-label="Show note"
        onPointerDown={show}
        onClick={show}
        className="tip-q relative -top-1 mx-1.5 z-0 inline-flex h-4 w-4 shrink-0 touch-manipulation items-center justify-center rounded-full border border-[#FFE47A]/50 bg-[#FFE47A]/10 text-[10px] leading-none text-[#FFE47A] transition hover:bg-[#FFE47A]/25"
      >
        ?
      </button>
      <span
        aria-hidden
        onPointerDown={show}
        onClick={show}
        className="absolute -inset-4 z-10 cursor-pointer touch-manipulation select-none sm:-inset-2"
      />
      {open && (
        <span
          ref={panel}
          role="tooltip"
          onClick={dismiss}
          className="tip-panel fixed z-50 max-w-[min(88vw,24rem)] cursor-pointer whitespace-pre-line rounded-lg border border-white/15 bg-[#160a2b] px-3 py-2 text-xs leading-relaxed text-[#B3B3B3] shadow-xl"
          style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, visibility: pos ? 'visible' : 'hidden' }}
        >
          {children}
        </span>
      )}
    </span>
  );
}