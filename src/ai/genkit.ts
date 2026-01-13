import nextGenkit from '@genkit-ai/next';
import {googleAI} from '@genkit-ai/google-genai';
import {genkit} from 'genkit';

export const ai = nextGenkit(
  genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.5-flash',
  })
);
