'use client';

import { useRouter } from 'next/navigation';
import { LANG_COOKIE, type Lang } from '@/lib/i18n';

export default function LanguageSwitch({ lang }: { lang: Lang }) {
  const router = useRouter();

  function toggle() {
    const next: Lang = lang === 'en' ? 'tr' : 'en';
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch language"
      title={lang === 'en' ? 'Türkçe' : 'English'}
      className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-[#B3B3B3] transition hover:border-[#71B280]/60 hover:text-white"
    >
      {lang === 'en' ? 'Türkçe' : 'English'}
    </button>
  );
}
