import 'server-only';

import { getDB } from './db';
import { listQuestions } from './questions';
import { CATEGORY_TO_SECTION, type Category } from './categories';

export interface SearchHit {
  kind: 'page' | 'question';
  title: string;
  subtitle: string;
  href: string;
}

interface RankedHit extends SearchHit {
  score: number;
}

export const MAX_QUERY_LENGTH = 100;

interface EntrySearchRow {
  slug: string;
  title: string;
  description: string;
  content: string;
  title_tr: string;
  description_tr: string;
  content_tr: string;
  tags: string;
  category: Category;
}

const APOSTROPHES = /[\u2018\u2019']/g;

export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(APOSTROPHES, '')
    .replace(/[^a-z0-9]+/g, ' ');
}

export function searchTokens(input: string): string[] {
  return normalizeText(input).split(' ').filter(Boolean);
}

function withinEditDistance(a: string, b: string, cap: number): boolean {
  if (Math.abs(a.length - b.length) > cap) return false;
  let prev: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur: number[] = new Array(b.length + 1);
    cur[0] = i;
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    prev = cur;
    if (rowMin > cap) return false;
  }
  return prev[b.length] <= cap;
}

function tokenMatches(queryToken: string, docToken: string): boolean {
  if (queryToken === docToken) return true;
  if (queryToken.length <= 1) return false;
  const cap = queryToken.length < 4 ? 1 : 2;
  if (Math.abs(queryToken.length - docToken.length) > cap) return false;
  return withinEditDistance(queryToken, docToken, cap);
}

interface SearchField {
  tokens: Set<string>;
  weight: number;
}

function fieldFrom(text: string, weight: number): SearchField {
  return { tokens: new Set(searchTokens(text)), weight };
}

function scoreFields(fields: SearchField[], queryTokens: string[]): number {
  let matched = 0;
  let weighted = 0;
  for (const queryToken of queryTokens) {
    let best = 0;
    for (const field of fields) {
      for (const docToken of field.tokens) {
        if (tokenMatches(queryToken, docToken)) {
          if (field.weight > best) best = field.weight;
          break;
        }
      }
    }
    if (best > 0) {
      matched += 1;
      weighted += best;
    }
  }
  if (matched === 0) return 0;
  const ratio = matched / queryTokens.length;
  if (ratio < 0.5) return 0;
  return weighted * ratio;
}

function parseTags(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.join(' ') : '';
  } catch {
    return '';
  }
}

export function searchAll(query: string): SearchHit[] {
  const queryTokens = searchTokens(query);
  if (queryTokens.length === 0 || queryTokens.length > 6) return [];

  const hits: RankedHit[] = [];

  const rows = getDB()
    .prepare(
      `SELECT slug, title, description, content, title_tr, description_tr, content_tr, tags, category
       FROM entries WHERE published = 1`
    )
    .all() as unknown as EntrySearchRow[];

  for (const row of rows) {
    const fields: SearchField[] = [
      fieldFrom(row.title, 3),
      fieldFrom(row.title_tr, 3),
      fieldFrom(row.description, 2),
      fieldFrom(row.description_tr, 2),
      fieldFrom(parseTags(row.tags), 1.5),
      fieldFrom(row.content, 1),
      fieldFrom(row.content_tr, 1),
    ];
    const score = scoreFields(fields, queryTokens);
    if (score === 0) continue;
    hits.push({
      kind: 'page',
      title: row.title,
      subtitle: row.description || row.title_tr,
      href: `/${CATEGORY_TO_SECTION[row.category]}/${row.slug}`,
      score,
    });
  }

  for (const question of listQuestions({ published: true })) {
    const fields: SearchField[] = [
      fieldFrom(question.name, 1),
      fieldFrom(question.question, 2),
      fieldFrom(question.answer, 1),
    ];
    const score = scoreFields(fields, queryTokens);
    if (score === 0) continue;
    hits.push({
      kind: 'question',
      title: question.name || 'Anonymous',
      subtitle: question.question,
      href: `/community#q-${question.id}`,
      score,
    });
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, 10);
}