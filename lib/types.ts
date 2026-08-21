import type { Category } from './categories';

export interface EntryTranslation {
  title: string;
  description: string;
  authorNote: string;
  content: string;
}

export interface Entry {
  slug: string;
  title: string;
  description: string;
  authorNote: string;
  content: string;
  tr: EntryTranslation | null;
  lastEdited: string;
  releaseDate: string;
  category: Category;
  tags: string[];
  published: boolean;
}

export interface AdminUser {
  id: number;
  username: string;
  isAdmin: boolean;
}
