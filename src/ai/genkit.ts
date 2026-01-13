'use server';

import { genkit, configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { next } from '@genkit-ai/next';
import { defineFlow, definePrompt, z } from 'genkit';

configureGenkit({
  plugins: [
    googleAI(),
    next({
      // Next.js-specific options can be provided here
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export { genkit, defineFlow, definePrompt, z };
export const ai = genkit;
