import { Orbitron } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Humans of Football',
  description: 'Connect with fellow players and find your next match',
};

export const viewport = {
  themeColor: '#001F10',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${orbitron.className} h-full min-h-screen w-full`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="h-full min-h-screen w-full overflow-x-hidden bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
