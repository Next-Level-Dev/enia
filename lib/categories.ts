export type Category = 'worldbuilding' | 'story' | 'guide';

export const CATEGORIES: Category[] = ['worldbuilding', 'story', 'guide'];

export type Perspective = 'limited' | 'omniscient';

export const PERSPECTIVES: Perspective[] = ['limited', 'omniscient'];

export const PERSPECTIVE_MEANINGS: Record<Perspective, string> = {
  limited:
    'Limited, the story is told by a narrator with humanly limitations that can be unreliable or biased.',
  omniscient:
    'Omniscient, the story is told by an all-knowing narrator that does not align with any views.',
};

export const TAG_MEANINGS: Record<string, string> = {
  'Heavy Spoiler': 'Could contain major spoilers for future stories.',
  'Light Spoiler': 'Could contain spoilers for existing stories OR small spoilers for future stories.',
  Glimpse: 'A summary, a scene or a short story from the world.',
  'Üral Series': 'Part of the Üral storyline series.',
  Recommended: 'Should be read to properly understand the world.',
  Optional: 'Can be skipped if needed, without major drawbacks.',
};

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

export function isPerspective(value: string | undefined): value is Perspective {
  return !!value && (PERSPECTIVES as string[]).includes(value);
}
