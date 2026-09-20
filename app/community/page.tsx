import { getDict } from '@/lib/i18n';
import { getLang } from '@/lib/i18n-server';
import { listQuestions } from '@/lib/questions';
import QuestionForm from '@/components/community/QuestionForm';
import QuestionItem from '@/components/community/QuestionItem';

export default async function CommunityPage() {
  const lang = await getLang();
  const dict = getDict(lang);
  const questions = listQuestions({ published: true });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#71B280] to-[#FFE47A] bg-clip-text text-transparent">
        {dict.community.title}
      </h1>

      <aside className="mt-6 rounded-lg border border-[#FFE47A]/40 bg-[#FFE47A]/10 px-4 py-3">
        <p className="text-sm text-[#FFE47A]">{dict.community.spoilerWarning}</p>
      </aside>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-100">{dict.community.formTitle}</h2>
        <p className="mt-1 text-sm text-[#8a7f9e]">{dict.community.formHint}</p>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-5">
          <QuestionForm lang={lang} />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold text-gray-100">{dict.community.questionsHeading}</h2>
        {questions.length === 0 ? (
          <p className="mt-4 text-[#8a7f9e]">{dict.community.empty}</p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {questions.map((q) => (
              <QuestionItem key={q.id} lang={lang} item={q} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}