import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import type { Entry } from './types';
import { isCategory, isTagForCategory, groupTags, TAG_GROUP_LABELS, TAG_GROUPS, type Category } from './categories';
import { hashPassword } from './password';
import { migrateSchema } from './schema';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = process.env.DATABASE_PATH ?? path.join(DATA_DIR, 'enia.db');

fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
`);

migrateSchema(db);

function ensureAdminUser() {
  const username = process.env.ADMIN_USERNAME ?? 'admin';
  const password = process.env.ADMIN_PASSWORD ?? 'admin';

  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (exists) {
    db.prepare('UPDATE users SET is_admin = 1 WHERE username = ?').run(username);
    return;
  }

  const { salt, hash } = hashPassword(password);
  db.prepare('INSERT OR IGNORE INTO users (username, password_hash, is_admin) VALUES (?, ?, 1)').run(
    username,
    `${salt}:${hash}`
  );
}

ensureAdminUser();

interface EntryRow {
  id: number;
  slug: string;
  title: string;
  author_note: string;
  content: string;
  last_edited: string;
  release_date: string;
  category: string;
  tags: string;
  published: number;
  created_at: string;
}

function parseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((t) => typeof t === 'string') : [];
  } catch {
    return [];
  }
}

function rowToEntry(row: EntryRow): Entry {
  return {
    slug: row.slug,
    title: row.title,
    authorNote: row.author_note,
    content: row.content,
    lastEdited: row.last_edited,
    releaseDate: row.release_date,
    category: row.category as Category,
    tags: parseTags(row.tags),
    published: row.published === 1,
  };
}

export interface EntrySummary {
  slug: string;
  title: string;
  lastEdited: string;
  releaseDate: string;
  category: Category;
  tags: string[];
  published: boolean;
}

export interface ListOptions {
  category?: Category;
  tags?: string[];
  sort?: 'release' | 'edited' | 'created';
  order?: 'asc' | 'desc';
  published?: boolean;
}

function selectEntries(options: ListOptions, onlyPublished: boolean): EntryRow[] {
  const conditions: string[] = [];
  const params: Record<string, string> = {};

  if (onlyPublished) conditions.push('published = 1');
  if (options.published !== undefined) conditions.push(`published = ${options.published ? 1 : 0}`);
  if (options.category) {
    conditions.push('category = :category');
    params.category = options.category;
  }
  if (options.tags && options.tags.length > 0) {
    let index = 0;
    for (const group of groupTags(options.category, options.tags)) {
      const clause = group
        .map((tag) => {
          const key = `tag${index++}`;
          params[key] = JSON.stringify(tag);
          return `tags LIKE '%' || :${key} || '%'`;
        })
        .join(' OR ');
      conditions.push(`(${clause})`);
    }
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const column =
    options.sort === 'edited' ? 'last_edited' : options.sort === 'created' ? 'created_at' : 'release_date';
  const direction = options.order === 'asc' ? 'ASC' : 'DESC';
  const orderBy = options.sort ? `ORDER BY ${column} ${direction}, id DESC` : 'ORDER BY id DESC';

  return db
    .prepare(
      `SELECT slug, title, last_edited, release_date, category, tags, published FROM entries ${where} ${orderBy}`
    )
    .all(params) as unknown as EntryRow[];
}

function toSummary(row: EntryRow): EntrySummary {
  return {
    slug: row.slug,
    title: row.title,
    lastEdited: row.last_edited,
    releaseDate: row.release_date,
    category: row.category as Category,
    tags: parseTags(row.tags),
    published: row.published === 1,
  };
}

export function listEntries(options: ListOptions = {}): EntrySummary[] {
  return selectEntries(options, true).map(toSummary);
}

export function getEntryBySlug(slug: string): Entry | undefined {
  const row = db.prepare('SELECT * FROM entries WHERE slug = ?').get(slug) as unknown as EntryRow | undefined;
  return row ? rowToEntry(row) : undefined;
}

export function getAllEntries(options: ListOptions = {}): EntrySummary[] {
  return selectEntries(options, false).map(toSummary);
}

export interface EntryInput {
  title: string;
  authorNote: string;
  content: string;
  lastEdited: string;
  releaseDate: string;
  category: Category;
  tags: string[];
  published: boolean;
}

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[ı]/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'untitled';
}

export function validateEntryInput(input: unknown): EntryInput {
  if (!input || typeof input !== 'object') throw new Error('Invalid payload');

  const raw = input as Record<string, unknown>;

  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!title) throw new Error('Title is required');

  const category = typeof raw.category === 'string' ? raw.category : '';
  if (!isCategory(category)) throw new Error('Invalid category');

  const authorNote = typeof raw.authorNote === 'string' ? raw.authorNote : '';
  const content = typeof raw.content === 'string' ? raw.content : '';

  const today = new Date().toISOString().slice(0, 10);
  const lastEdited =
    typeof raw.lastEdited === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.lastEdited)
      ? raw.lastEdited
      : today;
  const releaseDate =
    typeof raw.releaseDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.releaseDate)
      ? raw.releaseDate
      : today;

  const tags = Array.isArray(raw.tags) ? raw.tags.filter((t): t is string => typeof t === 'string') : [];
  for (const tag of tags) {
    if (!isTagForCategory(category, tag)) throw new Error(`Tag "${tag}" is not valid for this category`);
  }
  for (const group of TAG_GROUPS[category]) {
    if (group.tags.filter((t) => tags.includes(t)).length > 1) {
      throw new Error(`Only one tag allowed from "${TAG_GROUP_LABELS[group.name] ?? group.name}"`);
    }
  }

  const published = raw.published === true;

  return { title, authorNote, content, lastEdited, releaseDate, category, tags, published };
}

function uniqueSlug(base: string): string {
  const exists = (candidate: string) => !!db.prepare('SELECT id FROM entries WHERE slug = ?').get(candidate);
  if (!exists(base)) return base;
  let n = 2;
  while (exists(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function createEntry(input: EntryInput): Entry {
  const slug = uniqueSlug(slugify(input.title));
  const tagsJson = JSON.stringify(input.tags);
  db.prepare(
    `INSERT INTO entries (slug, title, author_note, content, last_edited, release_date, category, tags, published)
     VALUES (:slug, :title, :author_note, :content, :last_edited, :release_date, :category, :tags, :published)`
  ).run({
    slug,
    title: input.title,
    author_note: input.authorNote,
    content: input.content,
    last_edited: input.lastEdited,
    release_date: input.releaseDate,
    category: input.category,
    tags: tagsJson,
    published: input.published ? 1 : 0,
  });
  return getEntryBySlug(slug)!;
}

export function updateEntry(slug: string, input: EntryInput): Entry | undefined {
  const existing = db.prepare('SELECT id FROM entries WHERE slug = ?').get(slug);
  if (!existing) return undefined;

  const newSlug = slugify(input.title);
  const slugExists = db
    .prepare('SELECT id FROM entries WHERE slug = ? AND slug != ?')
    .get(newSlug, slug);
  const finalSlug = slugExists ? uniqueSlug(newSlug) : newSlug;

  db.prepare(
    `UPDATE entries SET slug = :slug, title = :title, author_note = :author_note, content = :content,
     last_edited = :last_edited, release_date = :release_date, category = :category, tags = :tags,
     published = :published
     WHERE id = :id`
  ).run({
    slug: finalSlug,
    title: input.title,
    author_note: input.authorNote,
    content: input.content,
    last_edited: input.lastEdited,
    release_date: input.releaseDate,
    category: input.category,
    tags: JSON.stringify(input.tags),
    published: input.published ? 1 : 0,
    id: (existing as { id: number }).id,
  });

  return getEntryBySlug(finalSlug);
}

export function setEntryPublished(slug: string, published: boolean): Entry | undefined {
  const result = db
    .prepare('UPDATE entries SET published = ? WHERE slug = ?')
    .run(published ? 1 : 0, slug);
  if (result.changes === 0) return undefined;
  return getEntryBySlug(slug);
}

export function deleteEntry(slug: string): boolean {
  const result = db.prepare('DELETE FROM entries WHERE slug = ?').run(slug);
  return result.changes > 0;
}
