import Link from 'next/link';
import type { ReactNode } from 'react';
import type { AdminUser } from '@/lib/types';
import type { EntrySummary } from '@/lib/db';
import {
  CATEGORIES,
  CATEGORY_TO_SECTION,
  CATEGORY_TITLES,
  type Category,
} from '@/lib/categories';
import LogoutButton from './LogoutButton';
import DeleteButton from './DeleteButton';
import PublishButton from './PublishButton';

function formatDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}.${month}.${year}`;
}

export interface AdminFilter {
  sort: 'release' | 'edited' | 'created';
  order: 'asc' | 'desc';
  category?: Category;
  tag?: string;
  status?: 'public' | 'private';
}

function buildUrl(current: AdminFilter, patch: Partial<AdminFilter>): string {
  const merged = { ...current, ...patch };
  const params = new URLSearchParams();
  if (merged.sort !== 'created') params.set('sort', merged.sort);
  if (merged.order !== 'desc') params.set('order', merged.order);
  if (merged.category) params.set('category', merged.category);
  if (merged.tag) params.set('tag', merged.tag);
  if (merged.status) params.set('status', merged.status);
  const qs = params.toString();
  return qs ? `/admin?${qs}` : '/admin';
}

function pillClass(active: boolean): string {
  return active
    ? 'rounded-full border border-[#FFE47A]/60 bg-[#FFE47A]/15 px-3 py-1 text-sm font-medium text-[#FFE47A] transition'
    : 'rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm font-medium text-[#B3B3B3] transition hover:border-white/30 hover:text-white';
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-[#8a7f9e]">{label}:</span>
      {children}
    </div>
  );
}

export default function AdminDashboard({
  user,
  entries,
  tagOptions,
  filter,
}: {
  user: AdminUser;
  entries: EntrySummary[];
  tagOptions: string[];
  filter: AdminFilter;
}) {
  const hasFilter =
    filter.category !== undefined ||
    filter.tag !== undefined ||
    filter.status !== undefined ||
    filter.sort !== 'created' ||
    filter.order !== 'desc';

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#71B280] to-[#FFE47A] bg-clip-text text-transparent">
            Admin
          </h1>
          <p className="mt-1 text-sm text-[#8a7f9e]">Signed in as {user.username}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/new"
            className="rounded-lg bg-[#23194e] px-4 py-2 text-sm font-semibold text-gray-100 transition hover:bg-[#3b144d]"
          >
            New entry
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <FilterGroup label="Sort">
          {(
            [
              ['Newest', 'created', 'desc'],
              ['Oldest', 'created', 'asc'],
              ['Recently edited', 'edited', 'desc'],
            ] as const
          ).map(([label, sort, order]) => (
            <Link
              key={label}
              className={pillClass(filter.sort === sort && filter.order === order)}
              href={buildUrl(filter, { sort, order })}
            >
              {label}
            </Link>
          ))}
        </FilterGroup>

        <FilterGroup label="Category">
          <Link
            className={pillClass(!filter.category)}
            href={buildUrl(filter, { category: undefined, tag: undefined })}
          >
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              className={pillClass(filter.category === c)}
              href={buildUrl(filter, { category: c, tag: undefined })}
            >
              {CATEGORY_TITLES[c]}
            </Link>
          ))}
        </FilterGroup>

        <FilterGroup label="Tag">
          <Link className={pillClass(!filter.tag)} href={buildUrl(filter, { tag: undefined })}>
            All
          </Link>
          {tagOptions.map((t) => (
            <Link key={t} className={pillClass(filter.tag === t)} href={buildUrl(filter, { tag: t })}>
              {t}
            </Link>
          ))}
        </FilterGroup>

        <FilterGroup label="Visibility">
          <Link className={pillClass(!filter.status)} href={buildUrl(filter, { status: undefined })}>
            All
          </Link>
          <Link
            className={pillClass(filter.status === 'public')}
            href={buildUrl(filter, { status: 'public' })}
          >
            Public
          </Link>
          <Link
            className={pillClass(filter.status === 'private')}
            href={buildUrl(filter, { status: 'private' })}
          >
            Private
          </Link>
        </FilterGroup>
      </div>

      {entries.length === 0 ? (
        <div className="mt-12 flex flex-col items-start gap-2 text-[#8a7f9e]">
          {hasFilter ? (
            <>
              <p>No entries match these filters.</p>
              <Link href="/admin" className="text-sm font-medium text-[#71B280] hover:underline">
                Clear filters
              </Link>
            </>
          ) : (
            <p>
              No entries yet.{' '}
              <Link href="/admin/new" className="text-[#71B280] hover:underline">
                Create your first entry
              </Link>
              .
            </p>
          )}
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-[#8a7f9e]">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Tags</th>
                <th className="px-4 py-3 font-medium">Released</th>
                <th className="px-4 py-3 font-medium">Edited</th>
                <th className="px-4 py-3 font-medium">Visibility</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.slug} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <Link
                      href={
                        entry.published
                          ? `/${CATEGORY_TO_SECTION[entry.category]}/${entry.slug}`
                          : `/admin/${entry.slug}`
                      }
                      className="font-semibold text-gray-100 hover:text-[#FFE47A] transition"
                    >
                      {entry.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[#B3B3B3]">{CATEGORY_TITLES[entry.category]}</td>
                  <td className="px-4 py-3 text-[#B3B3B3]">
                    {entry.tags.length > 0 ? entry.tags.join(', ') : '—'}
                  </td>
                  <td className="px-4 py-3 text-[#B3B3B3]">{formatDate(entry.releaseDate)}</td>
                  <td className="px-4 py-3 text-[#B3B3B3]">{formatDate(entry.lastEdited)}</td>
                  <td className="px-4 py-3">
                    {entry.published ? (
                      <span className="rounded-full border border-[#71B280]/40 bg-[#71B280]/10 px-2.5 py-0.5 text-xs font-medium text-[#8fd19e]">
                        Public
                      </span>
                    ) : (
                      <span className="rounded-full border border-[#8a7f9e]/40 bg-[#8a7f9e]/10 px-2.5 py-0.5 text-xs font-medium text-[#8a7f9e]">
                        Private
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/${entry.slug}`}
                        className="text-sm font-medium text-[#71B280] transition hover:text-[#8fd19e]"
                      >
                        Edit
                      </Link>
                      <PublishButton slug={entry.slug} published={entry.published} />
                      <DeleteButton slug={entry.slug} />
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
