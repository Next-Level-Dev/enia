import { notFound } from 'next/navigation';
import { CATEGORY_TO_SECTION, SECTION_TO_CATEGORY } from '@/lib/categories';
import { getLang } from '@/lib/i18n-server';
import CategoryListing from '@/components/CategoryListing';

export default async function SectionPage(props: PageProps<'/[section]'>) {
  const { section } = await props.params;
  const category = SECTION_TO_CATEGORY[section];
  if (!category) notFound();

  const lang = await getLang();
  const searchParams = await props.searchParams;
  return (
    <CategoryListing
      lang={lang}
      section={CATEGORY_TO_SECTION[category]}
      category={category}
      searchParams={searchParams}
    />
  );
}
