'use client';

import { useState } from 'react';
import type { Question } from '@/lib/questions';
import { Markdown } from '@/lib/markdown';
import { getDict, type Lang } from '@/lib/i18n';

function formatDate(date: string): string {
  const [year, month, day] = date.slice(0, 10).split('-');
  return `${day}.${month}.${year}`;
}

export default function QuestionItem({ lang, item }: { lang: Lang; item: Question }) {
  const dict = getDict(lang);
  const [revealed, setRevealed] = useState(false);

  return (
    <article id={`q-${item.id}`} className="scroll-mt-24 rounded-xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs text-[#8a7f9e]">
        {dict.community.askedBy(item.name)} &middot; {formatDate(item.createdAt)}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-gray-100">{item.question}</p>

      <div className="mt-4">
        {revealed ? (
          <div>
            <button
              type="button"
              onClick={() => setRevealed(false)}
              className="text-sm font-medium text-[#8fd19e] transition hover:text-[#71B280]"
            >
              &larr; {dict.community.hideAnswer}
            </button>
            <div className="mt-3 border-l-2 border-[#71B280]/60 pl-4 text-gray-200">
              <Markdown source={item.answer} />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="rounded-full border border-[#FFE47A]/60 bg-[#FFE47A]/15 px-4 py-1.5 text-sm font-medium text-[#FFE47A] transition hover:bg-[#FFE47A]/25"
          >
            {dict.community.revealAnswer} &darr;
          </button>
        )}
      </div>
    </article>
  );
}