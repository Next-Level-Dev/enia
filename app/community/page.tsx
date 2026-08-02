import { getDict } from '@/lib/i18n';
import { getLang } from '@/lib/i18n-server';

export default async function CommunityPage() {
  const lang = await getLang();
  const dict = getDict(lang);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#71B280] to-[#FFE47A] bg-clip-text text-transparent">
          {dict.community.title}
        </h1>
        <p className="text-lg font-medium text-[#B3B3B3]">{dict.community.comingSoon}</p>
        <p className="max-w-md text-sm text-[#8a7f9e]">{dict.community.description}</p>
      </div>
    </div>
  );
}
