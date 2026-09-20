'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Question } from '@/lib/questions';

export default function QuestionEditForm({ initial }: { initial: Question }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [question, setQuestion] = useState(initial.question);
  const [answer, setAnswer] = useState(initial.answer);
  const [published, setPublished] = useState(initial.published);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/questions/${initial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, question, answer, published }),
      });
      if (!response.ok) {
        setError('Could not save the question. Please check the fields and try again.');
        setSaving(false);
        return;
      }
      router.push('/admin/questions');
      router.refresh();
    } catch {
      setError('Something went wrong.');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="q-name" className="mb-1.5 block text-sm font-medium text-[#B3B3B3]">
          Name
        </label>
        <input
          id="q-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={60}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-gray-100 outline-none focus:border-[#71B280]/70 focus:bg-white/10"
        />
      </div>

      <div>
        <label htmlFor="q-question" className="mb-1.5 block text-sm font-medium text-[#B3B3B3]">
          Question
        </label>
        <textarea
          id="q-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={3}
          required
          className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-gray-100 outline-none focus:border-[#71B280]/70 focus:bg-white/10"
        />
      </div>

      <div>
        <label htmlFor="q-answer" className="mb-1.5 block text-sm font-medium text-[#B3B3B3]">
          Answer
        </label>
        <textarea
          id="q-answer"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          rows={8}
          placeholder="Markdown is supported (## headings, **bold**, ||spoiler||, [!tip ...], links, …)"
          className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-gray-100 placeholder:text-[#8a7f9e] outline-none focus:border-[#71B280]/70 focus:bg-white/10"
        />
      </div>

      <label className="flex w-max items-center gap-2.5 text-sm text-[#B3B3B3]">
        <input
          type="checkbox"
          checked={published}
          onChange={(event) => setPublished(event.target.checked)}
          className="h-4 w-4 accent-[#71B280]"
        />
        Publish to the community
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/questions')}
          className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-[#B3B3B3] transition hover:border-white/30 hover:text-white"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#23194e] px-5 py-2.5 text-sm font-semibold text-gray-100 transition hover:bg-[#3b144d] disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save question'}
        </button>
      </div>
    </form>
  );
}