import { redirect, notFound } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/session';
import { getEntryBySlug } from '@/lib/db';
import EntryForm from '@/components/admin/EntryForm';

export default async function EditEntryPage(props: PageProps<'/admin/[slug]'>) {
  const user = await getCurrentAdmin();
  if (!user) redirect('/admin');

  const { slug } = await props.params;
  const entry = getEntryBySlug(slug);
  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#71B280] to-[#FFE47A] bg-clip-text text-transparent">
        Edit entry
      </h1>
      <div className="mt-8">
        <EntryForm
          mode="edit"
          initial={{
            slug: entry.slug,
            title: entry.title,
            authorNote: entry.authorNote,
            content: entry.content,
            lastEdited: entry.lastEdited,
            releaseDate: entry.releaseDate,
            category: entry.category,
            tags: entry.tags,
            published: entry.published,
          }}
        />
      </div>
    </div>
  );
}
