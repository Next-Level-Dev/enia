import { notFound } from 'next/navigation';
import { SECTION_TO_CATEGORY } from '@/lib/categories';
import { getEntryBySlug } from '@/lib/db';
import { getLang } from '@/lib/i18n-server';
import EntryView from '@/components/EntryView';

export default async function EntryPage(props: PageProps<'/[section]/[slug]'>) {
  const { section, slug } = await props.params;
  const category = SECTION_TO_CATEGORY[section];
  if (!category) notFound();

  const entry = getEntryBySlug(slug);
  if (!entry || entry.category !== category || !entry.published) notFound();

  const lang = await getLang();
  return <EntryView lang={lang} section={section} entry={entry} />;
}
