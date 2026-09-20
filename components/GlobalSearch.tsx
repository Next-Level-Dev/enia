'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getDict, type Lang } from '@/lib/i18n';
import type { SearchHit } from '@/lib/search';

const DEBOUNCE_MS = 200;

export default function GlobalSearch({ lang }: { lang: Lang }) {
  const dict = getDict(lang);
  const router = useRouter();
  const [value, setValue] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('[data-search-input]')?.focus();
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  function handleChange(next: string) {
    setValue(next);
    setOpen(true);
    const trimmed = next.trim();
    if (timer.current) window.clearTimeout(timer.current);

    if (!trimmed) {
      setHits([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timer.current = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await response.json();
        setHits(Array.isArray(data.hits) ? data.hits : []);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
  }

  const pages = hits.filter((hit) => hit.kind === 'page');
  const questions = hits.filter((hit) => hit.kind === 'question');

  return (
    <div ref={boxRef} className="relative">
      <input
        data-search-input
        type="search"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && hits.length > 0) {
            const first = hits[0];
            setOpen(false);
            router.push(first.href);
          }
        }}
        placeholder={dict.search.placeholder}
        aria-label={dict.search.placeholder}
        className="w-40 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-gray-100 placeholder:text-[#8a7f9e] outline-none focus:border-[#71B280]/70 focus:bg-white/10 sm:w-56"
      />

      {open && value.trim().length > 0 && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-white/10 bg-[#160a2b] shadow-xl sm:w-80">
          <div className="max-h-80 overflow-y-auto py-1">
            {loading && hits.length === 0 ? (
              <p className="px-4 py-3 text-sm text-[#8a7f9e]">…</p>
            ) : hits.length === 0 ? (
              <p className="px-4 py-3 text-sm text-[#8a7f9e]">{dict.search.noResults}</p>
            ) : (
              <>
                {pages.length > 0 && (
                  <>
                    <p className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-[#8a7f9e]">
                      {dict.search.pagesLabel}
                    </p>
                    {pages.map((hit) => (
                      <SearchRow key={hit.href} hit={hit} onNavigate={() => setOpen(false)} label="Page" />
                    ))}
                  </>
                )}
                {questions.length > 0 && (
                  <>
                    <p className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-[#8a7f9e]">
                      {dict.search.questionsLabel}
                    </p>
                    {questions.map((hit) => (
                      <SearchRow key={hit.href} hit={hit} onNavigate={() => setOpen(false)} label="Q" />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchRow({
  hit,
  onNavigate,
  label,
}: {
  hit: SearchHit;
  onNavigate: () => void;
  label: string;
}) {
  return (
    <Link
      href={hit.href}
      onClick={onNavigate}
      className="flex items-start gap-2 px-4 py-2.5 transition hover:bg-white/10"
    >
      <span
        className={
          hit.kind === 'page'
            ? 'mt-0.5 shrink-0 rounded-full border border-[#71B280]/40 bg-[#71B280]/10 px-2 py-0.5 text-[10px] font-semibold text-[#8fd19e]'
            : 'mt-0.5 shrink-0 rounded-full border border-[#FFE47A]/40 bg-[#FFE47A]/10 px-2 py-0.5 text-[10px] font-semibold text-[#FFE47A]'
        }
      >
        {label}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-gray-100">{hit.title}</span>
        {hit.subtitle && (
          <span className="block truncate text-xs text-[#8a7f9e]">{hit.subtitle}</span>
        )}
      </span>
    </Link>
  );
}