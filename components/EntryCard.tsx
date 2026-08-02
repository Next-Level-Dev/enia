import Link from 'next/link';
import type { EntrySummary } from '@/lib/db';
import { getDict, tagLabel, type Lang } from '@/lib/i18n';

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
      <h2 className="text-xl font-bold text-gray-100 group-hover:text-white transition">
        {entry.title}
      </h2>
      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8a7f9e]">
        <span>{dict.card.released} {formatDate(entry.releaseDate)}</span>
        <span>{dict.card.edited} {formatDate(entry.lastEdited)}</span>
      </div>
    </Link>
  );
}
