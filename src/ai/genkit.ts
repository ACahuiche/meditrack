'use server';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { defineFlow, definePrompt, z } from 'genkit';

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});

export { defineFlow, definePrompt, z };
