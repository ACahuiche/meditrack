import { nextGenkit } from '@genkit-ai/next';
import '@/ai/flows/medication-description-generator';
import { ai } from '@/ai/genkit';

export const { GET, POST } = nextGenkit(ai);
