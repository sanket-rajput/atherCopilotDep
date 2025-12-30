'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomeClient() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      router.replace(user ? '/dashboard' : '/login');
    }
  }, [user, isUserLoading, router]);

  return null;
}
