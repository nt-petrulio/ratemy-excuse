import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
});

const SITE_URL = 'https://ratemy.excuse';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ratemy.excuse — AI Excuse Generator & Rater',
    template: '%s | ratemy.excuse',
  },
  description:
    'Submit your excuse and get an honest A-F grade from our AI judge. Or let AI write one for you. Free, fun, shareable.',
  keywords: [
    'excuse generator',
    'AI excuse',
    'rate my excuse',
    'excuse rater',
    'funny excuses',
    'excuse maker',
    'late to work excuse',
    'best excuse',
  ],
  authors: [{ name: 'ratemy.excuse' }],
  creator: 'ratemy.excuse',
  openGraph: {
    title: 'ratemy.excuse — AI Excuse Generator & Rater',
    description: 'Submit your excuse. Get graded A-F. Or let AI cook one for you. 🎭',
    url: SITE_URL,
    siteName: 'ratemy.excuse',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'ratemy.excuse — AI-powered excuse engineering',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ratemy.excuse — AI Excuse Generator & Rater',
    description: 'Submit your excuse. Get graded A-F. Or let AI cook one for you. 🎭',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className={`${nunito.className} bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50 min-h-screen`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
