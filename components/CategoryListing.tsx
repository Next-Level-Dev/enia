import Link from 'next/link';
import { listEntries } from '@/lib/db';
import {
  CATEGORY_TAGS,
  CATEGORY_TITLES,
  PERSPECTIVES,
  PERSPECTIVE_MEANINGS,
  TAG_MEANINGS,
  type Category,
  type Perspective,
} from '@/lib/categories';
import EntryCard from './EntryCard';
import Tooltip from './Tooltip';

interface CategoryListingProps {
  section: string;
  category: Category;
  searchParams: Record<string, string | string[] | undefined>;
}

function buildUrl(
  section: string,
  opts: { tag?: string; perspective?: Perspective; sort: 'release' | 'edited'; order: 'asc' | 'desc' }
): string {
  const params = new URLSearchParams();
  if (opts.tag) params.set('tag', opts.tag);
  if (opts.perspective) params.set('perspective', opts.perspective);
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
  section,
  category,
  searchParams,
}: CategoryListingProps) {
  const tag = typeof searchParams.tag === 'string' ? searchParams.tag : undefined;
  const perspectiveParam = searchParams.perspective;
  const perspective: Perspective | undefined =
    perspectiveParam === 'limited' || perspectiveParam === 'omniscient' ? perspectiveParam : undefined;
  const sort = searchParams.sort === 'edited' ? 'edited' : 'release';
  const order = searchParams.order === 'asc' ? 'asc' : 'desc';

  const entries = listEntries({ category, tag, perspective, sort, order });
  const tagOptions = CATEGORY_TAGS[category];
  const tagMeanings = tagOptions
    .map((t) => `• ${t}: ${TAG_MEANINGS[t] ?? 'No description yet.'}`)
    .join('\n');

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#71B280] to-[#FFE47A] bg-clip-text text-transparent">
        {CATEGORY_TITLES[category]}
      </h1>

      <div className="mt-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[#8a7f9e]">
            Tags:
            <Tooltip content={tagMeanings} />
          </span>
          <Link className={pillClass(!tag)} href={buildUrl(section, { tag: undefined, sort, order })}>
            All
          </Link>
          {tagOptions.map((t) => (
            <Link
              key={t}
              className={pillClass(tag === t)}
              href={buildUrl(section, { tag: t, sort, order })}
            >
              {t}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[#8a7f9e]">
            Perspective:
            <Tooltip content={PERSPECTIVES.map((p) => `• ${PERSPECTIVE_MEANINGS[p]}`).join('\n')} />
          </span>
          <Link
            className={pillClass(!perspective)}
            href={buildUrl(section, { tag, perspective: undefined, sort, order })}
          >
            All
          </Link>
          {PERSPECTIVES.map((p) => (
            <Link
              key={p}
              className={pillClass(perspective === p)}
              href={buildUrl(section, { tag, perspective: p, sort, order })}
            >
              {p}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[#8a7f9e]">Sort:</span>
          {(
            [
              ['Newest', 'release', 'desc'],
              ['Oldest', 'release', 'asc'],
              ['Recently edited', 'edited', 'desc'],
            ] as const
          ).map(([label, s, o]) => (
            <Link
              key={label}
              className={pillClass(sort === s && order === o)}
              href={buildUrl(section, { tag, perspective, sort: s, order: o })}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="mt-12 text-[#8a7f9e]">
          {tag
            ? `Nothing tagged "${tag}" here yet.`
            : 'Nothing here yet. Check back soon.'}
        </p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {entries.map((entry) => (
            <EntryCard key={entry.slug} section={section} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
