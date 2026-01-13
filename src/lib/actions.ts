'use server';

import { revalidatePath } from 'next/cache';
import { addHours } from 'date-fns';
import {
  generateMedicationDescription,
  type MedicationDescriptionInput,
} from '@/ai/flows/medication-description-generator';
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
  userId: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

function generateDoseSchedule(
  startDate: Date,
  frequencyHours: number,
  durationDays: number
): Dose[] {
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
}

export async function addMedication(values: FormValues) {
  const validation = formSchema.safeParse(values);

  if (!validation.success) {
    console.error('Validation failed:', validation.error);
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
    const { firestore } = await getSdks();
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

    const medicationsColRef = firestore.collection(`users/${userId}/medications`);
    await medicationsColRef.add(newMedication);

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to add medication:', error);
    return { error: error.message || 'Failed to add medication.' };
  }
}

export async function updateDoseState(
  userId: string,
  medicationId: string,
  doseId: string,
  taken: boolean
) {
  try {
    const { firestore } = await getSdks();
    const medicationRef = firestore.doc(`users/${userId}/medications/${medicationId}`);
    const medicationDoc = await medicationRef.get();

    if (!medicationDoc.exists) {
      throw new Error('Medication not found.');
    }

    const medicationData = medicationDoc.data() as Medication;
    const newDoses = medicationData.doses.map((dose) =>
      dose.id === doseId ? { ...dose, taken } : dose
    );

    await medicationRef.update({ doses: newDoses });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update dose state:', error);
    return { error: error.message || 'Failed to update dose state.' };
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
