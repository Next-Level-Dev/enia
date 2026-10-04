import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/session';
import EntryEditor from '@/components/admin/EntryEditor';
import type { EditorTab } from '@/components/admin/EditorBottomBar';

export default async function NewEntryPage(props: PageProps<'/admin/new'>) {
  const user = await getCurrentAdmin();
  if (!user) redirect('/admin');

  const searchParams = await props.searchParams;

  const tabParam = searchParams.tab;
  const tab: EditorTab =
    tabParam === 'draft' || tabParam === 'preview' ? tabParam : 'overview';

  const langParam = searchParams.lang;
  const lang = langParam === 'tr' ? 'tr' : 'en';

  return <EntryEditor mode="create" initialTab={tab} initialLang={lang} />;
}