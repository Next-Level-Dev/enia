'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CATEGORIES,
  CATEGORY_TAGS,
  CATEGORY_TO_SECTION,
  TAG_GROUP_LABELS,
  TAG_GROUPS,
  TAG_MEANINGS,
  tagGroupMeanings,
  type Category,
} from '@/lib/categories';
import { countWords } from '@/lib/wordcount';
import type { Lang } from '@/lib/i18n';
import type { Entry } from '@/lib/types';
import EntryView from '@/components/EntryView';
import Tooltip from '@/components/Tooltip';
import MarkdownGuide from './MarkdownGuide';
import EditorLanguageToggle from './EditorLanguageToggle';
import EditorBottomBar, { type EditorTab } from './EditorBottomBar';

export interface EntryEditorInitial {
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
  lastTranslated: string;
  releaseDate: string;
  year: string;
  category: Category;
  tags: string[];
  published: boolean;
}

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
  lastTranslated: 'Last translated',
  year: 'Year',
  category: 'Category',
  tags: 'Tags',
  published: 'Visibility',
};

const TAB_LABELS: Record<EditorTab, string> = {
  overview: 'Overview',
  draft: 'Draft',
  preview: 'Preview',
};

const inputClass =
  'w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-gray-100 placeholder:text-[#8a7f9e] outline-none transition focus:border-[#71B280]/70 focus:bg-white/10';
const labelClass = 'text-sm font-medium text-gray-200';
const currentInputClass =
  'w-full cursor-not-allowed rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2.5 text-[#8a7f9e] opacity-60 outline-none';
const dateHintClass = 'text-xs font-medium uppercase tracking-wide text-[#8a7f9e]';

function FieldHint({ children, fallback }: { children?: string; fallback: string }) {
  if (children) return <p className="text-xs text-[#8a7f9e]">{children}</p>;
  return <p className="text-xs text-[#FFE47A]/80">{fallback}</p>;
}

export default function EntryEditor({
  mode,
  initial,
  initialTab = 'overview',
  initialLang = 'en',
}: {
  mode: 'create' | 'edit';
  initial?: EntryEditorInitial;
  initialTab?: EditorTab;
  initialLang?: Lang;
}) {
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
    lastEdited: today,
    lastTranslated: initial?.lastTranslated ?? today,
    year: initial?.year && initial.year !== 'unknown' ? initial.year : '',
    category: initial?.category ?? 'worldbuilding',
    tags: initial?.tags ?? [],
    published: initial?.published ?? false,
  };

  const [tab, setTab] = useState<EditorTab>(initialTab);
  const [lang, setLang] = useState<Lang>(initialLang);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [authorNote, setAuthorNote] = useState(initial?.authorNote ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [titleTr, setTitleTr] = useState(initial?.tr.title ?? '');
  const [descriptionTr, setDescriptionTr] = useState(initial?.tr.description ?? '');
  const [authorNoteTr, setAuthorNoteTr] = useState(initial?.tr.authorNote ?? '');
  const [contentTr, setContentTr] = useState(initial?.tr.content ?? '');
  const [category, setCategory] = useState<Category>(initial?.category ?? 'worldbuilding');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [releaseDate, setReleaseDate] = useState(initial?.releaseDate ?? today);
  const [lastEdited, setLastEdited] = useState(today);
  const [lastTranslated, setLastTranslated] = useState(initial?.lastTranslated ?? today);
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

  const values = useMemo(
    () =>
      lang === 'tr'
        ? { title: titleTr, description: descriptionTr, authorNote: authorNoteTr, content: contentTr }
        : { title, description, authorNote, content },
    [lang, title, titleTr, description, descriptionTr, authorNote, authorNoteTr, content, contentTr]
  );

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
              lastTranslated,
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
    lastTranslated,
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
    setLastTranslated(String(v.lastTranslated ?? initial?.lastTranslated ?? today));
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

  async function handleSave() {
    setLoading(true);
    setError('');

    const payload = {
      title: mode === 'create' ? title : title || initial!.title,
      description,
      authorNote,
      content,
      tr: { title: titleTr, description: descriptionTr, authorNote: authorNoteTr, content: contentTr },
      lastEdited,
      lastTranslated,
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

  // Keep the URL in step with the active tab and language so a reload (or a
  // shared link) lands on the same view.
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('tab', tab);
    params.set('lang', lang);
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  }, [tab, lang]);

  const changeTab = useCallback((next: EditorTab) => setTab(next), []);
  const changeLang = useCallback((next: Lang) => setLang(next), []);

  const isTr = lang === 'tr';
  const effectiveYear = category === 'story' ? (year.trim() === '' ? 'unknown' : year.trim()) : 'unknown';

  const previewEntry: Entry = {
    slug: initial?.slug ?? 'preview',
    title: values.title,
    description: values.description,
    authorNote: values.authorNote,
    content: values.content,
    tr:
      titleTr || descriptionTr || authorNoteTr || contentTr
        ? { title: titleTr, description: descriptionTr, authorNote: authorNoteTr, content: contentTr }
        : null,
    lastEdited,
    lastTranslated,
    releaseDate,
    year: effectiveYear,
    wordCount: countWords(values.content),
    category,
    tags,
    published,
  };

  const overview = (
    <div className="grid items-start gap-6 lg:grid-cols-[7fr_3fr] lg:gap-8">
      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input
            id="title"
            type="text"
            className={`${inputClass} prose-input`}
            value={values.title}
            onChange={(e) => (isTr ? setTitleTr(e.target.value) : setTitle(e.target.value))}
            required={!isTr}
          />
          {isTr && (
            <FieldHint fallback="Empty — visitors see the English title instead.">
              {titleTr || undefined}
            </FieldHint>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            rows={2}
            className={`${inputClass} prose-input`}
            value={values.description}
            onChange={(e) =>
              isTr ? setDescriptionTr(e.target.value) : setDescription(e.target.value)
            }
          />
          {isTr ? (
            <FieldHint fallback="Empty — visitors see the English description instead.">
              {descriptionTr || undefined}
            </FieldHint>
          ) : (
            <p className="text-xs text-[#8a7f9e]">
              Short summary shown on the entry and its card in the listing. Rendered as plain text.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="authorNote" className={labelClass}>
            Author note
          </label>
          <textarea
            id="authorNote"
            rows={2}
            className={`${inputClass} prose-input`}
            value={values.authorNote}
            onChange={(e) =>
              isTr ? setAuthorNoteTr(e.target.value) : setAuthorNote(e.target.value)
            }
          />
          {isTr ? (
            <FieldHint fallback="Empty — visitors see the English note instead.">
              {authorNoteTr || undefined}
            </FieldHint>
          ) : (
            <p className="text-xs text-[#8a7f9e]">
              Optional note shown above the content. Rendered as plain text.
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
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

          <div className="flex flex-col gap-2">
            <span className={labelClass}>Last edited</span>
            {mode === 'edit' && (
              <div className="flex flex-col gap-1.5">
                <span className={dateHintClass}>Current</span>
                <input
                  type="date"
                  className={currentInputClass}
                  value={initial?.lastEdited ?? today}
                  disabled
                  readOnly
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lastEdited" className={dateHintClass}>
                {mode === 'edit' ? 'New' : 'Date'}
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
            <p className="text-xs text-[#8a7f9e]">
              {mode === 'edit'
                ? 'Defaults to today on every edit. Set an earlier date to keep a custom one.'
                : 'Set an earlier date if it should not be today.'}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="lastTranslated" className={labelClass}>
              Last translated
            </label>
            <input
              id="lastTranslated"
              type="date"
              className={inputClass}
              value={lastTranslated}
              onChange={(e) => setLastTranslated(e.target.value)}
              required
            />
            <p className="text-xs text-[#8a7f9e]">
              When the Türkçe version was last brought up to date with the English one. Never changed
              automatically — bump it by hand once you have retranslated.
            </p>
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

      <div className="lg:sticky lg:top-32">
        <MarkdownGuide />
      </div>
    </div>
  );

  const draftPane = (
    <div className="flex flex-1 flex-col gap-2">
      <label htmlFor="content" className="flex flex-wrap items-baseline justify-between gap-2">
        <span className={labelClass}>Content (Markdown)</span>
        <span className="text-xs text-[#8a7f9e]">
          {isTr ? 'Türkçe' : 'English'} · {countWords(values.content)} words
        </span>
      </label>
      <textarea
        id="content"
        aria-label={`Content (Markdown) — ${isTr ? 'Türkçe' : 'English'}`}
        placeholder={isTr ? 'Türkçe içeriği buraya yazın…' : 'Write the markdown content here…'}
        spellCheck={false}
        className={`${inputClass} prose-input min-h-[45vh] w-full flex-1 resize-none text-base leading-relaxed`}
        value={values.content}
        onChange={(e) => (isTr ? setContentTr(e.target.value) : setContent(e.target.value))}
      />
    </div>
  );

  const preview = (
    <EntryView
      lang={lang}
      section={CATEGORY_TO_SECTION[category]}
      entry={previewEntry}
      viewLang={lang}
      hasTranslation={previewEntry.tr !== null}
      showBackLink={false}
      showLangSwitch={false}
    >
      <aside className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#8a7f9e]">
          Preview
        </span>
        <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs font-medium text-[#B3B3B3]">
          {isTr ? 'Türkçe' : 'English'}
        </span>
        <span
          className={
            published
              ? 'rounded-full border border-[#71B280]/40 bg-[#71B280]/10 px-2 py-0.5 text-xs font-medium text-[#8fd19e]'
              : 'rounded-full border border-[#8a7f9e]/40 bg-[#8a7f9e]/10 px-2 py-0.5 text-xs font-medium text-[#8a7f9e]'
          }
        >
          {published ? 'Public' : 'Private'}
        </span>
        <span className="text-xs text-[#8a7f9e]">
          {isTr
            ? 'Empty Turkish fields fall back to English, exactly like the live page.'
            : 'The original version, exactly like the live page.'}
        </span>
      </aside>
    </EntryView>
  );

  return (
    <div className="flex min-h-[calc(100dvh-4.5rem)] flex-col">
      <div
        className={`mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 ${tab === 'overview' ? 'py-6 sm:py-8' : 'pt-10 sm:pt-12'}`}
      >
        <div className="mb-4 flex justify-end lg:sticky lg:top-24 lg:z-30">
          <EditorLanguageToggle lang={lang} onChange={changeLang} />
        </div>

        <header className={`${tab === 'overview' ? '' : 'hidden sm:block'} mb-5`}>
          <h1 className="truncate text-2xl font-extrabold bg-gradient-to-r from-[#71B280] to-[#FFE47A] bg-clip-text text-transparent sm:text-3xl">
            {mode === 'create' ? 'New entry' : values.title || 'Untitled'}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#8a7f9e]">
            <span>
              {mode === 'create' ? 'Drafting a new entry' : `/${CATEGORY_TO_SECTION[category]}/${initial!.slug}`}
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs font-medium text-[#B3B3B3]">
              {TAB_LABELS[tab]}
            </span>
          </p>

          {draft && changedFields.length > 0 && (
            <div className="mt-4 rounded-lg border border-[#FFE47A]/40 bg-[#FFE47A]/10 px-4 py-3">
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
        </header>

        {error && (
          <p className="mb-4 rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {tab === 'overview' && overview}
        {tab === 'draft' && draftPane}
        {tab === 'preview' && preview}
      </div>

      <div aria-hidden className="h-20 shrink-0 lg:h-16" />

      <EditorBottomBar
        tab={tab}
        onChange={changeTab}
        onSave={handleSave}
        saving={loading}
        saveLabel={mode === 'create' ? 'Create entry' : 'Save changes'}
        onCancel={() => router.push('/admin')}
      />
    </div>
  );
}