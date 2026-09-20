export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function formatWordCount(count: number): string {
  if (count >= 1000) return `${Math.round(count / 1000)}k`;
  return String(count);
}