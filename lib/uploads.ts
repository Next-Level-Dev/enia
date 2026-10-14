import 'server-only';

import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export const PDF_MIME = 'application/pdf';
export const MAX_PDF_BYTES = 25 * 1024 * 1024;

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');
const PDF_NAME_RE = /^[a-z0-9-]+\.pdf$/i;
const PDF_HEADER = '%PDF-';

/** Guards against path traversal — only generated names like `<uuid>.pdf` pass. */
export function isValidPdfName(name: unknown): name is string {
  return typeof name === 'string' && name.length <= 100 && PDF_NAME_RE.test(name);
}

export interface StoredPdf {
  name: string;
  size: number;
  originalName: string;
}

export async function savePdf(file: File): Promise<StoredPdf> {
  if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
    throw new Error('No file provided');
  }
  if (file.type && file.type !== PDF_MIME) {
    throw new Error('Only PDF files are allowed');
  }
  if (file.size === 0) {
    throw new Error('The file is empty');
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error(`PDFs must be smaller than ${Math.round(MAX_PDF_BYTES / (1024 * 1024))} MB`);
  }

  const data = Buffer.from(await file.arrayBuffer());
  if (data.subarray(0, PDF_HEADER.length).toString('latin1') !== PDF_HEADER) {
    throw new Error('That file is not a valid PDF');
  }

  const name = `${randomUUID()}.pdf`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), data);

  return { name, size: data.length, originalName: file.name || 'document.pdf' };
}

export async function readPdf(name: unknown): Promise<Buffer | null> {
  if (!isValidPdfName(name)) return null;
  try {
    return await fs.readFile(path.join(UPLOAD_DIR, name));
  } catch {
    return null;
  }
}

export async function deletePdf(name: unknown): Promise<void> {
  if (!isValidPdfName(name)) return;
  try {
    await fs.unlink(path.join(UPLOAD_DIR, name));
  } catch {
    // Already gone — nothing to do.
  }
}
