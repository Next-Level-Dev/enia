import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import { getDict, type Lang } from '@/lib/i18n';
import LanguageSwitch from './LanguageSwitch';

export default async function TopBar({ lang }: { lang: Lang }) {
  const user = await getCurrentUser();
  const dict = getDict(lang);

  const LINKS = [
    { href: '/worldbuilding', label: dict.topbar.worldbuilding },
    { href: '/stories', label: dict.topbar.stories },
    { href: '/guides', label: dict.topbar.guides },
    { href: '/community', label: dict.topbar.community },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0e031d]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-lg font-extrabold bg-gradient-to-r from-[#71B280] to-[#FFE47A] bg-clip-text text-transparent"
          >
            Enia
          </Link>
          {user?.isAdmin && (
            <Link
              href="/admin"
              className="rounded-full border border-[#FFE47A]/40 bg-[#FFE47A]/10 px-3 py-1 text-xs font-semibold text-[#FFE47A] transition hover:bg-[#FFE47A]/20"
            >
              {dict.topbar.admin}
            </Link>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-7">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#B3B3B3] hover:text-white transition"
            >
              {link.label}
            </Link>
          ))}
          <LanguageSwitch lang={lang} />
        </div>
      </nav>
    </header>
  );
}
