import { redirect, notFound } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/session';
import { getQuestionById } from '@/lib/questions';
import QuestionEditForm from '@/components/admin/QuestionEditForm';

export default async function EditQuestionPage(props: PageProps<'/admin/questions/[id]'>) {
  const user = await getCurrentAdmin();
  if (!user) redirect('/admin');

  const { id } = await props.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const question = getQuestionById(numericId);
  if (!question) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#71B280] to-[#FFE47A] bg-clip-text text-transparent">
        Edit question
      </h1>
      <div className="mt-8">
        <QuestionEditForm initial={question} />
      </div>
    </div>
  );
}