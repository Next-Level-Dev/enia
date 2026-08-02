import Link from 'next/link';

const CARDS = [
  {
    href: '/worldbuilding',
    title: 'Read the documents',
    description: 'Dive into the world of Enia, its gods and sigils.',
    accent: 'from-[#71B280]/20 to-transparent',
  },
  {
    href: '/guides',
    title: 'Start with a short guide!',
    description: 'The quickest way to get familiar with the setting.',
    accent: 'from-[#FFE47A]/20 to-transparent',
  },
  {
    href: '/stories',
    title: 'Read the stories',
    description: 'Follow the tales told within the world.',
    accent: 'from-[#a78bfa]/20 to-transparent',
  },
];

export default function Page() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-[#71B280] to-[#FFE47A] bg-clip-text text-transparent">
          Enia
        </h1>
        <p className="text-lg sm:text-xl font-medium text-[#B3B3B3]">
          World of gods and sigils
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
        A writing project by Utku
      </p>
    </div>
  );
}
