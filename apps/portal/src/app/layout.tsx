import type { Metadata } from 'next';
import './globals.css';
import { PortalAuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'AFC Member Portal',
  description: 'Apostolic Faith Church — Member Self-Service Portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PortalAuthProvider>
          {children}
        </PortalAuthProvider>
      </body>
    </html>
  );
}
