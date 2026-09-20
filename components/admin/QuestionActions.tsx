'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QuestionActions({ id, published }: { id: number; published: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function togglePublished() {
    setPending(true);
    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !published }),
      });
      if (!response.ok) {
        alert('Failed to update question.');
        setPending(false);
        return;
      }
      router.refresh();
    } catch {
      alert('Something went wrong.');
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this question? This cannot be undone.')) return;
    setPending(true);
    try {
      const response = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        alert('Failed to delete question.');
        setPending(false);
        return;
      }
      router.refresh();
    } catch {
      alert('Something went wrong.');
      setPending(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-4">
      <button
        type="button"
        onClick={togglePublished}
        disabled={pending}
        className={
          published
            ? 'text-sm font-medium text-[#FFE47A] transition hover:text-[#FFE47A]/70 disabled:opacity-60'
            : 'text-sm font-medium text-[#8fd19e] transition hover:text-[#71B280] disabled:opacity-60'
        }
      >
        {published ? 'Unpublish' : 'Publish'}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="text-sm font-medium text-red-400 transition hover:text-red-300 disabled:opacity-60"
      >
        Delete
      </button>
    </div>
  );
}