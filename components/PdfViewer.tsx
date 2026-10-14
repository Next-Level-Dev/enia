import { getDict, type Lang } from '@/lib/i18n';

const actionClass =
  'rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-[#B3B3B3] transition hover:border-white/30 hover:text-white';

export default function PdfViewer({
  lang,
  src,
  title,
  isMobile = false,
}: {
  lang: Lang;
  src: string;
  title: string;
  isMobile?: boolean;
}) {
  const dict = getDict(lang);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
        <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-gray-200">
          <span className="shrink-0 rounded-full border border-[#8a7f9e]/40 bg-[#8a7f9e]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#8a7f9e]">
            PDF
          </span>
          <span className="truncate">{title}</span>
        </span>
        <span className="flex shrink-0 gap-2">
          <a href={src} target="_blank" rel="noopener noreferrer" className={actionClass}>
            {dict.view.openPdf}
          </a>
          <a href={src} download className={actionClass}>
            {dict.view.downloadPdf}
          </a>
        </span>
      </div>

      {isMobile ? (
        <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <p className="max-w-md text-sm text-[#8a7f9e]">{dict.view.pdfMobileNotice}</p>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[#23194e] px-5 py-3 text-sm font-semibold text-gray-100 transition hover:bg-[#3b144d]"
          >
            {dict.view.openPdf}
          </a>
        </div>
      ) : (
        <iframe
          src={src}
          title={title}
          className="h-[80vh] w-full bg-white"
        />
      )}
    </div>
  );
}
