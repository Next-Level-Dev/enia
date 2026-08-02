export type Category = 'worldbuilding' | 'story' | 'guide';

export const CATEGORIES: Category[] = ['worldbuilding', 'story', 'guide'];

export const TAG_MEANINGS: Record<string, string> = {
  'Heavy Spoiler': 'Could contain major spoilers for future stories.',
  'Light Spoiler': 'Could contain spoilers for existing stories OR small spoilers for future stories.',
  Glimpse: 'A summary, a scene or a short story from the world.',
  'Üral Series': 'Part of the Üral storyline series.',
  Limited: 'The story is told by a narrator with humanly limitations that can be unreliable or biased.',
  Omniscient: 'The story is told by an all-knowing narrator that does not align with any views.',
  Recommended: 'Should be read to properly understand the world.',
  Optional: 'Can be skipped if needed, without major drawbacks.',
};

export interface TagGroup {
  name: string;
  tags: string[];
}

export const TAG_GROUPS: Record<Category, TagGroup[]> = {
  worldbuilding: [{ name: 'spoiler', tags: ['Heavy Spoiler', 'Light Spoiler'] }],
  story: [
    { name: 'storyType', tags: ['Glimpse', 'Üral Series'] },
    { name: 'narrator', tags: ['Limited', 'Omniscient'] },
  ],
  guide: [{ name: 'reading', tags: ['Recommended', 'Optional'] }],
};

export const TAG_GROUP_LABELS: Record<string, string> = {
  spoiler: 'Spoiler level',
  storyType: 'Story type',
  narrator: 'Narrator',
  reading: 'Reading priority',
};

export const CATEGORY_TAGS: Record<Category, string[]> = {
  worldbuilding: TAG_GROUPS.worldbuilding.flatMap((g) => g.tags),
  story: TAG_GROUPS.story.flatMap((g) => g.tags),
  guide: TAG_GROUPS.guide.flatMap((g) => g.tags),
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

export function groupTags(category: Category | undefined, tags: string[]): string[][] {
  const groupNames = category ? TAG_GROUPS[category].map((g) => g.tags) : [];
  const buckets: string[][] = groupNames.map(() => []);
  const rest: string[] = [];
  for (const tag of tags) {
    const index = groupNames.findIndex((group) => group.includes(tag));
    if (index >= 0) buckets[index].push(tag);
    else rest.push(tag);
  }
  if (rest.length > 0) buckets.push(rest);
  return buckets.filter((b) => b.length > 0);
}

export function tagGroupMeanings(
  category: Category,
  tags: string[],
  {
    labelOf,
    groupLabelOf,
    meaningOf,
  }: {
    labelOf: (tag: string) => string;
    groupLabelOf: (name: string) => string;
    meaningOf: (tag: string) => string;
  }
): string {
  const blocks = TAG_GROUPS[category]
    .map((group) => {
      const present = group.tags.filter((t) => tags.includes(t));
      if (present.length === 0) return null;
      const label = groupLabelOf(group.name);
      const lines = present.map((t) => `• ${labelOf(t)}: ${meaningOf(t)}`);
      return label ? [label, ...lines].join('\n') : lines.join('\n');
    })
    .filter((block): block is string => block !== null);
  return blocks.join('\n\n──────────\n\n');
}
