'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function HomeClient() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded) {
      router.replace(isSignedIn ? '/chat' : '/login');
    }
  }, [isLoaded, isSignedIn, router]);

  return null;
}
