'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { next } from '@genkit-ai/next';
import { defineFlow, definePrompt, z } from 'genkit';

export const ai = genkit({
  plugins: [
    googleAI(),
    next(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export { defineFlow, definePrompt, z };
