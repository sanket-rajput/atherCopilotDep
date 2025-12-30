'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { useFirebaseAuth } from '@/firebase';

export default function HomeClient() {
  const router = useRouter();
  const auth = useFirebaseAuth();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      router.replace(user ? '/dashboard' : '/login');
    });
    return () => unsub();
  }, [auth, router]);

  return null;
}
