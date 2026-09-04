import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kudumbam Union 🌴 | Kerala Family WhatsApp Simulator',
  description:
    'Upload a photo and experience hilarious, dynamic reactions from your Kerala family group — Sheela (Amma), Anjali (Sister), Soman (Uncle), and Latha (Aunty). Built for TinkerHub Useless Projects 3.0.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full select-none">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-ku-bg text-ku-text font-sans antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
