import { nextGenkit } from '@genkit-ai/next';
import { ai } from '@/ai/genkit';
import '@/ai/flows/medication-description-generator';

export const { GET, POST } = nextGenkit({ ai });
