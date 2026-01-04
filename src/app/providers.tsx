'use client';

import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { ClerkProvider } from '@clerk/nextjs';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <FirebaseClientProvider>
        {children}
        <Toaster />
      </FirebaseClientProvider>
    </ClerkProvider>
  );
}
