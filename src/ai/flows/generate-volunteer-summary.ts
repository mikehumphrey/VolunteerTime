'use server';

/**
 * @fileOverview An AI agent that generates a summary of volunteer hours for each volunteer.
 *
 * - generateVolunteerSummary - A function that handles the generation of volunteer summaries.
 * - GenerateVolunteerSummaryInput - The input type for the generateVolunteerSummary function.
 * - GenerateVolunteerSummaryOutput - The return type for the generateVolunteerSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVolunteerSummaryInputSchema = z.object({
  volunteerData: z.string().describe('JSON string of an array of volunteer data objects, each containing volunteer name and total hours volunteered.  For example: `[{name: \"Alice\", hours: 20}, {name: \"Bob\", hours: 30}]`.'),
});
export type GenerateVolunteerSummaryInput = z.infer<
  typeof GenerateVolunteerSummaryInputSchema
>;

const GenerateVolunteerSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of volunteer hours for each volunteer, including patterns and insights.'
    ),
});
export type GenerateVolunteerSummaryOutput = z.infer<
  typeof GenerateVolunteerSummaryOutputSchema
>;

export async function generateVolunteerSummary(
  input: GenerateVolunteerSummaryInput
): Promise<GenerateVolunteerSummaryOutput> {
  return generateVolunteerSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVolunteerSummaryPrompt',
  input: {schema: GenerateVolunteerSummaryInputSchema},
  output: {schema: GenerateVolunteerSummaryOutputSchema},
  prompt: `You are an expert in analyzing volunteer data and generating insightful summaries.

  Given the following volunteer data, generate a summary of volunteer hours for each volunteer, identifying any patterns and insights.

  Volunteer Data: {{{volunteerData}}}
  `,
});

const generateVolunteerSummaryFlow = ai.defineFlow(
  {
    name: 'generateVolunteerSummaryFlow',
    inputSchema: GenerateVolunteerSummaryInputSchema,
    outputSchema: GenerateVolunteerSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
