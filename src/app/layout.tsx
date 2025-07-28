import { Orbitron } from 'next/font/google';
import { Providers } from './providers';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Humans of Football',
  description: 'Connect with fellow players and find your next match',
  keywords: ['football', 'soccer', 'players', 'match', 'sports', 'community'],
  authors: [{ name: 'Humans of Football Team' }],
  creator: 'Humans of Football',
  publisher: 'Humans of Football',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Humans of Football',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'application-name': 'HOF',
    'msapplication-TileColor': '#001F10',
    'msapplication-config': '/browserconfig.xml',
  },
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
        
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#001F10" />
        <meta name="background-color" content="#ffffff" />
        
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HOF" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileImage" content="/icons/icon-192x192.svg" />
        <meta name="msapplication-TileColor" content="#001F10" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon-192x192.svg" />
        
        {/* Disable automatic detection */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="format-detection" content="address=no" />
        <meta name="format-detection" content="email=no" />
      </head>
      <body className="h-full min-h-screen w-full overflow-x-hidden bg-background text-foreground antialiased">
        <Providers>
          {children}
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
