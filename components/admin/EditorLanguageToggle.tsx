'use client';

import type { Lang } from '@/lib/i18n';

const OPTIONS: { value: Lang; label: string; hint: string }[] = [
  { value: 'en', label: 'English', hint: 'Original' },
  { value: 'tr', label: 'Türkçe', hint: 'Translation' },
];

/**
 * Language switch shared by every editor tab. It only touches editor state — the
 * visitor-facing site language (the enia_lang cookie) is left alone on purpose.
 * It floats at the top of the editor and stays pinned there while scrolling.
 */
export default function EditorLanguageToggle({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (lang: Lang) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/15 bg-[#160a2b]/95 p-1 shadow-lg shadow-black/40 backdrop-blur">
      <span className="hidden pl-2 pr-1 text-[10px] font-semibold uppercase tracking-widest text-[#8a7f9e] sm:inline">
        Version
      </span>
      {OPTIONS.map((option) => {
        const active = lang === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            title={`${option.label} — ${option.hint}`}
            aria-pressed={active}
            className={
              active
                ? 'rounded-full border border-[#FFE47A]/60 bg-[#FFE47A]/15 px-3 py-1 text-xs font-semibold text-[#FFE47A] transition sm:text-sm'
                : 'rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-[#B3B3B3] transition hover:text-white sm:text-sm'
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}