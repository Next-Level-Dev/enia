import { notFound } from 'next/navigation';
import { SECTION_TO_CATEGORY } from '@/lib/categories';
import { getEntryBySlug } from '@/lib/db';
import { getLang } from '@/lib/i18n-server';
import type { Lang } from '@/lib/i18n';
import EntryView from '@/components/EntryView';

export default async function EntryPage(props: PageProps<'/[section]/[slug]'>) {
  const { section, slug } = await props.params;
  const category = SECTION_TO_CATEGORY[section];
  if (!category) notFound();

  const entry = getEntryBySlug(slug);
  if (!entry || entry.category !== category || !entry.published) notFound();

  const siteLang = await getLang();
  const hasTranslation = entry.tr !== null;

  const param = await props.searchParams;
  const requested: Lang | undefined =
    param.lang === 'tr' ? 'tr' : param.lang === 'en' ? 'en' : undefined;
  const viewLang: Lang =
    requested === 'tr' && !hasTranslation ? 'en' : (requested ?? (hasTranslation ? siteLang : 'en'));

  const localized =
    viewLang === 'tr' && entry.tr
      ? {
          ...entry,
          title: entry.tr.title || entry.title,
          description: entry.tr.description || entry.description,
          authorNote: entry.tr.authorNote || entry.authorNote,
          content: entry.tr.content || entry.content,
        }
      : entry;

  return (
    <EntryView
      lang={siteLang}
      section={section}
      entry={localized}
      viewLang={viewLang}
      hasTranslation={hasTranslation}
    />
  );
}
