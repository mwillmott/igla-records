import type { Metadata } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import { getSession } from '@/lib/auth';
import Header from './components/Header';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'IGLA+ Records · Dive in with pride.',
  description:
    'Championship results, member clubs, and all-time records for the International Group of LGBTQIA+ Aquatics.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="app">
        <Header session={session} />
        
        <main className="page">
          {children}
        </main>

        <footer className="footer mt-auto">
          <div className="footer-inner">
            <span>© 2026 IGLA+ · International Group of LGBTQIA+ Aquatics · Est. 1987</span>
            <span>Prototype · Relational Database Engine</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
