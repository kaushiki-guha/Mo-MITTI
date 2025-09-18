'use server';
/**
 * @fileOverview A Genkit flow for suggesting crops based on land characteristics.
 *
 * - suggestCropsForLand - A function that suggests crops for a given piece of land.
 * - SuggestCropsForLandInput - The input type for the suggestCropsForLand function.
 * - SuggestCropsForLandOutput - The return type for the suggestCropsForLand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SuggestCropsForLandInputSchema = z.object({
    photoDataUri: z
        .string()
        .describe(
        "A photo of farm land, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    landSize: z.string().describe('The size of the farm land in acres.'),
    irrigationSystem: z.string().describe('The type of irrigation system used.'),
});
export type SuggestCropsForLandInput = z.infer<typeof SuggestCropsForLandInputSchema>;

const CropSuggestionSchema = z.object({
    cropName: z.string().describe('The name of the suggested crop.'),
    reasoning: z.string().describe('The reasoning for suggesting this crop for the given land.'),
    estimatedYield: z.string().describe('An estimated potential yield for the crop in the given land size.'),
});

export const SuggestCropsForLandOutputSchema = z.object({
    suggestions: z.array(CropSuggestionSchema).describe('A list of crop suggestions.'),
});
export type SuggestCropsForLandOutput = z.infer<typeof SuggestCropsForLandOutputSchema>;


export async function suggestCropsForLand(input: SuggestCropsForLandInput): Promise<SuggestCropsForLandOutput> {
    return suggestCropsForLandFlow(input);
}


const prompt = ai.definePrompt({
    name: 'suggestCropsPrompt',
    input: {schema: SuggestCropsForLandInputSchema},
    output: {schema: SuggestCropsForLandOutputSchema},
    prompt: `You are an expert agronomist. Based on the provided image of a piece of farm land, its size, and the irrigation system, suggest suitable crops.
    
    Analyze the image for visual cues like terrain, apparent soil color and texture, and any visible water sources or vegetation.
    
    Land Size: {{{landSize}}} acres
    Irrigation System: {{{irrigationSystem}}}
    
    Provide a list of 3 crop suggestions. For each suggestion, provide the crop name, a detailed reasoning for why it's suitable, and an estimated potential yield for the given land size.

    Image: {{media url=photoDataUri}}
    `,
});


const suggestCropsForLandFlow = ai.defineFlow(
    {
        name: 'suggestCropsForLandFlow',
        inputSchema: SuggestCropsForLandInputSchema,
        outputSchema: SuggestCropsForLandOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);
