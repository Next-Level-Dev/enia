'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PublishButton({ slug, published }: { slug: string; published: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);

    try {
      const response = await fetch(`/api/entries/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !published }),
      });
      if (!response.ok) {
        alert('Failed to update entry.');
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
      onClick={handleToggle}
      disabled={loading}
      className={
        published
          ? 'text-sm font-medium text-[#FFE47A] transition hover:text-[#FFE47A]/70 disabled:opacity-60'
          : 'text-sm font-medium text-[#8fd19e] transition hover:text-[#71B280] disabled:opacity-60'
      }
    >
      {loading ? '…' : published ? 'Unpublish' : 'Publish'}
    </button>
  );
}
