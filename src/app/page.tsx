'use client';

import { useMemo } from 'react';
import { Header } from '@/components/header';
import { MedicationList } from '@/components/medication-list';
import type { Medication } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2 } from 'lucide-react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Login } from '@/components/login';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const medicationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/medications`), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: medications, isLoading, error } = useCollection<Medication>(medicationsQuery);

  if (isUserLoading || (user && isLoading)) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading medications...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {error ? (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Firebase Connection Error</AlertTitle>
            <AlertDescription>
              Could not connect to Firestore. Please ensure your Firebase configuration is correct.
              <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-2 text-xs">
                {error.message}
              </pre>
            </AlertDescription>
          </Alert>
        ) : (
          <MedicationList medications={medications || []} />
        )}
      </main>
    </div>
  );
}
