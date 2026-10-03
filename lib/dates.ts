const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE.test(value);
}

export function formatDateDMY(value: string): string {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export function isBefore(a: string, b: string): boolean {
  return isIsoDate(a) && isIsoDate(b) && a < b;
}
