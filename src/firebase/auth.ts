'use client';

import { getAuth, signInAnonymously } from 'firebase/auth';
import { initializeFirebase } from './index';

export function useFirebaseAuth() {
  const { firebaseApp } = initializeFirebase();
  return getAuth(firebaseApp);
}

export async function anonymousLogin() {
  const auth = useFirebaseAuth();
  await signInAnonymously(auth);
}
