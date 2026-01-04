'use client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignInButton, useUser } from '@clerk/nextjs';

export default function LoginPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/chat');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return <div className="flex min-h-screen items-center justify-center">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignInButton>
        <button className="btn">Sign in / Create account</button>
      </SignInButton>
    </div>
  );
}
