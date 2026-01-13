'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/header';
import { MedicationList } from '@/components/medication-list';
import type { Medication, Dose } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { addHours } from 'date-fns';

export default function Home() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load medications from localStorage
  useEffect(() => {
    try {
      const storedMedications = localStorage.getItem('medications');
      if (storedMedications) {
        setMedications(JSON.parse(storedMedications));
      }
    } catch (error) {
      console.error("Failed to parse medications from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save medications to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('medications', JSON.stringify(medications));
    }
  }, [medications, isLoading]);

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
    setMedications(prevMeds =>
      prevMeds.map(med => {
        if (med.id === medicationId) {
          return {
            ...med,
            doses: med.doses.map(dose =>
              dose.id === doseId ? { ...dose, taken } : dose
            ),
          };
        }
        return med;
      })
    );
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
        <MedicationList medications={medications} onUpdateDose={handleUpdateDose} />
      </main>
    </div>
  );
}
