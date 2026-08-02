import type { Category } from './categories';

export interface Entry {
  slug: string;
  title: string;
  authorNote: string;
  content: string;
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
