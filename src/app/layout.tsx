import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'בית חב"ד - הבית שלכם',
  description: 'בית חב"ד - אירועים, שיעורי תורה, ארוחות שבת, חוגי ילדים ועוד. הצטרפו למשפחה שלנו!',
  keywords: ['חב"ד', 'בית חב"ד', 'יהדות', 'שבת', 'תורה', 'אירועים', 'קהילה'],
  authors: [{ name: 'בית חב"ד' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1B3A5C',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
