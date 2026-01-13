'use server';

/**
 * @fileOverview Generates a medication description using AI based on the medication name and dosage schedule.
 *
 * - generateMedicationDescription - A function that generates a medication description.
 * - MedicationDescriptionInput - The input type for the generateMedicationDescription function.
 * - MedicationDescriptionOutput - The return type for the generateMedicationDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicationDescriptionInputSchema = z.object({
  medicationName: z.string().describe('The name of the medication.'),
  dosageFrequencyHours: z.number().describe('How often the medication should be taken, in hours.'),
  durationDays: z.number().describe('How many days the medication should be taken for.'),
  initialDoseTime: z.string().describe('The time of the first dose (e.g., 1:00 PM).'),
});
export type MedicationDescriptionInput = z.infer<typeof MedicationDescriptionInputSchema>;

const MedicationDescriptionOutputSchema = z.object({
  description: z.string().describe('A generated description of the medication and its schedule.'),
});
export type MedicationDescriptionOutput = z.infer<typeof MedicationDescriptionOutputSchema>;

export async function generateMedicationDescription(
  input: MedicationDescriptionInput
): Promise<MedicationDescriptionOutput> {
  return medicationDescriptionGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'medicationDescriptionPrompt',
  input: {schema: MedicationDescriptionInputSchema},
  output: {schema: MedicationDescriptionOutputSchema},
  prompt: `You are a helpful AI assistant designed to provide concise and informative medication descriptions based on provided details.

  Given the following medication details, generate a description:

  Medication Name: {{{medicationName}}}
  Dosage Frequency: Every {{{dosageFrequencyHours}}} hours
  Duration: {{{durationDays}}} days
  Initial Dose Time: {{{initialDoseTime}}}

  Description:`,
});

const medicationDescriptionGeneratorFlow = ai.defineFlow(
  {
    name: 'medicationDescriptionGeneratorFlow',
    inputSchema: MedicationDescriptionInputSchema,
    outputSchema: MedicationDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
