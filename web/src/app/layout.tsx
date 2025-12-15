// src/app/layout.tsx
import '@/styles/global.css';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';
import ToastProvider from '@/components/notifications/ToastProvider';
import NotificationButton from '@/components/notifications/NotificationButton';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <ToastProvider>
            {children}
            <NotificationButton />
          </ToastProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
