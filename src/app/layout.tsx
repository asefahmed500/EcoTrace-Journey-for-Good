import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import Providers from '@/components/providers';
import { SiteFooter } from '@/components/landing/footer';
import { ConditionalHeader } from '@/components/layout/conditional-header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EcoTrace: Journey for Good',
  description: 'Track, visualize, and gamify your carbon footprint based on your daily travel patterns.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <ConditionalHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
