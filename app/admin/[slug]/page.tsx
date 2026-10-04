import { redirect, notFound } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/session';
import { getEntryBySlug } from '@/lib/db';
import EntryEditor from '@/components/admin/EntryEditor';
import type { EditorTab } from '@/components/admin/EditorBottomBar';

export default async function EditEntryPage(props: PageProps<'/admin/[slug]'>) {
  const user = await getCurrentAdmin();
  if (!user) redirect('/admin');

  const { slug } = await props.params;
  const searchParams = await props.searchParams;

  const entry = getEntryBySlug(slug);
  if (!entry) notFound();

  const tabParam = searchParams.tab;
  const tab: EditorTab =
    tabParam === 'draft' || tabParam === 'preview' ? tabParam : 'overview';

  const langParam = searchParams.lang;
  const lang = langParam === 'tr' ? 'tr' : 'en';

  return (
    <EntryEditor
      mode="edit"
      initialTab={tab}
      initialLang={lang}
      initial={{
        slug: entry.slug,
        title: entry.title,
        description: entry.description,
        authorNote: entry.authorNote,
        content: entry.content,
        tr: {
          title: entry.tr?.title ?? '',
          description: entry.tr?.description ?? '',
          authorNote: entry.tr?.authorNote ?? '',
          content: entry.tr?.content ?? '',
        },
        lastEdited: entry.lastEdited,
        lastTranslated: entry.lastTranslated,
        releaseDate: entry.releaseDate,
        year: entry.year,
        category: entry.category,
        tags: entry.tags,
        published: entry.published,
      }}
    />
  );
}