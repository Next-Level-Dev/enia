import { randomBytes } from 'node:crypto';
import { db } from './db';
import { verifyPassword } from './password';
import type { AdminUser } from './types';

export const SESSION_COOKIE = 'enia_session';
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days in seconds

export function createSession(userId: number): { token: string; expiresAt: Date } {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(
    token,
    userId,
    expiresAt.getTime()
  );
  return { token, expiresAt };
}

export function getSessionUser(token: string | undefined): AdminUser | null {
  if (!token) return null;

  const row = db
    .prepare(
      `SELECT s.user_id, u.username, u.is_admin, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`
    )
    .get(token) as unknown as
    | { user_id: number; username: string; is_admin: number; expires_at: number }
    | undefined;

  if (!row) return null;

  if (row.expires_at < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }

  return { id: row.user_id, username: row.username, isAdmin: row.is_admin === 1 };
}

export function deleteSession(token: string | undefined): void {
  if (!token) return;
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function findUserByCredentials(username: string, password: string): AdminUser | null {
  const row = db
    .prepare('SELECT id, username, password_hash, is_admin FROM users WHERE username = ?')
    .get(username) as unknown as
    | { id: number; username: string; password_hash: string; is_admin: number }
    | undefined;
  if (!row) return null;

  const [salt, hash] = String(row.password_hash).split(':');
  if (!salt || !hash || !verifyPassword(password, salt, hash)) return null;
  return { id: row.id, username: row.username, isAdmin: row.is_admin === 1 };
}
