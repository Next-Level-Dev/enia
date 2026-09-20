'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, CATEGORY_TAGS, TAG_GROUP_LABELS, TAG_GROUPS, TAG_MEANINGS, tagGroupMeanings, type Category } from '@/lib/categories';
import { Markdown } from '@/lib/markdown';
import Tooltip from '@/components/Tooltip';

interface EntryFormProps {
  mode: 'create' | 'edit';
  initial?: {
    slug: string;
    title: string;
    description: string;
    authorNote: string;
    content: string;
    tr: {
      title: string;
      description: string;
      authorNote: string;
      content: string;
    };
    lastEdited: string;
    releaseDate: string;
    year: string;
    category: Category;
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
  { syntax: '||spoiler||', description: 'spoiler text, hidden behind a "Reveal spoiler" button until clicked' },
  { syntax: '`code`', description: 'inline code' },
  { syntax: '```js code```', description: 'fenced code block with a language name (js, ts, css, …)' },
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
  { syntax: '[!tip note text]', description: 'inline "?" note — click to show a hint (references, foreign sentences, complex words)' },
  { syntax: '[!end]', description: 'changes font and color to default' },
];

interface DraftSnapshot {
  savedAt: number;
  values: Record<string, unknown>;
}

const FIELD_LABELS: Record<string, string> = {
  title: 'Title',
  description: 'Description',
  authorNote: 'Author note',
  content: 'Content',
  titleTr: 'Title (TR)',
  descriptionTr: 'Description (TR)',
  authorNoteTr: 'Author note (TR)',
  contentTr: 'Content (TR)',
  releaseDate: 'Release date',
  lastEdited: 'Last edited',
  year: 'Year',
  category: 'Category',
  tags: 'Tags',
  published: 'Visibility',
};

export default function EntryForm({ mode, initial }: EntryFormProps) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const draftKey = mode === 'edit' ? `enia_draft_${initial!.slug}` : 'enia_draft_new';

  const initialValues: Record<string, unknown> = {
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    authorNote: initial?.authorNote ?? '',
    content: initial?.content ?? '',
    titleTr: initial?.tr.title ?? '',
    descriptionTr: initial?.tr.description ?? '',
    authorNoteTr: initial?.tr.authorNote ?? '',
    contentTr: initial?.tr.content ?? '',
    releaseDate: initial?.releaseDate ?? today,
    lastEdited: initial?.lastEdited ?? today,
    year: initial?.year && initial.year !== 'unknown' ? initial.year : '',
    category: initial?.category ?? 'worldbuilding',
    tags: initial?.tags ?? [],
    published: initial?.published ?? false,
  };

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [authorNote, setAuthorNote] = useState(initial?.authorNote ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [titleTr, setTitleTr] = useState(initial?.tr.title ?? '');
  const [descriptionTr, setDescriptionTr] = useState(initial?.tr.description ?? '');
  const [authorNoteTr, setAuthorNoteTr] = useState(initial?.tr.authorNote ?? '');
  const [contentTr, setContentTr] = useState(initial?.tr.content ?? '');
  const [lang, setLang] = useState<'en' | 'tr'>('en');
  const [category, setCategory] = useState<Category>(initial?.category ?? 'worldbuilding');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [releaseDate, setReleaseDate] = useState(initial?.releaseDate ?? today);
  const [lastEdited, setLastEdited] = useState(initial?.lastEdited ?? today);
  const [year, setYear] = useState(initial?.year && initial.year !== 'unknown' ? initial.year : '');
  const [published, setPublished] = useState(initial?.published ?? false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [draft, setDraft] = useState<DraftSnapshot | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as DraftSnapshot;
      const differs = Object.entries(parsed.values).some(
        ([key, value]) => JSON.stringify(value) !== JSON.stringify(initialValues[key])
      );
      return differs ? parsed : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(
          draftKey,
          JSON.stringify({
            savedAt: Date.now(),
            values: {
              title,
              description,
              authorNote,
              content,
              titleTr,
              descriptionTr,
              authorNoteTr,
              contentTr,
              releaseDate,
              lastEdited,
              year,
              category,
              tags,
              published,
            },
          })
        );
      } catch {}
    }, 800);
    return () => clearTimeout(timer);
  }, [
    draftKey,
    title,
    description,
    authorNote,
    content,
    titleTr,
    descriptionTr,
    authorNoteTr,
    contentTr,
    releaseDate,
    lastEdited,
    year,
    category,
    tags,
    published,
  ]);

  function restoreDraft() {
    if (!draft) return;
    const v = draft.values;
    setTitle(String(v.title ?? ''));
    setDescription(String(v.description ?? ''));
    setAuthorNote(String(v.authorNote ?? ''));
    setContent(String(v.content ?? ''));
    setTitleTr(String(v.titleTr ?? ''));
    setDescriptionTr(String(v.descriptionTr ?? ''));
    setAuthorNoteTr(String(v.authorNoteTr ?? ''));
    setContentTr(String(v.contentTr ?? ''));
    setReleaseDate(String(v.releaseDate ?? today));
    setLastEdited(String(v.lastEdited ?? today));
    setYear(String(v.year ?? ''));
    setCategory((v.category as Category) ?? 'worldbuilding');
    setTags(Array.isArray(v.tags) ? v.tags.filter((t): t is string => typeof t === 'string') : []);
    setPublished(v.published === true);
    setDraft(null);
  }

  function discardDraft() {
    try {
      window.localStorage.removeItem(draftKey);
    } catch {}
    setDraft(null);
  }

  const changedFields = draft
    ? Object.keys(FIELD_LABELS).filter(
        (key) => JSON.stringify(draft.values[key]) !== JSON.stringify(initialValues[key])
      )
    : [];

  function toggleTag(tag: string) {
    setTags((current) => {
      if (current.includes(tag)) return current.filter((t) => t !== tag);
      const group = TAG_GROUPS[category].find((g) => g.tags.includes(tag));
      if (!group) return [...current, tag];
      return [...current.filter((t) => !group.tags.includes(t)), tag];
    });
  }

  function handleCategoryChange(next: Category) {
    setCategory(next);
    setTags([]);
    if (next !== 'story') setYear('');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      title,
      description,
      authorNote,
      content,
      tr: { title: titleTr, description: descriptionTr, authorNote: authorNoteTr, content: contentTr },
      lastEdited,
      releaseDate,
      year: category === 'story' ? (year.trim() === '' ? 'unknown' : year.trim()) : 'unknown',
      category,
      tags,
      published,
    };

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

      try {
        window.localStorage.removeItem(draftKey);
      } catch {}
      router.push('/admin');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-gray-100 placeholder:text-[#8a7f9e] outline-none transition focus:border-[#71B280]/70 focus:bg-white/10';
  const labelClass = 'text-sm font-medium text-gray-200';

  const isTr = lang === 'tr';
  const values = {
    title: isTr ? titleTr : title,
    description: isTr ? descriptionTr : description,
    authorNote: isTr ? authorNoteTr : authorNote,
    content: isTr ? contentTr : content,
  };
  const setters = {
    title: isTr ? setTitleTr : setTitle,
    description: isTr ? setDescriptionTr : setDescription,
    authorNote: isTr ? setAuthorNoteTr : setAuthorNote,
    content: isTr ? setContentTr : setContent,
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {draft && changedFields.length > 0 && (
        <div className="rounded-lg border border-[#FFE47A]/40 bg-[#FFE47A]/10 px-4 py-3">
          <p className="text-sm text-[#FFE47A]">
            Unsaved draft found from {new Date(draft.savedAt).toLocaleString()} — differs in:{' '}
            {changedFields.map((key) => FIELD_LABELS[key]).join(', ')}.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={restoreDraft}
              className="rounded-lg border border-[#FFE47A]/60 bg-[#FFE47A]/15 px-3 py-1.5 text-sm font-medium text-[#FFE47A] transition hover:bg-[#FFE47A]/25"
            >
              Restore draft
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-[#B3B3B3] transition hover:border-white/30 hover:text-white"
            >
              Discard
            </button>
          </div>
        </div>
      )}
      <div className="grid items-stretch gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-2">
            <legend className={labelClass}>Version</legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['en', 'English'],
                  ['tr', 'Türkçe'],
                ] as const
              ).map(([value, label]) => {
                const active = lang === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLang(value)}
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
              {isTr
                ? 'Türkçe — shown to visitors whose site language is Turkish. Falls back to English for missing fields.'
                : 'English — the canonical version of this entry.'}
            </p>
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className={labelClass}>
              Title
            </label>
            <input
              id="title"
              type="text"
              className={inputClass}
              value={values.title}
              onChange={(e) => setters.title(e.target.value)}
              required={!isTr}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              rows={2}
              className={inputClass}
              value={values.description}
              onChange={(e) => setters.description(e.target.value)}
            />
            <p className="text-xs text-[#8a7f9e]">
              Short summary shown on the entry and its card in the listing. Rendered as plain text.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="authorNote" className={labelClass}>
              Author note
            </label>
            <textarea
              id="authorNote"
              rows={2}
              className={inputClass}
              value={values.authorNote}
              onChange={(e) => setters.authorNote(e.target.value)}
            />
            <p className="text-xs text-[#8a7f9e]">
              Optional note shown above the content. Rendered as plain text.
            </p>
          </div>

<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

        {category === 'story' && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="year" className={labelClass}>
              Year
            </label>
            <input
              id="year"
              type="number"
              min={0}
              max={9999}
              step={1}
              className={inputClass}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Unknown (default)"
            />
            <p className="text-xs text-[#8a7f9e]">
              The fictional year the story takes place in. Leave empty for unknown.
            </p>
          </div>
        )}
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

      <fieldset className="flex flex-col gap-3">
        <legend className="flex items-center gap-1">
          <span className={labelClass}>Tags</span>
          <Tooltip
            content={tagGroupMeanings(category, CATEGORY_TAGS[category], {
              labelOf: (t) => t,
              groupLabelOf: (name) => TAG_GROUP_LABELS[name] ?? '',
              meaningOf: (t) => TAG_MEANINGS[t] ?? 'No description yet.',
            })}
          />
        </legend>
        {TAG_GROUPS[category].map((group) => (
          <div key={group.name} className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 text-xs uppercase tracking-wide text-[#8a7f9e] sm:w-24">
              {TAG_GROUP_LABELS[group.name] ?? group.name}
            </span>
            {group.tags.map((tag) => {
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
        ))}
      </fieldset>

      </div>

      <div className="flex flex-col gap-2">
        <h4 className={labelClass}>Markdown details</h4>
        <ul className="flex flex-1 flex-col gap-1.5 rounded-lg border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-[#B3B3B3]">
          {MARKDOWN_NOTES.map((note) => (
            <li key={note.syntax} className="flex items-baseline gap-2">
              <code className="shrink-0 whitespace-pre-wrap font-mono text-[#FFE47A]">
                {note.syntax}
              </code>
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
            value={values.content}
            onChange={(e) => setters.content(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <h4 className={labelClass}>Preview{isTr ? ' (Türkçe)' : ''}</h4>
          <div className="max-h-[70vh] min-h-40 flex-1 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-6">
            {values.content.trim() ? (
              <Markdown source={values.content} />
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
