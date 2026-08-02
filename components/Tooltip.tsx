'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export default function Tooltip({ content }: { content: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label="Show info"
        onClick={() => setOpen((current) => !current)}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-white/5 text-[10px] leading-none text-[#8a7f9e] transition hover:border-[#71B280]/60 hover:text-[#8fd19e]"
      >
        ?
      </button>
      {open && (
        <span className="absolute left-0 top-full z-50 mt-1.5 w-64 max-w-[60vw] whitespace-pre-line rounded-lg border border-white/15 bg-[#160a2b] px-3 py-2 text-xs leading-relaxed text-[#B3B3B3] shadow-xl">
          {content}
        </span>
      )}
    </span>
  );
}
