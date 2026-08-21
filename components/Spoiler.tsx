'use client';

import { useState, type ReactNode } from 'react';

export default function Spoiler({ children }: { children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return <span className="rounded bg-white/15 px-1 py-0.5">{children}</span>;
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      className="mx-0.5 inline-flex h-[1.5em] items-center rounded bg-white/10 px-2 align-middle text-xs font-medium uppercase tracking-wide text-[#B3B3B3] transition hover:bg-white/20 hover:text-white"
    >
      Reveal spoiler
    </button>
  );
}
