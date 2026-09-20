import 'server-only';

import { createHash } from 'node:crypto';
import { getDB } from './db';

export interface Question {
  id: number;
  name: string;
  question: string;
  answer: string;
  published: boolean;
  createdAt: string;
}

interface QuestionRow {
  id: number;
  name: string;
  question: string;
  answer: string;
  published: number;
  created_at: string;
}

export const QUESTION_MIN_LENGTH = 5;
export const QUESTION_MAX_LENGTH = 2000;
export const QUESTION_NAME_MAX_LENGTH = 60;
export const QUESTION_ANSWER_MAX_LENGTH = 20000;

export const RATE_WINDOW_MS = 60 * 60 * 1000;
export const GLOBAL_HOURLY_MAX = 40;

export class RateLimitedError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super('Rate limited');
    this.name = 'RateLimitedError';
  }
}

function rowToQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    name: row.name,
    question: row.question,
    answer: row.answer,
    published: row.published === 1,
    createdAt: row.created_at,
  };
}

export function listQuestions(options: { published?: boolean } = {}): Question[] {
  const conditions: string[] = [];
  const params: Record<string, number> = {};
  if (options.published !== undefined) {
    conditions.push('published = :published');
    params.published = options.published ? 1 : 0;
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = getDB()
    .prepare(`SELECT id, name, question, answer, published, created_at FROM questions ${where} ORDER BY id DESC`)
    .all(params) as unknown as QuestionRow[];
  return rows.map(rowToQuestion);
}

export function getQuestionById(id: number): Question | undefined {
  const row = getDB()
    .prepare('SELECT id, name, question, answer, published, created_at FROM questions WHERE id = ?')
    .get(id) as unknown as QuestionRow | undefined;
  return row ? rowToQuestion(row) : undefined;
}

export function createQuestion(input: { name: string; question: string }): Question {
  const result = getDB()
    .prepare('INSERT INTO questions (name, question) VALUES (?, ?)')
    .run(input.name, input.question);
  return getQuestionById(Number(result.lastInsertRowid))!;
}

export function updateQuestion(
  id: number,
  input: { name: string; question: string; answer: string; published: boolean }
): Question | undefined {
  const result = getDB()
    .prepare('UPDATE questions SET name = ?, question = ?, answer = ?, published = ? WHERE id = ?')
    .run(input.name, input.question, input.answer, input.published ? 1 : 0, id);
  if (result.changes === 0) return undefined;
  return getQuestionById(id);
}

export function setQuestionPublished(id: number, published: boolean): boolean {
  const result = getDB()
    .prepare('UPDATE questions SET published = ? WHERE id = ?')
    .run(published ? 1 : 0, id);
  return result.changes > 0;
}

export function deleteQuestion(id: number): boolean {
  const result = getDB().prepare('DELETE FROM questions WHERE id = ?').run(id);
  return result.changes > 0;
}

export function hashIp(ip: string): string {
  return createHash('sha256').update(`enia:${ip}`).digest('hex');
}

export function checkQuestionRateLimit(ipHash: string): void {
  const db = getDB();
  const hourAgoSeconds = Math.floor((Date.now() - 60 * 60 * 1000) / 1000);
  const recent = db
    .prepare("SELECT COUNT(*) AS count FROM questions WHERE created_at >= datetime(?, 'unixepoch')")
    .get(hourAgoSeconds) as { count: number };
  if (recent.count >= GLOBAL_HOURLY_MAX) {
    throw new RateLimitedError(3600);
  }
  const row = db.prepare('SELECT last_at FROM question_ips WHERE ip_hash = ?').get(ipHash) as
    | { last_at: number }
    | undefined;
  if (row) {
    const elapsed = Date.now() - row.last_at;
    if (elapsed < RATE_WINDOW_MS) {
      throw new RateLimitedError(Math.ceil((RATE_WINDOW_MS - elapsed) / 1000));
    }
  }
}

export function recordQuestionSubmission(ipHash: string): void {
  const db = getDB();
  db.prepare(
    'INSERT INTO question_ips (ip_hash, last_at) VALUES (?, ?) ON CONFLICT(ip_hash) DO UPDATE SET last_at = excluded.last_at'
  ).run(ipHash, Date.now());
  db.prepare('DELETE FROM question_ips WHERE last_at < ?').run(Date.now() - 24 * 60 * 60 * 1000);
}