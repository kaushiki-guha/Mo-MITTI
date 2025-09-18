'use server';

/**
 * @fileOverview Analyzes an image to determine vegetation and soil indices and provides analysis.
 *
 * - analyzeVegetation - A function that takes a crop image and returns vegetation and soil analysis.
 * - AnalyzeVegetationInput - The input type for the analyzeVegetation function.
 * - AnalyzeVegetationOutput - The return type for the analyzeVegetation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeVegetationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeVegetationInput = z.infer<typeof AnalyzeVegetationInputSchema>;

const AnalyzeVegetationOutputSchema = z.object({
  vegetationIndices: z.object({
    ndvi: z.number().describe("The estimated Normalized Difference Vegetation Index (NDVI) value, ranging from -1 to 1."),
    savi: z.number().describe("The estimated Soil-Adjusted Vegetation Index (SAVI) value."),
    chlorophyllContent: z.number().describe("The estimated chlorophyll content (e.g., in mg/m^2 or as an index value like CCI)."),
    moistureLevel: z.number().describe("The estimated soil moisture level (e.g., as a percentage or a relative index).")
  }),
  soilIndices: z.object({
    bi: z.number().describe("The estimated Brightness Index (BI), indicating soil brightness."),
    ci: z.number().describe("The estimated Color Index (CI), indicating soil color characteristics."),
  }),
  analysis: z.string().describe("A summary of the vegetation and soil health based on the indices, including noise removal and segmentation observations."),
  noiseRemoval: z.string().describe("Description of how noise was accounted for in the analysis."),
  segmentation: z.string().describe("Description of how the image was segmented to identify vegetation."),
});
export type AnalyzeVegetationOutput = z.infer<typeof AnalyzeVegetationOutputSchema>;

export async function analyzeVegetation(input: AnalyzeVegetationInput): Promise<AnalyzeVegetationOutput> {
  return analyzeVegetationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeVegetationPrompt',
  input: {schema: AnalyzeVegetationInputSchema},
  output: {schema: AnalyzeVegetationOutputSchema},
  prompt: `You are an expert in agricultural remote sensing and image analysis.
  Analyze the provided image of a crop field. Your task is to:
  1.  Estimate the Normalized Difference Vegetation Index (NDVI) and Soil-Adjusted Vegetation Index (SAVI) from the image.
  2.  Estimate the chlorophyll content and moisture level from the image.
  3.  Estimate soil indices like the Brightness Index (BI) and Color Index (CI) based on visible soil patches.
  4.  Conceptually describe how you would perform noise removal (e.g., atmospheric effects, sensor noise) on this image.
  5.  Describe the segmentation process to distinguish between vegetation and soil or other objects.
  6.  Provide a summary analysis of the crop and soil health based on the estimated indices and visual inspection.

  Image: {{media url=photoDataUri}}
  `,
});

const analyzeVegetationFlow = ai.defineFlow(
  {
    name: 'analyzeVegetationFlow',
    inputSchema: AnalyzeVegetationInputSchema,
    outputSchema: AnalyzeVegetationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
