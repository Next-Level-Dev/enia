import { Inter, Lora } from 'next/font/google';

/**
 * Interface font — navigation, admin chrome, tables, buttons, form fields.
 */
export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * Prose font — everything that reads like the published article: the rendered
 * markdown on public pages, the editor preview and the draft textbox, so what
 * you type is what you get.
 */
export const lora = Lora({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-lora',
});

export const fontVariables = `${inter.variable} ${lora.variable}`;