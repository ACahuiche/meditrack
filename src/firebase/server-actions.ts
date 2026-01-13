'use server';

import { initializeApp, getApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export async function initializeFirebase() {
  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with the initializeApp() function to provide the environment variables needed to
    // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
    // without arguments.
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      initializeApp();
    } catch (e) {
       // Only warn in production because it's normal to use the firebaseConfig to initialize
      // during development
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
  }

  return getSdks();
}

export async function getSdks() {
  if (!getApps().length) {
    // Call the initializeFirebase function, but we don't need its return value here.
    // The main point is to ensure the app is initialized.
    await initializeFirebase();
  }
  return {
    auth: getAuth(),
    firestore: getFirestore(),
  };
}
