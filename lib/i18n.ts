import type { Category } from './categories';

export type Lang = 'en' | 'tr';

export const LANGS: Lang[] = ['en', 'tr'];
export const LANG_COOKIE = 'enia_lang';
export const DEFAULT_LANG: Lang = 'en';

export interface Dict {
  langName: string;
  topbar: {
    worldbuilding: string;
    stories: string;
    guides: string;
    community: string;
    admin: string;
  };
  home: {
    tagline: string;
    cards: {
      worldbuildingTitle: string;
      worldbuildingDescription: string;
      guidesTitle: string;
      guidesDescription: string;
      storiesTitle: string;
      storiesDescription: string;
    };
    footer: string;
  };
  categoryTitles: Record<Category, string>;
  sectionTitles: Record<string, string>;
  tagLabels: Record<string, string>;
  tagGroupLabels: Record<string, string>;
  tagMeanings: Record<string, string>;
  listing: {
    tags: string;
    sort: string;
    all: string;
    newest: string;
    oldest: string;
    recentlyEdited: string;
    nothingTagged: (tag: string) => string;
    nothingHere: string;
  };
  card: {
    released: string;
    edited: string;
  };
  view: {
    backTo: string;
    released: string;
    lastEdited: string;
    authorsNote: string;
  };
  community: {
    title: string;
    comingSoon: string;
    description: string;
  };
  popup: {
    title: string;
    description: string;
  };
  noDescriptionYet: string;
}

export const DICTS: Record<Lang, Dict> = {
  en: {
    langName: 'English',
    topbar: {
      worldbuilding: 'Worldbuilding',
      stories: 'Stories',
      guides: 'Guides',
      community: 'Community',
      admin: 'Admin',
    },
    home: {
      tagline: 'World of gods and sigils',
      cards: {
        worldbuildingTitle: 'Read the documents',
        worldbuildingDescription: 'Dive into the world of Enia, its gods and sigils.',
        guidesTitle: 'Start with a short guide!',
        guidesDescription: 'The quickest way to get familiar with the setting.',
        storiesTitle: 'Read the stories',
        storiesDescription: 'Follow the tales told within the world.',
      },
      footer: 'A writing project by Utku',
    },
    categoryTitles: {
      worldbuilding: 'Worldbuilding',
      story: 'Stories',
      guide: 'Guides',
    },
    sectionTitles: {
      worldbuilding: 'Worldbuilding',
      stories: 'Stories',
      guides: 'Guides',
    },
    tagLabels: {
      'Heavy Spoiler': 'Heavy Spoiler',
      'Light Spoiler': 'Light Spoiler',
      Glimpse: 'Glimpse',
      'Üral Series': 'Üral Series',
      Limited: 'Limited',
      Omniscient: 'Omniscient',
      Recommended: 'Recommended',
      Optional: 'Optional',
    },
    tagGroupLabels: {
      spoiler: 'Spoiler level',
      storyType: 'Story type',
      narrator: 'Narrator',
      reading: 'Reading priority',
    },
    tagMeanings: {
      'Heavy Spoiler': 'Could contain major spoilers for future stories.',
      'Light Spoiler':
        'Could contain spoilers for existing stories OR small spoilers for future stories.',
      Glimpse: 'A summary, a scene or a short story from the world.',
      'Üral Series': 'Part of the Üral storyline series.',
      Limited: 'The story is told by a narrator with humanly limitations that can be unreliable or biased.',
      Omniscient: 'The story is told by an all-knowing narrator that does not align with any views.',
      Recommended: 'Should be read to properly understand the world.',
      Optional: 'Can be skipped if needed, without major drawbacks.',
    },
    listing: {
      tags: 'Tags:',
      sort: 'Sort:',
      all: 'All',
      newest: 'Newest',
      oldest: 'Oldest',
      recentlyEdited: 'Recently edited',
      nothingTagged: (tag: string) => `Nothing tagged "${tag}" here yet.`,
      nothingHere: 'Nothing here yet. Check back soon.',
    },
    card: {
      released: 'Released',
      edited: 'Edited',
    },
    view: {
      backTo: 'Back to',
      released: 'Released',
      lastEdited: 'Last edited',
      authorsNote: 'Author\u2019s note',
    },
    community: {
      title: 'Community',
      comingSoon: 'Coming soon',
      description: 'This page is still under construction. Check back later for community features.',
    },
    popup: {
      title: 'Choose the site language',
      description: 'Which language would you like to view this site in?',
    },
    noDescriptionYet: 'No description yet.',
  },
  tr: {
    langName: 'Türkçe',
    topbar: {
      worldbuilding: 'Dünya İnşası',
      stories: 'Hikayeler',
      guides: 'Rehberler',
      community: 'Topluluk',
      admin: 'Yönetim',
    },
    home: {
      tagline: 'Tanrıların ve mühürlerin dünyası',
      cards: {
        worldbuildingTitle: 'Belgeleri oku',
        worldbuildingDescription: "Enia'nın dünyasına, tanrılarına ve mühürlerine dal.",
        guidesTitle: 'Kısa bir rehberle başla!',
        guidesDescription: 'Ortama alışmanın en hızlı yolu.',
        storiesTitle: 'Hikayeleri oku',
        storiesDescription: 'Dünyada anlatılan masalları takip et.',
      },
      footer: 'Utku tarafından yazılan bir proje',
    },
    categoryTitles: {
      worldbuilding: 'Dünya İnşası',
      story: 'Hikayeler',
      guide: 'Rehberler',
    },
    sectionTitles: {
      worldbuilding: 'Dünya İnşası',
      stories: 'Hikayeler',
      guides: 'Rehberler',
    },
    tagLabels: {
      'Heavy Spoiler': 'Ağır Spoiler',
      'Light Spoiler': 'Hafif Spoiler',
      Glimpse: 'Kesit',
      'Üral Series': 'Üral Serisi',
      Limited: 'Sınırlı',
      Omniscient: 'Her Şeyi Bilen',
      Recommended: 'Önerilen',
      Optional: 'İsteğe Bağlı',
    },
    tagGroupLabels: {
      spoiler: 'Spoiler seviyesi',
      storyType: 'Hikaye türü',
      narrator: 'Anlatıcı',
      reading: 'Okuma önceliği',
    },
    tagMeanings: {
      'Heavy Spoiler': 'Gelecekteki hikayeler için büyük spoiler içerebilir.',
      'Light Spoiler':
        'Mevcut hikayeler için spoiler ya da gelecekteki hikayeler için küçük spoiler içerebilir.',
      Glimpse: 'Dünyadan bir özet, bir sahne veya kısa bir hikaye.',
      'Üral Series': 'Üral hikaye serisinin bir parçası.',
      Limited:
        'Hikaye, insani sınırları olan, güvenilmez veya taraflı olabilen bir anlatıcı tarafından anlatılır.',
      Omniscient:
        'Hikaye, hiçbir görüşe bağlı olmayan, her şeyi bilen bir anlatıcı tarafından anlatılır.',
      Recommended: 'Dünyayı doğru anlamak için okunması önerilir.',
      Optional: 'Gerekirse atlanabilir, büyük bir kayıp olmaz.',
    },
    listing: {
      tags: 'Etiketler:',
      sort: 'Sırala:',
      all: 'Tümü',
      newest: 'En yeni',
      oldest: 'En eski',
      recentlyEdited: 'Son düzenlenen',
      nothingTagged: (tag: string) => `Burada "${tag}" etiketli bir şey yok.`,
      nothingHere: 'Burada henüz bir şey yok. Yakında tekrar kontrol et.',
    },
    card: {
      released: 'Yayınlandı',
      edited: 'Düzenlendi',
    },
    view: {
      backTo: 'Geri dön:',
      released: 'Yayınlandı',
      lastEdited: 'Son düzenleme',
      authorsNote: 'Yazarın notu',
    },
    community: {
      title: 'Topluluk',
      comingSoon: 'Çok yakında',
      description:
        'Bu sayfa hâlâ yapım aşamasında. Topluluk özellikleri için daha sonra tekrar gel.',
    },
    popup: {
      title: 'Site dilini seç',
      description: 'Bu siteyi hangi dilde görüntülemek istersin?',
    },
    noDescriptionYet: 'Henüz açıklama yok.',
  },
};

export function getDict(lang: Lang): Dict {
  return DICTS[lang];
}

export function tagLabel(lang: Lang, tag: string): string {
  return DICTS[lang].tagLabels[tag] ?? tag;
}
