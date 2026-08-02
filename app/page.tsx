import Link from 'next/link';
import { getDict } from '@/lib/i18n';
import { getLang } from '@/lib/i18n-server';

export default async function Page() {
  const lang = await getLang();
  const dict = getDict(lang);

  const CARDS = [
    {
      href: '/worldbuilding',
      title: dict.home.cards.worldbuildingTitle,
      description: dict.home.cards.worldbuildingDescription,
      accent: 'from-[#71B280]/20 to-transparent',
    },
    {
      href: '/guides',
      title: dict.home.cards.guidesTitle,
      description: dict.home.cards.guidesDescription,
      accent: 'from-[#FFE47A]/20 to-transparent',
    },
    {
      href: '/stories',
      title: dict.home.cards.storiesTitle,
      description: dict.home.cards.storiesDescription,
      accent: 'from-[#a78bfa]/20 to-transparent',
    },
  ];

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-[#71B280] to-[#FFE47A] bg-clip-text text-transparent">
          Enia
        </h1>
        <p className="text-lg sm:text-xl font-medium text-[#B3B3B3]">
          {dict.home.tagline}
        </p>
      </div>

      <div className="mt-10 grid w-full gap-4 sm:mt-14 md:grid-cols-3">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`group flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-6 transition hover:border-white/25 hover:bg-white/10 hover:-translate-y-0.5 ${card.accent}`}
          >
            <h2 className="text-lg font-bold text-gray-100 group-hover:text-white transition">
              {card.title}
            </h2>
            <p className="text-sm text-[#8a7f9e]">{card.description}</p>
          </Link>
        ))}
      </div>

      <p className="mt-auto pt-14 text-center text-sm font-light text-[#B3B3B3] sm:text-base">
        {dict.home.footer}
      </p>
    </div>
  );
}
