'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/entries/${slug}`, { method: 'DELETE' });
      if (!response.ok) {
        alert('Failed to delete entry.');
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      alert('Something went wrong.');
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-sm font-medium text-red-400 transition hover:text-red-300 disabled:opacity-60"
    >
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  );
}
