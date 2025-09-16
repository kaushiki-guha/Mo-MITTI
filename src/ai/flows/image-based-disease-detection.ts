'use server';
/**
 * @fileOverview Detects plant diseases from uploaded images and suggests remedies.
 *
 * - detectDisease - A function that takes an image of a crop and identifies potential diseases.
 * - DetectDiseaseInput - The input type for the detectDisease function.
 * - DetectDiseaseOutput - The return type for the detectDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectDiseaseInput = z.infer<typeof DetectDiseaseInputSchema>;

const DetectDiseaseOutputSchema = z.object({
  diseaseIdentification: z.object({
    diseaseDetected: z.boolean().describe('Whether a disease is detected in the image.'),
    diseaseName: z.string().describe('The name of the identified disease, if any.'),
    confidenceLevel: z
      .number()
      .describe('The confidence level of the disease identification (0-1).')
      .optional(),
  }),
  suggestedRemedies: z
    .string()
    .describe('Suggested remedies for the identified disease.'),
});
export type DetectDiseaseOutput = z.infer<typeof DetectDiseaseOutputSchema>;

export async function detectDisease(input: DetectDiseaseInput): Promise<DetectDiseaseOutput> {
  return detectDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectDiseasePrompt',
  input: {schema: DetectDiseaseInputSchema},
  output: {schema: DetectDiseaseOutputSchema},
  prompt: `You are an AI assistant specializing in identifying plant diseases from images.
  Analyze the image provided and determine if any disease is present.
  If a disease is detected, provide the name of the disease, your confidence level (0-1), and suggest remedies.

  Image: {{media url=photoDataUri}}
  `,
});

const detectDiseaseFlow = ai.defineFlow(
  {
    name: 'detectDiseaseFlow',
    inputSchema: DetectDiseaseInputSchema,
    outputSchema: DetectDiseaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
