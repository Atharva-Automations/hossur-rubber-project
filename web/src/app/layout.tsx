import '../styles/global.css';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Rubber MES Dashboard',
  description: 'Web-based MES for Rubber Manufacturing',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn('bg-gray-50 text-gray-900', inter.className)}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
