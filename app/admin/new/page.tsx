import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/session';
import EntryForm from '@/components/admin/EntryForm';

export default async function NewEntryPage() {
  const user = await getCurrentAdmin();
  if (!user) redirect('/admin');

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#71B280] to-[#FFE47A] bg-clip-text text-transparent">
        New entry
      </h1>
      <div className="mt-8">
        <EntryForm mode="create" />
      </div>
    </div>
  );
}
