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
    sort: string;
    reset: string;
    lastReleased: string;
    firstReleased: string;
    lastChronological: string;
    firstChronological: string;
    lastEdited: string;
    worldbuildingWarning: string;
    nothingTagged: (tag: string) => string;
    nothingHere: string;
  };
  card: {
    released: string;
    edited: string;
    year: string;
    words: string;
  };
  view: {
    backTo: string;
    released: string;
    lastEdited: string;
    year: string;
    words: string;
    description: string;
    authorsNote: string;
    translationWarning: string;
  };
  community: {
    title: string;
    spoilerWarning: string;
    formTitle: string;
    formHint: string;
    nameLabel: string;
    namePlaceholder: string;
    questionLabel: string;
    questionPlaceholder: string;
    submit: string;
    submitting: string;
    sent: string;
    errorRequired: string;
    errorTooShort: string;
    errorTooLong: string;
    errorServer: string;
    rateLimited: (minutes: number) => string;
    questionsHeading: string;
    empty: string;
    askedBy: (name: string) => string;
    revealAnswer: string;
    hideAnswer: string;
  };
  popup: {
    title: string;
    description: string;
  };
  search: {
    placeholder: string;
    pagesLabel: string;
    questionsLabel: string;
    noResults: string;
  };
  noDescriptionYet: string;
  unknownYear: string;
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
      tagline: 'World of sorcery and gods',
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
      'One-Shot': 'One-Shot',
      'Hito Series': 'Hito Series',
      'Üral Series': 'Üral Series',
      'Non-Canon': 'Non-Canon',
      Recommended: 'Recommended',
      Optional: 'Optional',
      'Text Only': 'Text Only',
      'Media Assisted': 'Media Assisted',
    },
    tagGroupLabels: {
      spoiler: 'Spoiler level',
      storyType: 'Story type',
      reading: 'Reading priority',
      format: 'Format',
    },
    tagMeanings: {
      'Heavy Spoiler': 'Could contain major spoilers for future stories.',
      'Light Spoiler':
        'Could contain spoilers for existing stories OR small spoilers for future stories.',
      'One-Shot': 'A summary, a scene or a short story from the world.',
      'Hito Series': 'Part of the Hito storyline series.',
      'Üral Series': 'Part of the Üral storyline series.',
      'Non-Canon': 'Not part of the canon, set apart from the main timeline.',
      Recommended: 'Should be read to properly understand the world.',
      Optional: 'Can be skipped if needed, without major drawbacks.',
      'Text Only': 'The entry contains only text, without any images or audio/video.',
      'Media Assisted': 'The entry includes images and/or audio/video alongside the text.',
    },
    listing: {
      sort: 'Sort:',
      reset: 'Reset filters',
      lastReleased: 'Last released',
      firstReleased: 'First released',
      lastChronological: 'Last chronological',
      firstChronological: 'First chronological',
      lastEdited: 'Last edited',
      worldbuildingWarning:
        'Worldbuilding documents reveal everything about the world. They will help you understand it, but they might take away elements of surprise from the stories.',
      nothingTagged: (tag: string) => `Nothing tagged "${tag}" here yet.`,
      nothingHere: 'Nothing here yet. Check back soon.',
    },
    card: {
      released: 'Released',
      edited: 'Edited',
      year: 'Year',
      words: 'words',
    },
    view: {
      backTo: 'Back to',
      released: 'Released',
      lastEdited: 'Last edited',
      year: 'Year',
      words: 'words',
      description: 'Description',
      authorsNote: 'Author\u2019s note',
      translationWarning:
        'Translated entries are not canon. There might be mistakes or missing wordplay \u2014 it is recommended to read in English.',
    },
    community: {
      title: 'Community',
      spoilerWarning:
        'Questions and answers shared here may contain spoilers. Answers are hidden behind a button, reveal them only when you are ready.',
      formTitle: 'Ask the author a question',
      formHint:
        'Your question is not published directly: the author reviews, answers, and publishes it. To keep out spam, submissions are limited to one per hour.',
      nameLabel: 'Name',
      namePlaceholder: 'Optional, how should the author address you?',
      questionLabel: 'Question',
      questionPlaceholder: 'Ask anything about the world of Enia…',
      submit: 'Send question',
      submitting: 'Sending…',
      sent: 'Sent! Your question is on its way to the author, thanks for asking.',
      errorRequired: 'Please write a question first.',
      errorTooShort: 'Your question is too short, please add a few more words.',
      errorTooLong: 'That question is too long, please keep it under 2000 characters.',
      errorServer: 'Something went wrong. Please try again in a moment.',
      rateLimited: (minutes: number) =>
        `You have already sent a question recently. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
      questionsHeading: 'Questions & answers',
      empty: 'No questions published yet, be the first to ask!',
      askedBy: (name: string) => (name ? `Asked by ${name}` : 'Asked anonymously'),
      revealAnswer: 'Reveal answer',
      hideAnswer: 'Hide answer',
    },
    popup: {
      title: 'Choose the site language',
      description: 'Which language would you like to view this site in?',
    },
    search: {
      placeholder: 'Search…',
      pagesLabel: 'Pages',
      questionsLabel: 'Questions',
      noResults: 'No results found.',
    },
    noDescriptionYet: 'No description yet.',
    unknownYear: 'Unknown',
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
      tagline: 'Büyücülüğün ve tanrıların dünyası',
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
      'One-Shot': 'Tek Bölümlük Hikaye',
      'Hito Series': 'Hito Serisi',
      'Üral Series': 'Üral Serisi',
      'Non-Canon': 'Kanon Dışı',
      Recommended: 'Önerilen',
      Optional: 'İsteğe Bağlı',
      'Text Only': 'Yalnızca Metin',
      'Media Assisted': 'Medya Destekli',
    },
    tagGroupLabels: {
      spoiler: 'Spoiler seviyesi',
      storyType: 'Hikaye türü',
      reading: 'Okuma önceliği',
      format: 'Format',
    },
    tagMeanings: {
      'Heavy Spoiler': 'Gelecekteki hikayeler için büyük spoiler içerebilir.',
      'Light Spoiler':
        'Mevcut hikayeler için spoiler ya da gelecekteki hikayeler için küçük spoiler içerebilir.',
      'One-Shot': 'Dünyadan bir özet, bir sahne veya kısa bir hikaye.',
      'Hito Series': 'Hito hikaye serisinin bir parçası.',
      'Üral Series': 'Üral hikaye serisinin bir parçası.',
      'Non-Canon': 'Kanonun bir parçası değil, ana zaman çizgisinden ayrı.',
      Recommended: 'Dünyayı doğru anlamak için okunması önerilir.',
      Optional: 'Gerekirse atlanabilir, büyük bir kayıp olmaz.',
      'Text Only': 'İçerik yalnızca metinden oluşur; görsel veya ses/video içermez.',
      'Media Assisted': 'İçerik, metinle birlikte görsel ve/veya ses/video içerir.',
    },
    listing: {
      sort: 'Sırala:',
      reset: 'Filtreleri sıfırla',
      lastReleased: 'Son yayınlanan',
      firstReleased: 'İlk yayınlanan',
      lastChronological: 'Kronolojik son',
      firstChronological: 'Kronolojik ilk',
      lastEdited: 'Son düzenlenen',
      worldbuildingWarning:
        'Dünya İnşası belgeleri dünya hakkında her şeyi ortaya koyar. Anlamanıza yardımcı olur ama hikayelerdeki sürpriz unsurlarını bozabilir.',
      nothingTagged: (tag: string) => `Burada "${tag}" etiketli bir şey yok.`,
      nothingHere: 'Burada henüz bir şey yok. Yakında tekrar kontrol et.',
    },
    card: {
      released: 'Yayınlandı',
      edited: 'Düzenlendi',
      year: 'Yıl',
      words: 'kelime',
    },
    view: {
      backTo: 'Geri dön:',
      released: 'Yayınlandı',
      lastEdited: 'Son düzenleme',
      year: 'Yıl',
      words: 'kelime',
      description: 'Açıklama',
      authorsNote: 'Yazarın notu',
      translationWarning:
        'Çevrilmiş içerikler kanonik değildir. Hatalar veya eksik kelime oyunları olabilir \u2014 İngilizce okumanız önerilir.',
    },
    community: {
      title: 'Topluluk',
      spoilerWarning:
        'Burada paylaşılan soru ve cevaplar spoiler (sürpriz bozan) içerik barındırabilir. Cevaplar bir düğmenin arkasında saklanır, yalnızca hazır olduğunuzda açın.',
      formTitle: 'Yazara soru sor',
      formHint:
        'Sorunuz doğrudan yayınlanmaz: yazar inceler, yanıtlar ve yayınlar. Spam\u2019i önlemek için gönderimler saatte bir ile sınırlıdır.',
      nameLabel: 'İsim',
      namePlaceholder: 'İsteğe bağlı, yazar size nasıl hitap etsin?',
      questionLabel: 'Soru',
      questionPlaceholder: 'Enia dünyası hakkında her şeyi sorabilirsin…',
      submit: 'Soruyu gönder',
      submitting: 'Gönderiliyor…',
      sent: 'Gönderildi! Sorunuz yazara ulaştı, sorduğunuz için teşekkürler.',
      errorRequired: 'Lütfen önce bir soru yazın.',
      errorTooShort: 'Sorunuz çok kısa, lütfen birkaç kelime daha ekleyin.',
      errorTooLong: 'Bu soru çok uzun, lütfen 2000 karakterin altında tutun.',
      errorServer: 'Bir şeyler ters gitti. Lütfen birazdan tekrar deneyin.',
      rateLimited: (minutes: number) =>
        `Son zamanlarda bir soru gönderdiniz. Lütfen ${minutes} dakika sonra tekrar deneyin.`,
      questionsHeading: 'Sorular ve cevaplar',
      empty: 'Henüz yayınlanmış soru yok, ilk soran siz olun!',
      askedBy: (name: string) => (name ? `${name} sordu` : 'Anonim olarak soruldu'),
      revealAnswer: 'Cevabı göster',
      hideAnswer: 'Cevabı gizle',
    },
    popup: {
      title: 'Site dilini seç',
      description: 'Bu siteyi hangi dilde görüntülemek istersin?',
    },
    search: {
      placeholder: 'Ara…',
      pagesLabel: 'Sayfalar',
      questionsLabel: 'Sorular',
      noResults: 'Sonuç bulunamadı.',
    },
    noDescriptionYet: 'Henüz açıklama yok.',
    unknownYear: 'Bilinmiyor',
  },
};

export function getDict(lang: Lang): Dict {
  return DICTS[lang];
}

export function tagLabel(lang: Lang, tag: string): string {
  return DICTS[lang].tagLabels[tag] ?? tag;
}
