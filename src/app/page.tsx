
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { Header } from '@/components/header';
import { MedicationList } from '@/components/medication-list';
import type { Medication, Dose, HistoricalMedication } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { addDays, addHours } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HistoricalMedicationList } from '@/components/historical-medication-list';
import { useAuth, useFirebase } from '@/firebase/provider';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [history, setHistory] =useState<HistoricalMedication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user, loading: authLoading } = useAuth();
  const { firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && firestore) {
      setIsLoading(true);

      const medQuery = query(
        collection(firestore, 'users', user.uid, 'medications'),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribeMeds = onSnapshot(medQuery, (snapshot) => {
        const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medication));
        setMedications(meds);
        setIsLoading(false);
      }, (error) => {
        console.error("Error al obtener medicamentos:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudieron obtener los medicamentos." });
        setIsLoading(false);
      });

      const historyQuery = query(
        collection(firestore, 'users', user.uid, 'history'),
        orderBy('completedAt', 'desc')
      );

      const unsubscribeHistory = onSnapshot(historyQuery, (snapshot) => {
        const hist = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoricalMedication));
        setHistory(hist);
      }, (error) => {
        console.error("Error al obtener el historial:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo obtener el historial de medicamentos." });
      });


      return () => {
        unsubscribeMeds();
        unsubscribeHistory();
      };
    }
  }, [user, firestore, toast]);

  const generateDoseSchedule = (
    startDate: Date,
    frequencyHours: number,
    durationDays: number
  ): Dose[] => {
    const doses: Dose[] = [];
    const totalHours = durationDays * 24;
    const numberOfDoses = Math.floor(totalHours / frequencyHours);

    for (let i = 0; i < numberOfDoses; i++) {
      const doseTime = addHours(startDate, i * frequencyHours);
      doses.push({
        id: crypto.randomUUID(),
        time: doseTime.toISOString(),
        taken: false,
      });
    }
    return doses;
  };

  const handleAddMedication = useCallback(async (values: Omit<Medication, 'id' | 'doses' | 'createdAt' | 'initialDoseTimestamp' | 'userId'> & { initialDoseDate: Date; initialDoseTime: string }) => {
    if (!user || !firestore) return;

    const {
      name,
      description,
      dosageFrequencyHours,
      durationDays,
      initialDoseDate,
      initialDoseTime,
    } = values;

    const [hours, minutes] = initialDoseTime.split(':').map(Number);
    const startDate = new Date(initialDoseDate);
    startDate.setHours(hours, minutes, 0, 0);

    const doses = generateDoseSchedule(startDate, dosageFrequencyHours, durationDays);

    const newMedication: Omit<Medication, 'id'> = {
      userId: user.uid,
      name,
      description: description || '',
      dosageFrequencyHours,
      durationDays,
      initialDoseTimestamp: startDate.toISOString(),
      doses,
      createdAt: new Date().toISOString(),
    };

    try {
      const medRef = collection(firestore, 'users', user.uid, 'medications');
      await addDoc(medRef, newMedication);
    } catch (error) {
      console.error("Error al añadir medicamento:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el medicamento." });
    }
  }, [user, firestore, toast]);

  const handleUpdateDose = useCallback(async (medicationId: string, doseId: string, taken: boolean) => {
    if (!user || !firestore) return;

    const medication = medications.find(m => m.id === medicationId);
    if (!medication) return;

    const updatedDoses = medication.doses.map(dose =>
      dose.id === doseId ? { ...dose, taken } : dose
    );

    const isComplete = updatedDoses.every(d => d.taken);
    const medDocRef = doc(firestore, 'users', user.uid, 'medications', medicationId);

    if (isComplete) {
       const historicalEntry: Omit<HistoricalMedication, 'id'> = {
        userId: user.uid,
        name: medication.name,
        description: medication.description,
        dosageFrequencyHours: medication.dosageFrequencyHours,
        totalDoses: medication.doses.length,
        startDate: medication.initialDoseTimestamp,
        endDate: addDays(new Date(medication.initialDoseTimestamp), medication.durationDays).toISOString(),
        completedAt: new Date().toISOString()
      };
      
      try {
        await addDoc(collection(firestore, 'users', user.uid, 'history'), historicalEntry);
        await deleteDoc(medDocRef);
      } catch (error) {
        console.error("Error al archivar medicamento:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo archivar el medicamento." });
      }

    } else {
      try {
        await updateDoc(medDocRef, { doses: updatedDoses });
      } catch (error) {
        console.error("Error al actualizar la dosis:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el estado de la dosis." });
      }
    }
  }, [user, firestore, medications, toast]);

  if (authLoading || isLoading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header onAddMedication={handleAddMedication} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
         <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Activos</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-4">
            <MedicationList medications={medications} onUpdateDose={handleUpdateDose} />
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <HistoricalMedicationList medications={history} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
