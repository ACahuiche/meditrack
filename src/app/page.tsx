'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/header';
import { MedicationList } from '@/components/medication-list';
import type { Medication, Dose, HistoricalMedication } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { addHours, addDays } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HistoricalMedicationList } from '@/components/historical-medication-list';

export default function Home() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [history, setHistory] = useState<HistoricalMedication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage
  useEffect(() => {
    try {
      const storedMedications = localStorage.getItem('medications');
      if (storedMedications) {
        setMedications(JSON.parse(storedMedications));
      }
      const storedHistory = localStorage.getItem('medicationHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save medications to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('medications', JSON.stringify(medications));
    }
  }, [medications, isLoading]);

  // Save history to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('medicationHistory', JSON.stringify(history));
    }
  }, [history, isLoading]);


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

  const handleAddMedication = useCallback((values: Omit<Medication, 'id' | 'doses' | 'createdAt' | 'initialDoseTimestamp'> & { initialDoseDate: Date; initialDoseTime: string }) => {
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

    const newMedication: Medication = {
      id: crypto.randomUUID(),
      name,
      description: description || '',
      dosageFrequencyHours,
      durationDays,
      initialDoseTimestamp: startDate.toISOString(),
      doses,
      createdAt: new Date().toISOString(),
    };

    setMedications(prevMeds => [newMedication, ...prevMeds].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  const handleUpdateDose = useCallback((medicationId: string, doseId: string, taken: boolean) => {
    let completedMed: Medication | undefined;

    setMedications(prevMeds =>
      prevMeds.map(med => {
        if (med.id === medicationId) {
          const updatedDoses = med.doses.map(dose =>
            dose.id === doseId ? { ...dose, taken } : dose
          );
          
          const isComplete = updatedDoses.every(d => d.taken);
          if (isComplete) {
            completedMed = { ...med, doses: updatedDoses };
            return med; // We will filter it out later
          }

          return {
            ...med,
            doses: updatedDoses,
          };
        }
        return med;
      }).filter(med => !completedMed || med.id !== completedMed.id)
    );

    if (completedMed) {
      const historicalEntry: HistoricalMedication = {
        id: completedMed.id,
        name: completedMed.name,
        description: completedMed.description,
        dosageFrequencyHours: completedMed.dosageFrequencyHours,
        totalDoses: completedMed.doses.length,
        startDate: completedMed.initialDoseTimestamp,
        endDate: addDays(new Date(completedMed.initialDoseTimestamp), completedMed.durationDays).toISOString(),
        completedAt: new Date().toISOString()
      };
      setHistory(prevHistory => [historicalEntry, ...prevHistory].sort((a,b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()));
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header onAddMedication={handleAddMedication} />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading medications...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header onAddMedication={handleAddMedication} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
         <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
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
