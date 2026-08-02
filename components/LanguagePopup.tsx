'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LANG_COOKIE, type Lang } from '@/lib/i18n';

function looksTurkish(): boolean {
  try {
    const languages =
      typeof navigator !== 'undefined' ? (navigator.languages ?? [navigator.language]) : [];
    if (languages.some((l) => l.toLowerCase().startsWith('tr'))) return true;
  } catch {
    // ignore
  }
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    if (/istanbul|turkey/i.test(timeZone)) return true;
  } catch {
    // ignore
  }
  return false;
}

export default function LanguagePopup() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (document.cookie.includes(`${LANG_COOKIE}=`)) return;
    const id = window.setTimeout(() => {
      if (looksTurkish()) setVisible(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  function choose(lang: Lang) {
    document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
    setVisible(false);
    router.refresh();
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-xl border border-white/15 bg-[#160a2b] p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-100">Site dilini seç</h2>
        <p className="mt-1 text-sm text-[#8a7f9e]">Bu siteyi hangi dilde görüntülemek istersin?</p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => choose('tr')}
            className="flex-1 rounded-lg bg-[#23194e] px-4 py-2.5 font-semibold text-gray-100 transition hover:bg-[#3b144d]"
          >
            Türkçe
          </button>
          <button
            type="button"
            onClick={() => choose('en')}
            className="flex-1 rounded-lg border border-white/15 px-4 py-2.5 font-semibold text-[#B3B3B3] transition hover:border-white/30 hover:text-white"
          >
            English
          </button>
        </div>
      </div>
    </div>
  );
}
