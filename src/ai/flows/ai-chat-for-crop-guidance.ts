'use server';

/**
 * @fileOverview A Genkit flow for providing crop cultivation guidance via AI chat.
 *
 * - askCropQuestion - A function that handles user questions about crop cultivation.
 * - AskCropQuestionInput - The input type for the askCropQuestion function.
 * - AskCropQuestionOutput - The return type for the askCropQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskCropQuestionInputSchema = z.object({
  query: z.string().describe('The user query about crop cultivation.'),
});
export type AskCropQuestionInput = z.infer<typeof AskCropQuestionInputSchema>;

const RecommendationDetailSchema = z.object({
    point: z.string().describe("A single, specific recommendation or step."),
    explanation: z.string().describe("A brief explanation for the recommendation point.")
});

const CultivationStepSchema = z.object({
    step: z.string().describe("The name of the cultivation step (e.g., 'Soil Preparation', 'Planting', 'Harvesting')."),
    details: z.array(RecommendationDetailSchema).describe("A list of detailed actions for this step.")
});

const AskCropQuestionOutputSchema = z.object({
  introduction: z.string().describe("A brief, engaging introduction that directly addresses the user's question."),
  cultivationSteps: z.array(CultivationStepSchema).describe("A step-by-step guide for growing the crop."),
  irrigation: z.object({
      frequency: z.string().describe("Recommended irrigation frequency."),
      method: z.string().describe("Recommended irrigation method."),
      notes: z.string().describe("Additional notes on watering.")
  }),
  fertilizers: z.object({
      recommendation: z.string().describe("Specific fertilizer recommendations (e.g., N-P-K ratio, organic options)."),
      schedule: z.string().describe("The schedule for applying fertilizer."),
      notes: z.string().describe("Additional notes on fertilization.")
  }),
  pesticides: z.object({
      recommendation: z.string().describe("Recommendations for pest and disease control, including specific pesticides if applicable."),
      schedule: z.string().describe("The schedule for applying pesticides."),
      notes: z.string().describe("Additional notes on pest management.")
  })
});
export type AskCropQuestionOutput = z.infer<typeof AskCropQuestionOutputSchema>;

export async function askCropQuestion(input: AskCropQuestionInput): Promise<AskCropQuestionOutput> {
  return askCropQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askCropQuestionPrompt',
  input: {schema: AskCropQuestionInputSchema},
  output: {schema: AskCropQuestionOutputSchema},
  prompt: `You are an expert agronomist AI. A farmer has asked for guidance on crop cultivation.
  
  User's Question: "{{{query}}}"
  
  Your task is to provide a comprehensive, clear, and actionable guide. Structure your response as follows:
  
  1.  **Introduction**: Start with a brief, engaging introduction that directly addresses the user's core question.
  2.  **Cultivation Steps**: Provide a step-by-step guide for growing the crop. Each step should have a clear title (e.g., 'Soil Preparation', 'Planting', 'Maintenance', 'Harvesting') and a list of specific, actionable points with brief explanations.
  3.  **Irrigation**: Detail the recommended irrigation frequency, method, and any important notes.
  4.  **Fertilizers**: Suggest specific fertilizers (e.g., N-P-K ratios, organic options), a feeding schedule, and any other relevant tips.
  5.  **Pesticides**: Recommend methods for pest and disease control, including what to use, when to apply it, and any precautions.
  
  Ensure your advice is practical for a farmer and easy to understand. Generate a complete and detailed plan.`,
});

const askCropQuestionFlow = ai.defineFlow(
  {
    name: 'askCropQuestionFlow',
    inputSchema: AskCropQuestionInputSchema,
    outputSchema: AskCropQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
