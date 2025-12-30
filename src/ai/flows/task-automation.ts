// TaskAutomation flow implementation.
'use server';

/**
 * @fileOverview Task Automation AI agent.
 *
 * - automateTask - A function that automates tasks based on user description.
 * - AutomateTaskInput - The input type for the automateTask function.
 * - AutomateTaskOutput - The return type for the automateTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomateTaskInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The description of the repetitive task to automate.'),
});
export type AutomateTaskInput = z.infer<typeof AutomateTaskInputSchema>;

const AutomateTaskOutputSchema = z.object({
  automationScript: z
    .string()
    .describe('The automation script generated for the task.'),
  explanation: z
    .string()
    .describe('Explanation of how the automation script works.'),
});
export type AutomateTaskOutput = z.infer<typeof AutomateTaskOutputSchema>;

export async function automateTask(input: AutomateTaskInput): Promise<AutomateTaskOutput> {
  return automateTaskFlow(input);
}

const automateTaskPrompt = ai.definePrompt({
  name: 'automateTaskPrompt',
  input: {schema: AutomateTaskInputSchema},
  output: {schema: AutomateTaskOutputSchema},
  prompt: `You are an AI assistant specialized in automating repetitive tasks.

  Based on the user's description of the task, generate an automation script and explain how the automation script works.

  Task Description: {{{taskDescription}}}

  Automation Script:
  \`\`\`script
  {{automationScript}}
  \`\`\`

  Explanation:
  {{explanation}}`,
});

const automateTaskFlow = ai.defineFlow(
  {
    name: 'automateTaskFlow',
    inputSchema: AutomateTaskInputSchema,
    outputSchema: AutomateTaskOutputSchema,
  },
  async input => {
    const {output} = await automateTaskPrompt(input);
    return output!;
  }
);
