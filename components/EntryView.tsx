import Link from 'next/link';
import type { Entry } from '@/lib/types';
import { Markdown } from '@/lib/markdown';

function formatDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}.${month}.${year}`;
}

export default function EntryView({ section, entry }: { section: string; entry: Entry }) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <Link href={`/${section}`} className="text-sm text-[#8a7f9e] hover:text-white transition">
        &larr; Back to {section}
      </Link>

      <article className="mt-6">
        <header className="border-b border-white/10 pb-6">
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#71B280]/40 bg-[#71B280]/10 px-2.5 py-0.5 text-xs font-medium text-[#8fd19e]"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mt-4 text-4xl font-extrabold text-gray-100">{entry.title}</h1>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8a7f9e]">
            <span>Released {formatDate(entry.releaseDate)}</span>
            <span>Last edited {formatDate(entry.lastEdited)}</span>
          </div>
        </header>

        {entry.authorNote && (
          <aside className="mt-6 border-l-2 border-[#FFE47A]/60 pl-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FFE47A]/70">
              Author&rsquo;s note
            </p>
            <p className="mt-1 text-[#FFE47A]">{entry.authorNote}</p>
          </aside>
        )}

        <div className="mt-8">
          <Markdown source={entry.content} />
        </div>
      </article>
    </div>
  );
}
