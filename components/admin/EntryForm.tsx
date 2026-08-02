'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, CATEGORY_TAGS, PERSPECTIVES, PERSPECTIVE_MEANINGS, TAG_MEANINGS, type Category, type Perspective } from '@/lib/categories';
import { COMMAND_COLORS, COMMAND_FONTS, Markdown } from '@/lib/markdown';
import Tooltip from '@/components/Tooltip';

interface EntryFormProps {
  mode: 'create' | 'edit';
  initial?: {
    slug: string;
    title: string;
    authorNote: string;
    content: string;
    lastEdited: string;
    releaseDate: string;
    category: Category;
    perspective: Perspective;
    tags: string[];
    published: boolean;
  };
}

interface MarkdownNote {
  syntax: string;
  description: string;
  swatch?: string;
}

const MARKDOWN_NOTES: MarkdownNote[] = [
  { syntax: '# Heading', description: 'h1 to h6 headings' },
  { syntax: '**bold**', description: 'strong text' },
  { syntax: '*italic*', description: 'emphasized text' },
  { syntax: '~~strike~~', description: 'deleted text' },
  { syntax: '`code`', description: 'inline code' },
  { syntax: '``` ```', description: 'fenced code block' },
  { syntax: '> quote', description: 'blockquote' },
  { syntax: '- item', description: 'unordered list' },
  { syntax: '1. item', description: 'ordered list' },
  { syntax: '[text](url)', description: 'link' },
  { syntax: '[text](site/path)', description: 'link to a page on this site (e.g. site/stories/ural-chapter-1)' },
  {
    syntax: '![alt](url)',
    description: 'image, video (.mp4/.webm/.mov), or audio (.mp3/.wav/.ogg)',
  },
  { syntax: '---', description: 'horizontal rule' },
  { syntax: '[!start color name]', description: 'light-blue dark-blue light-red dark-red light-green dark-green light-purple light-pink light-yellow light-orange white light-gray dark-gray black' },
  { syntax: '[!start font name]', description: 'mono sans serif cursive' },
  { syntax: '[!end]', description: 'changes font and color to default' },
];

export default function EntryForm({ mode, initial }: EntryFormProps) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [authorNote, setAuthorNote] = useState(initial?.authorNote ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [category, setCategory] = useState<Category>(initial?.category ?? 'worldbuilding');
  const [perspective, setPerspective] = useState<Perspective>(initial?.perspective ?? 'omniscient');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [releaseDate, setReleaseDate] = useState(initial?.releaseDate ?? today);
  const [lastEdited, setLastEdited] = useState(initial?.lastEdited ?? today);
  const [published, setPublished] = useState(initial?.published ?? false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function toggleTag(tag: string) {
    setTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    );
  }

  function handleCategoryChange(next: Category) {
    setCategory(next);
    setTags([]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const payload = { title, authorNote, content, lastEdited, releaseDate, category, perspective, tags, published };

    try {
      const response = await fetch(
        mode === 'create' ? '/api/entries' : `/api/entries/${initial!.slug}`,
        {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Failed to save entry');
        setLoading(false);
        return;
      }

      router.push('/admin');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-gray-100 placeholder:text-[#8a7f9e] outline-none transition focus:border-[#71B280]/70 focus:bg-white/10';
  const labelClass = 'text-sm font-medium text-gray-200';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="grid items-stretch gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className={labelClass}>
              Title
            </label>
            <input
              id="title"
              type="text"
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="authorNote" className={labelClass}>
              Author note
            </label>
            <textarea
              id="authorNote"
              rows={2}
              className={inputClass}
              value={authorNote}
              onChange={(e) => setAuthorNote(e.target.value)}
            />
            <p className="text-xs text-[#8a7f9e]">
              Optional note shown above the content. Rendered as plain text.
            </p>
          </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select
            id="category"
            className={inputClass}
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as Category)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-[#0e031d]">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="releaseDate" className={labelClass}>
            Release date
          </label>
          <input
            id="releaseDate"
            type="date"
            className={inputClass}
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="lastEdited" className={labelClass}>
            Last edited
          </label>
          <input
            id="lastEdited"
            type="date"
            className={inputClass}
            value={lastEdited}
            onChange={(e) => setLastEdited(e.target.value)}
            required
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className={labelClass}>Visibility</legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['private', 'Private'],
              ['public', 'Public'],
            ] as const
          ).map(([value, label]) => {
            const active = (value === 'public') === published;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setPublished(value === 'public')}
                className={
                  active
                    ? 'rounded-lg border border-[#FFE47A]/60 bg-[#FFE47A]/15 px-3 py-1.5 text-sm font-medium text-[#FFE47A] transition'
                    : 'rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-[#B3B3B3] transition hover:border-white/30 hover:text-white'
                }
              >
                {label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[#8a7f9e]">
          {published
            ? 'Public — this entry is listed and can be read by anyone.'
            : 'Private — this entry is hidden from the site. Make it public to show it.'}
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="flex items-center gap-1">
          <span className={labelClass}>Tags</span>
          <Tooltip
            content={CATEGORY_TAGS[category]
              .map((tag) => `• ${tag}: ${TAG_MEANINGS[tag] ?? 'No description yet.'}`)
              .join('\n')}
          />
        </legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_TAGS[category].map((tag) => {
            const selected = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={
                  selected
                    ? 'rounded-full border border-[#FFE47A]/60 bg-[#FFE47A]/15 px-3 py-1 text-sm font-medium text-[#FFE47A] transition'
                    : 'rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm font-medium text-[#B3B3B3] transition hover:border-white/30 hover:text-white'
                }
              >
                {tag}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="flex items-center gap-1">
          <span className={labelClass}>Perspective</span>
          <Tooltip content={PERSPECTIVES.map((p) => `• ${PERSPECTIVE_MEANINGS[p]}`).join('\n')} />
        </legend>
        <div className="flex flex-wrap gap-2">
          {PERSPECTIVES.map((p) => {
            const active = perspective === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPerspective(p)}
                className={
                  active
                    ? 'rounded-lg border border-[#a78bfa]/60 bg-[#a78bfa]/15 px-3 py-1.5 text-sm font-medium text-[#c4b5fd] transition'
                    : 'rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-[#B3B3B3] transition hover:border-white/30 hover:text-white'
                }
              >
                {p}
              </button>
            );
          })}
        </div>
      </fieldset>

      </div>

      <div className="flex flex-col gap-2">
        <h4 className={labelClass}>Markdown details</h4>
        <ul className="flex flex-1 flex-col gap-1.5 rounded-lg border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-[#B3B3B3]">
          {MARKDOWN_NOTES.map((note) => (
            <li key={note.syntax} className="flex items-baseline gap-2">
              <code className="shrink-0 font-mono text-[#FFE47A]">{note.syntax}</code>
              {note.swatch && (
                <span
                  className="inline-block h-3 w-3 shrink-0 rounded-full border border-white/20"
                  style={{ backgroundColor: note.swatch }}
                />
              )}
              <span className="text-[#8a7f9e]">{note.description}</span>
            </li>
          ))}
        </ul>
      </div>
      </div>

      <div className="grid items-stretch gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="content" className={labelClass}>
            Content (Markdown)
          </label>
          <textarea
            id="content"
            rows={18}
            className={`${inputClass} flex-1 font-mono text-sm leading-relaxed`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <h4 className={labelClass}>Preview</h4>
          <div className="max-h-[70vh] min-h-40 flex-1 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-6">
            {content.trim() ? (
              <Markdown source={content} />
            ) : (
              <p className="text-sm text-[#8a7f9e]">Nothing to preview yet.</p>
            )}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#23194e] px-6 py-3 font-semibold text-gray-100 transition hover:bg-[#3b144d] disabled:opacity-60"
        >
          {loading ? 'Saving…' : mode === 'create' ? 'Create entry' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="rounded-lg border border-white/15 px-6 py-3 font-semibold text-[#B3B3B3] transition hover:border-white/30 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
