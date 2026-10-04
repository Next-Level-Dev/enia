'use client';

export type EditorTab = 'overview' | 'draft' | 'preview';

const TABS: { id: EditorTab; label: string; hint: string }[] = [
  { id: 'overview', label: 'Overview', hint: 'Title, dates, tags and other metadata' },
  { id: 'draft', label: 'Draft', hint: 'Write the markdown content' },
  { id: 'preview', label: 'Preview', hint: 'The page exactly as visitors see it' },
];

export default function EditorBottomBar({
  tab,
  onChange,
  onSave,
  saving,
  saveLabel,
  onCancel,
}: {
  tab: EditorTab;
  onChange: (tab: EditorTab) => void;
  onSave: () => void;
  saving: boolean;
  saveLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0e031d]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
        <nav className="flex min-w-0 flex-1 gap-1.5 sm:flex-none">
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                title={item.hint}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'flex-1 rounded-lg border border-[#71B280]/60 bg-[#71B280]/15 px-3 py-2.5 text-sm font-semibold text-[#8fd19e] transition sm:flex-none sm:px-6'
                    : 'flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-[#B3B3B3] transition hover:border-white/30 hover:text-white sm:flex-none sm:px-6'
                }
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="shrink-0 rounded-lg bg-[#23194e] px-4 py-2.5 text-sm font-semibold text-gray-100 transition hover:bg-[#3b144d] disabled:opacity-60 sm:px-6"
        >
          {saving ? 'Saving…' : saveLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="hidden shrink-0 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-[#B3B3B3] transition hover:border-white/30 hover:text-white sm:block sm:px-6"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}