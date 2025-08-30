'use server';

/**
 * @fileOverview An AI agent that generates a motivational summary for a volunteer.
 *
 * - generateMotivation - A function that handles the generation of the motivational summary.
 * - GenerateMotivationInput - The input type for the generateMotivation function.
 * - GenerateMotivationOutput - The return type for the generateMotivation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMotivationInputSchema = z.object({
  volunteerData: z.string().describe('JSON string of an array of all volunteer data objects, each containing volunteer name and total hours volunteered.  For example: `[{name: "Alice", hours: 20}, {name: "Bob", hours: 30}]`.'),
  currentVolunteerName: z.string().describe("The name of the volunteer for whom to generate the motivational message."),
});
export type GenerateMotivationInput = z.infer<
  typeof GenerateMotivationInputSchema
>;

const GenerateMotivationOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A short, uplifting, and motivational summary for the specified volunteer.'
    ),
});
export type GenerateMotivationOutput = z.infer<
  typeof GenerateMotivationOutputSchema
>;

export async function generateMotivation(
  input: GenerateMotivationInput
): Promise<GenerateMotivationOutput> {
  return generateMotivationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMotivationPrompt',
  input: {schema: GenerateMotivationInputSchema},
  output: {schema: GenerateMotivationOutputSchema},
  prompt: `You are a motivational coach for volunteers. Your task is to generate a short, uplifting, and encouraging summary for a specific volunteer based on the data provided.

The data for all volunteers this month is:
{{{volunteerData}}}

The volunteer you are writing the message for is named: {{{currentVolunteerName}}}.

Please analyze their hours compared to the average of all volunteers. Provide a positive and personal message that will motivate them to continue volunteering. Keep it concise (2-3 sentences).
  `,
});

const generateMotivationFlow = ai.defineFlow(
  {
    name: 'generateMotivationFlow',
    inputSchema: GenerateMotivationInputSchema,
    outputSchema: GenerateMotivationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
