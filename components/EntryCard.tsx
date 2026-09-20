import Link from 'next/link';
import type { EntrySummary } from '@/lib/db';
import { getDict, tagLabel, type Lang } from '@/lib/i18n';
import { formatWordCount } from '@/lib/wordcount';

function formatDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}.${month}.${year}`;
}

export default function EntryCard({
  lang,
  section,
  entry,
}: {
  lang: Lang;
  section: string;
  entry: EntrySummary;
}) {
  const dict = getDict(lang);
  const localizedTitle = lang === 'tr' && entry.titleTr ? entry.titleTr : entry.title;
  const localizedDescription =
    lang === 'tr' && entry.descriptionTr ? entry.descriptionTr : entry.description;

  return (
    <Link
      href={`/${section}/${entry.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-white/25 hover:bg-white/10"
    >
      <div className="flex flex-wrap items-center gap-2">
        {entry.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[#71B280]/40 bg-[#71B280]/10 px-2.5 py-0.5 text-xs font-medium text-[#8fd19e]"
          >
            {tagLabel(lang, tag)}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h2 className="text-xl font-bold text-gray-100 transition group-hover:text-white">
          {localizedTitle}
        </h2>
        <span className="shrink-0 rounded-full border border-[#8a7f9e]/30 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#8a7f9e]">
          {formatWordCount(entry.wordCount)} {dict.card.words}
        </span>
      </div>
      {localizedDescription && (
        <p className="text-sm text-[#8a7f9e]">{localizedDescription}</p>
      )}
      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8a7f9e]">
        {entry.category === 'story' && (
          <span>
            {dict.card.year} {entry.year === 'unknown' ? dict.unknownYear : entry.year}
          </span>
        )}
        <span>{dict.card.released} {formatDate(entry.releaseDate)}</span>
        <span>{dict.card.edited} {formatDate(entry.lastEdited)}</span>
      </div>
    </Link>
  );
}
