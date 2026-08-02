import './globals.css';
import TopBar from '@/components/TopBar';
import LanguagePopup from '@/components/LanguagePopup';
import { getLang } from '@/lib/i18n-server';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const lang = await getLang();

  return (
    <html lang={lang}>
      <body>
        <TopBar lang={lang} />
        <main>{children}</main>
        <LanguagePopup />
      </body>
    </html>
  )
}
