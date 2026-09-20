import Link from 'next/link';
import { getCurrentAdmin } from '@/lib/session';
import { listQuestions } from '@/lib/questions';
import LoginForm from '@/components/admin/LoginForm';
import QuestionActions from '@/components/admin/QuestionActions';

function formatDate(date: string): string {
  const [year, month, day] = date.slice(0, 10).split('-');
  return `${day}.${month}.${year}`;
}

export default async function AdminQuestionsPage(props: PageProps<'/admin/questions'>) {
  const user = await getCurrentAdmin();
  if (!user) return <LoginForm />;

  const searchParams = await props.searchParams;
  const statusParam = searchParams.status;
  const published =
    statusParam === 'public' ? true : statusParam === 'private' ? false : undefined;

  const questions = listQuestions({ published });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#71B280] to-[#FFE47A] bg-clip-text text-transparent">
            Questions
          </h1>
          <p className="mt-1 text-sm text-[#8a7f9e]">{questions.length} submitted</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-[#B3B3B3] transition hover:border-white/30 hover:text-white"
          >
            &larr; Admin
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Link
          href="/admin/questions"
          className="rounded-full border border-[#FFE47A]/60 bg-[#FFE47A]/15 px-3 py-1 text-sm font-medium text-[#FFE47A] transition"
        >
          All
        </Link>
        <Link
          href="/admin/questions?status=private"
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm font-medium text-[#B3B3B3] transition hover:border-white/30 hover:text-white"
        >
          Unpublished
        </Link>
        <Link
          href="/admin/questions?status=public"
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm font-medium text-[#B3B3B3] transition hover:border-white/30 hover:text-white"
        >
          Published
        </Link>
      </div>

      {questions.length === 0 ? (
        <p className="mt-12 text-[#8a7f9e]">No questions submitted yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-[#8a7f9e]">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Question</th>
                <th className="px-4 py-3 font-medium">Answer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="max-w-[10rem] px-4 py-3 text-[#B3B3B3]">
                    {q.name || 'Anonymous'}
                  </td>
                  <td className="max-w-[20rem] truncate px-4 py-3 text-gray-200">{q.question}</td>
                  <td className="max-w-[20rem] truncate px-4 py-3 text-[#8a7f9e]">
                    {q.answer || '—'}
                  </td>
                  <td className="px-4 py-3">
                    {q.published ? (
                      <span className="rounded-full border border-[#71B280]/40 bg-[#71B280]/10 px-2.5 py-0.5 text-xs font-medium text-[#8fd19e]">
                        Public
                      </span>
                    ) : (
                      <span className="rounded-full border border-[#8a7f9e]/40 bg-[#8a7f9e]/10 px-2.5 py-0.5 text-xs font-medium text-[#8a7f9e]">
                        Private
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#B3B3B3]">{formatDate(q.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/questions/${q.id}`}
                        className="text-sm font-medium text-[#71B280] transition hover:text-[#8fd19e]"
                      >
                        Edit
                      </Link>
                      <QuestionActions id={q.id} published={q.published} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}