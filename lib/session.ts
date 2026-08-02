import { cookies } from 'next/headers';
import { getSessionUser, SESSION_COOKIE } from './auth';
import type { AdminUser } from './types';

export async function getCurrentUser(): Promise<AdminUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return getSessionUser(token);
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const user = await getCurrentUser();
  return user?.isAdmin ? user : null;
}
