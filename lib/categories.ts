export type Category = 'worldbuilding' | 'story' | 'guide';

export const CATEGORIES: Category[] = ['worldbuilding', 'story', 'guide'];

export const CATEGORY_TAGS: Record<Category, string[]> = {
  worldbuilding: ['Heavy Spoiler', 'Light Spoiler'],
  story: ['Glimpse', 'Üral Series'],
  guide: ['Recommended', 'Optional'],
};

export const CATEGORY_TITLES: Record<Category, string> = {
  worldbuilding: 'Worldbuilding',
  story: 'Stories',
  guide: 'Guides',
};

export const CATEGORY_TO_SECTION: Record<Category, string> = {
  worldbuilding: 'worldbuilding',
  story: 'stories',
  guide: 'guides',
};

export const SECTION_TO_CATEGORY: Record<string, Category> = {
  worldbuilding: 'worldbuilding',
  stories: 'story',
  guides: 'guide',
};

export function isCategory(value: string | undefined): value is Category {
  return !!value && (CATEGORIES as string[]).includes(value);
}

export function isTagForCategory(category: Category, tag: string | undefined): boolean {
  if (!tag) return true;
  return CATEGORY_TAGS[category].includes(tag);
}
