import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'ratemy.excuse — AI Excuse Generator & Rater',
  description:
    'Get AI-generated excuses for any situation, or submit your own excuse to get it graded A-F by our AI judge. Free, fun, shareable.',
  keywords: ['excuse generator', 'AI excuse', 'rate my excuse', 'excuse rater', 'funny excuses'],
  openGraph: {
    title: 'ratemy.excuse',
    description: 'AI-powered excuses. Rated. Perfected.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className={`${nunito.className} bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
