'use server';

import { revalidatePath } from 'next/cache';
import { addHours } from 'date-fns';
import {
  generateMedicationDescription,
  type MedicationDescriptionInput,
} from '@/ai/flows/medication-description-generator';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { getSdks } from '@/firebase/server-actions';
import type { Dose, Medication } from './types';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  dosageFrequencyHours: z.coerce.number().min(1),
  durationDays: z.coerce.number().min(1),
  initialDoseDate: z.date(),
  initialDoseTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  userId: z.string(), // Added userId to associate medication with a user
});

type FormValues = z.infer<typeof formSchema>;

function generateDoseSchedule(
  startDate: Date,
  frequencyHours: number,
  durationDays: number
): Dose[] {
  const doses: Dose[] = [];
  const numberOfDoses = Math.floor((durationDays * 24) / frequencyHours);

  for (let i = 0; i < numberOfDoses; i++) {
    const doseTime = addHours(startDate, i * frequencyHours);
    doses.push({
      id: crypto.randomUUID(),
      time: doseTime.toISOString(),
      taken: false,
    });
  }
  return doses;
}

export async function addMedication(values: FormValues) {
  const validation = formSchema.safeParse(values);

  if (!validation.success) {
    return { error: 'Invalid data provided.' };
  }

  const {
    name,
    description,
    dosageFrequencyHours,
    durationDays,
    initialDoseDate,
    initialDoseTime,
    userId,
  } = validation.data;

  try {
    const { firestore } = getSdks();
    const [hours, minutes] = initialDoseTime.split(':').map(Number);
    const startDate = new Date(initialDoseDate);
    startDate.setHours(hours, minutes, 0, 0);

    const doses = generateDoseSchedule(
      startDate,
      dosageFrequencyHours,
      durationDays
    );

    const newMedication: Omit<Medication, 'id'> = {
      name,
      description: description || '',
      dosageFrequencyHours,
      durationDays,
      initialDoseTimestamp: startDate.toISOString(),
      doses,
      createdAt: new Date().toISOString(),
    };

    const medicationsColRef = collection(firestore, `users/${userId}/medications`);
    await addDocumentNonBlocking(medicationsColRef, newMedication);

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to add medication.' };
  }
}

export async function updateDoseState(
  userId: string,
  medicationId: string,
  doses: Dose[],
  doseId: string,
  taken: boolean,
) {
  try {
    const { firestore } = getSdks();
    const docRef = doc(firestore, `users/${userId}/medications`, medicationId);
    
    const newDoses = doses.map((dose) =>
      dose.id === doseId ? { ...dose, taken } : dose
    );

    updateDocumentNonBlocking(docRef, { doses: newDoses });

    revalidatePath('/');
  } catch (error) {
    console.error('Failed to update dose state:', error);
    // In a real app, you might want to return an error object
  }
}

export async function generateDescriptionForMedication(
  input: MedicationDescriptionInput
) {
  try {
    const result = await generateMedicationDescription(input);
    return result;
  } catch (error) {
    console.error('AI description generation failed:', error);
    throw new Error('Failed to generate description.');
  }
}
