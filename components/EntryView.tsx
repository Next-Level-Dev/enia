import Link from 'next/link';
import type { Entry } from '@/lib/types';
import { Markdown } from '@/lib/markdown';
import { getDict, tagLabel, type Lang } from '@/lib/i18n';
import { tagGroupMeanings } from '@/lib/categories';
import Tooltip from './Tooltip';

function formatDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}.${month}.${year}`;
}

export default function EntryView({
  lang,
  section,
  entry,
  viewLang = lang,
  hasTranslation = false,
}: {
  lang: Lang;
  section: string;
  entry: Entry;
  viewLang?: Lang;
  hasTranslation?: boolean;
}) {
  const dict = getDict(lang);
  const sectionTitle = dict.sectionTitles[section] ?? section;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <Link href={`/${section}`} className="text-sm text-[#8a7f9e] hover:text-white transition">
        &larr; {dict.view.backTo} {sectionTitle}
      </Link>

      <article className="mt-6">
        <header className="border-b border-white/10 pb-6">
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#71B280]/40 bg-[#71B280]/10 px-2.5 py-0.5 text-xs font-medium text-[#8fd19e]"
              >
                {tagLabel(lang, tag)}
              </span>
            ))}
            {entry.tags.length > 0 && (
              <Tooltip
                content={tagGroupMeanings(entry.category, entry.tags, {
                  labelOf: (t) => tagLabel(lang, t),
                  groupLabelOf: (name) => dict.tagGroupLabels[name] ?? '',
                  meaningOf: (t) => dict.tagMeanings[t] ?? dict.noDescriptionYet,
                })}
              />
            )}
          </div>
          <h1 className="mt-4 text-4xl font-extrabold text-gray-100">{entry.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8a7f9e]">
            <span>{dict.view.released} {formatDate(entry.releaseDate)}</span>
            <span>{dict.view.lastEdited} {formatDate(entry.lastEdited)}</span>
            {hasTranslation && (
              <span className="flex gap-1">
                {(
                  [
                    ['en', 'English'],
                    ['tr', 'Türkçe'],
                  ] as const
                ).map(([value, label]) => (
                  <Link
                    key={value}
                    href={`/${section}/${entry.slug}?lang=${value}`}
                    className={
                      viewLang === value
                        ? 'rounded-full border border-[#FFE47A]/60 bg-[#FFE47A]/15 px-2 py-0.5 font-medium text-[#FFE47A] transition'
                        : 'rounded-full border border-white/15 bg-white/5 px-2 py-0.5 font-medium text-[#B3B3B3] transition hover:border-white/30 hover:text-white'
                    }
                  >
                    {label}
                  </Link>
                ))}
              </span>
            )}
          </div>
        </header>

        {viewLang === 'tr' && (
          <aside className="mt-6 rounded-lg border border-[#FFE47A]/40 bg-[#FFE47A]/10 px-4 py-3">
            <p className="text-sm text-[#FFE47A]">{dict.view.translationWarning}</p>
          </aside>
        )}

        {entry.description && (
          <aside className="mt-6 border-l-2 border-[#71B280]/60 pl-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8fd19e]/70">
              {dict.view.description}
            </p>
            <p className="mt-1 text-gray-200">{entry.description}</p>
          </aside>
        )}

        {entry.authorNote && (
          <aside className="mt-6 border-l-2 border-[#FFE47A]/60 pl-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FFE47A]/70">
              {dict.view.authorsNote}
            </p>
            <p className="mt-1 text-[#FFE47A]">{entry.authorNote}</p>
          </aside>
        )}

        <div className="mt-8">
          <Markdown source={entry.content} />
        </div>
      </article>
    </div>
  );
}
