import { listEntries } from '@/lib/db';
import { CATEGORY_TAGS, type Category } from '@/lib/categories';
import { getDict, tagLabel, type Lang } from '@/lib/i18n';
import EntryCard from './EntryCard';
import ListingFilters from './ListingFilters';

interface CategoryListingProps {
  lang: Lang;
  section: string;
  category: Category;
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function CategoryListing({
  lang,
  section,
  category,
  searchParams,
}: CategoryListingProps) {
  const dict = getDict(lang);

  const validTags = CATEGORY_TAGS[category];
  const rawTags = searchParams.tag;
  const selectedTags = (Array.isArray(rawTags) ? rawTags : rawTags ? [rawTags] : []).filter(
    (t) => validTags.includes(t)
  );
  const sort = searchParams.sort === 'edited' ? 'edited' : 'release';
  const order = searchParams.order === 'asc' ? 'asc' : 'desc';

  const entries = listEntries({ category, tags: selectedTags, sort, order });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#71B280] to-[#FFE47A] bg-clip-text text-transparent">
        {dict.categoryTitles[category]}
      </h1>

      <div className="mt-8">
        <ListingFilters lang={lang} section={section} category={category} />
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
