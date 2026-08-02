import Link from 'next/link';
import { listEntries } from '@/lib/db';
import {
  CATEGORY_TAGS,
  TAG_GROUPS,
  tagGroupMeanings,
  type Category,
} from '@/lib/categories';
import { getDict, tagLabel, type Lang } from '@/lib/i18n';
import EntryCard from './EntryCard';
import Tooltip from './Tooltip';

interface CategoryListingProps {
  lang: Lang;
  section: string;
  category: Category;
  searchParams: Record<string, string | string[] | undefined>;
}

function buildUrl(
  section: string,
  opts: { tags: string[]; sort: 'release' | 'edited'; order: 'asc' | 'desc' }
): string {
  const params = new URLSearchParams();
  for (const tag of opts.tags) params.append('tag', tag);
  if (opts.sort !== 'release') params.set('sort', opts.sort);
  if (opts.order !== 'desc') params.set('order', opts.order);
  const qs = params.toString();
  return qs ? `/${section}?${qs}` : `/${section}`;
}

function pillClass(active: boolean): string {
  return active
    ? 'rounded-full border border-[#FFE47A]/60 bg-[#FFE47A]/15 px-3 py-1 text-sm font-medium text-[#FFE47A] transition'
    : 'rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm font-medium text-[#B3B3B3] transition hover:border-white/30 hover:text-white';
}

export default async function CategoryListing({
  lang,
  section,
  category,
  searchParams,
}: CategoryListingProps) {
  const dict = getDict(lang);

  const rawTags = searchParams.tag;
  const validTags = CATEGORY_TAGS[category];
  const selectedTags = (Array.isArray(rawTags) ? rawTags : rawTags ? [rawTags] : []).filter(
    (t) => validTags.includes(t)
  );
  const sort = searchParams.sort === 'edited' ? 'edited' : 'release';
  const order = searchParams.order === 'asc' ? 'asc' : 'desc';

  const entries = listEntries({ category, tags: selectedTags, sort, order });
  const tagMeanings = tagGroupMeanings(category, validTags, {
    labelOf: (t) => tagLabel(lang, t),
    groupLabelOf: (name) => dict.tagGroupLabels[name] ?? '',
    meaningOf: (t) => dict.tagMeanings[t] ?? dict.noDescriptionYet,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#71B280] to-[#FFE47A] bg-clip-text text-transparent">
        {dict.categoryTitles[category]}
      </h1>

      <div className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center text-sm text-[#8a7f9e]">
              {dict.listing.tags}
              <Tooltip content={tagMeanings} />
            </span>
            <Link
              className={pillClass(selectedTags.length === 0)}
              href={buildUrl(section, { tags: [], sort, order })}
            >
              {dict.listing.all}
            </Link>
          </div>
          {TAG_GROUPS[category].map((group) => (
            <div key={group.name} className="flex flex-wrap items-center gap-2">
              <span className="w-32 shrink-0 text-xs uppercase tracking-wide text-[#8a7f9e]">
                {dict.tagGroupLabels[group.name] ?? group.name}
              </span>
              {group.tags.map((t) => {
                const active = selectedTags.includes(t);
                return (
                  <Link
                    key={t}
                    className={pillClass(active)}
                    href={buildUrl(section, {
                      tags: active ? selectedTags.filter((x) => x !== t) : [...selectedTags, t],
                      sort,
                      order,
                    })}
                  >
                    {tagLabel(lang, t)}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[#8a7f9e]">{dict.listing.sort}</span>
          {(
            [
              [dict.listing.newest, 'release', 'desc'],
              [dict.listing.oldest, 'release', 'asc'],
              [dict.listing.recentlyEdited, 'edited', 'desc'],
            ] as const
          ).map(([label, s, o]) => (
            <Link
              key={label}
              className={pillClass(sort === s && order === o)}
              href={buildUrl(section, { tags: selectedTags, sort: s, order: o })}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="mt-12 text-[#8a7f9e]">
          {selectedTags.length > 0
            ? dict.listing.nothingTagged(selectedTags.map((t) => tagLabel(lang, t)).join(', '))
            : dict.listing.nothingHere}
        </p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {entries.map((entry) => (
            <EntryCard key={entry.slug} lang={lang} section={section} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
