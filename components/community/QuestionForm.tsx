'use client';

import { useState, type FormEvent } from 'react';
import { getDict, type Lang } from '@/lib/i18n';

export default function QuestionForm({ lang }: { lang: Lang }) {
  const dict = getDict(lang);
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (honeypot) {
      setSent(true);
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, question, website: honeypot }),
      });

      if (response.ok) {
        setSent(true);
        setName('');
        setQuestion('');
        setSending(false);
        return;
      }

      let data: Record<string, unknown> = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.status === 429) {
        const seconds = typeof data.retryAfterSeconds === 'number' ? data.retryAfterSeconds : 3600;
        const minutes = Math.max(1, Math.ceil(seconds / 60));
        setError(dict.community.rateLimited(minutes));
        setSending(false);
        return;
      }

      if (data.error === 'too_short') setError(dict.community.errorTooShort);
      else if (data.error === 'too_long') setError(dict.community.errorTooLong);
      else if (data.error === 'required') setError(dict.community.errorRequired);
      else setError(dict.community.errorServer);
      setSending(false);
    } catch {
      setError(dict.community.errorRequired);
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-[#71B280]/40 bg-[#71B280]/10 px-5 py-4">
        <p className="text-sm font-medium text-[#8fd19e]">{dict.community.sent}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(event) => setHoneypot(event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] top-auto h-px w-px"
      />

      <div>
        <label htmlFor="q-name" className="mb-1.5 block text-sm font-medium text-[#B3B3B3]">
          {dict.community.nameLabel}
        </label>
        <input
          id="q-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={dict.community.namePlaceholder}
          autoComplete="name"
          maxLength={60}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-gray-100 placeholder:text-[#8a7f9e] outline-none focus:border-[#71B280]/70 focus:bg-white/10"
        />
      </div>

      <div>
        <label htmlFor="q-question" className="mb-1.5 block text-sm font-medium text-[#B3B3B3]">
          {dict.community.questionLabel}
        </label>
        <textarea
          id="q-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={dict.community.questionPlaceholder}
          rows={4}
          required
          className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-gray-100 placeholder:text-[#8a7f9e] outline-none focus:border-[#71B280]/70 focus:bg-white/10"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="rounded-lg bg-[#23194e] px-6 py-3 font-semibold text-gray-100 transition hover:bg-[#3b144d] disabled:opacity-60"
      >
        {sending ? dict.community.submitting : dict.community.submit}
      </button>
    </form>
  );
}