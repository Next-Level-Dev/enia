'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CATEGORY_TAGS,
  TAG_GROUPS,
  tagGroupMeanings,
  type Category,
} from '@/lib/categories';
import { getDict, tagLabel, type Lang } from '@/lib/i18n';
import Tooltip from './Tooltip';

interface ListingFiltersProps {
  lang: Lang;
  section: string;
  category: Category;
}

function buildUrl(
  section: string,
  opts: { tags: string[]; sort: 'release' | 'edited' | 'year'; order: 'asc' | 'desc' }
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

export default function ListingFilters({ lang, section, category }: ListingFiltersProps) {
  const searchParams = useSearchParams();
  const dict = getDict(lang);

  const validTags = CATEGORY_TAGS[category];
  const selectedTags = searchParams.getAll('tag').filter((t) => validTags.includes(t));
  const sort =
    category === 'story' && searchParams.get('sort') === 'year'
      ? 'year'
      : searchParams.get('sort') === 'edited'
        ? 'edited'
        : 'release';
  const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

  const sortOptions: { label: string; s: 'release' | 'edited' | 'year'; o: 'asc' | 'desc' }[] = [
    { label: dict.listing.lastReleased, s: 'release', o: 'desc' },
    { label: dict.listing.firstReleased, s: 'release', o: 'asc' },
  ];
  if (category === 'story') {
    sortOptions.push(
      { label: dict.listing.firstChronological, s: 'year', o: 'asc' },
      { label: dict.listing.lastChronological, s: 'year', o: 'desc' }
    );
  }
  sortOptions.push({ label: dict.listing.lastEdited, s: 'edited', o: 'desc' });

  const hasActiveFilter = selectedTags.length > 0 || sort !== 'release' || order !== 'desc';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {TAG_GROUPS[category].map((group) => (
            <div key={group.name} className="flex flex-wrap items-center gap-2">
              <span className="flex shrink-0 items-center gap-1 text-xs uppercase tracking-wide text-[#8a7f9e] sm:w-40">
                {dict.tagGroupLabels[group.name] ?? group.name}
                <Tooltip
                  content={tagGroupMeanings(category, group.tags, {
                    labelOf: (t) => tagLabel(lang, t),
                    groupLabelOf: () => '',
                    meaningOf: (t) => dict.tagMeanings[t] ?? dict.noDescriptionYet,
                  })}
                />
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
        {hasActiveFilter && (
          <Link
            href={`/${section}`}
            className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm font-medium text-[#B3B3B3] transition hover:border-white/30 hover:text-white"
          >
            {dict.listing.reset}
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-[#8a7f9e]">{dict.listing.sort}</span>
        {sortOptions.map(({ label, s, o }) => (
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
  );
}
