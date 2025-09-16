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

const AskCropQuestionOutputSchema = z.object({
  answer: z.string().describe('The AI generated answer to the crop question.'),
});
export type AskCropQuestionOutput = z.infer<typeof AskCropQuestionOutputSchema>;

export async function askCropQuestion(input: AskCropQuestionInput): Promise<AskCropQuestionOutput> {
  return askCropQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askCropQuestionPrompt',
  input: {schema: AskCropQuestionInputSchema},
  output: {schema: AskCropQuestionOutputSchema},
  prompt: `You are an AI assistant specialized in providing guidance on crop cultivation.
  A farmer has asked the following question: {{{query}}}
  Provide a helpful and informative answer to improve their farming practices and yields.`,
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
