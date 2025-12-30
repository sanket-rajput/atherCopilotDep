'use client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { anonymousLogin, useFirebaseAuth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const auth = useFirebaseAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/dashboard');
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [auth, router]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Button onClick={anonymousLogin}>
        Continue Anonymously
      </Button>
    </div>
  );
}
