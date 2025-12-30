'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Initialize Firebase only once and return SDKs
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  const firebaseApp =
    getApps().length === 0
      ? initializeApp(firebaseConfig)
      : getApp();

  return getSdks(firebaseApp);
}

/**
 * Get Firebase SDK instances
 */
export function getSdks(firebaseApp: FirebaseApp): {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}

/* ----------------------------------
   Re-exports (unchanged)
----------------------------------- */

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
