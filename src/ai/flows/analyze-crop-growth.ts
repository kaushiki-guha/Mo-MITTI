'use server';

/**
 * @fileOverview Analyzes crop growth stage from an image.
 *
 * - analyzeCropGrowth - A function that takes an image of a crop and determines its growth stage.
 * - AnalyzeCropGrowthInput - The input type for the analyzeCropGrowth function.
 * - AnalyzeCropGrowthOutput - The return type for the analyzeCropGrowth function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCropGrowthInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeCropGrowthInput = z.infer<typeof AnalyzeCropGrowthInputSchema>;

const AnalyzeCropGrowthOutputSchema = z.object({
    growthStage: z.string().describe("The determined growth stage of the crop in the image (e.g., germination, vegetative, flowering, harvest-ready)."),
    analysis: z.string().describe("A brief analysis of the crop's health based on the growth stage.")
});
export type AnalyzeCropGrowthOutput = z.infer<typeof AnalyzeCropGrowthOutputSchema>;

export async function analyzeCropGrowth(input: AnalyzeCropGrowthInput): Promise<AnalyzeCropGrowthOutput> {
  return analyzeCropGrowthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCropGrowthPrompt',
  input: {schema: AnalyzeCropGrowthInputSchema},
  output: {schema: AnalyzeCropGrowthOutputSchema},
  prompt: `You are an AI assistant specializing in analyzing crop growth stages from images.
  Analyze the image provided and determine the growth stage of the crop.
  Provide a brief analysis of the crop's health at this stage.

  Image: {{media url=photoDataUri}}
  `,
});

const analyzeCropGrowthFlow = ai.defineFlow(
  {
    name: 'analyzeCropGrowthFlow',
    inputSchema: AnalyzeCropGrowthInputSchema,
    outputSchema: AnalyzeCropGrowthOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
