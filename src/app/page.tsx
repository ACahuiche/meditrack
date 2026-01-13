import { Header } from "@/components/header";
import { MedicationList } from "@/components/medication-list";
import { db } from "@/lib/firebase";
import type { Medication } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

async function getMedications() {
  try {
    const snapshot = await db.collection("medications").orderBy("createdAt", "desc").get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Medication[];
  } catch (error) {
    console.error("Firebase error:", error);
    return null;
  }
}

export default async function Home() {
  const medications = await getMedications();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {medications === null ? (
           <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Firebase Connection Error</AlertTitle>
            <AlertDescription>
              Could not connect to Firestore. Please ensure your Firebase configuration is correct. Check your .env.local file.
            </AlertDescription>
          </Alert>
        ) : (
          <MedicationList medications={medications} />
        )}
      </main>
    </div>
  );
}
