'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating code snippets from voice commands.
 *
 * The flow takes a natural language description of the desired code as input and returns the generated code snippet.
 *
 * @interface VoiceActivatedCodeGenerationInput - Defines the input schema for the flow.
 * @interface VoiceActivatedCodeGenerationOutput - Defines the output schema for the flow.
 * @function generateCodeSnippet - The main function that triggers the code generation flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceActivatedCodeGenerationInputSchema = z.object({
  voiceCommand: z.string().describe('A natural language description of the desired code snippet.'),
});

export type VoiceActivatedCodeGenerationInput = z.infer<typeof VoiceActivatedCodeGenerationInputSchema>;

const VoiceActivatedCodeGenerationOutputSchema = z.object({
  codeSnippet: z.string().describe('The generated code snippet.'),
});

export type VoiceActivatedCodeGenerationOutput = z.infer<typeof VoiceActivatedCodeGenerationOutputSchema>;

export async function generateCodeSnippet(input: VoiceActivatedCodeGenerationInput): Promise<VoiceActivatedCodeGenerationOutput> {
  return voiceActivatedCodeGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'voiceActivatedCodeGenerationPrompt',
  input: {schema: VoiceActivatedCodeGenerationInputSchema},
  output: {schema: VoiceActivatedCodeGenerationOutputSchema},
  prompt: `You are an expert code generator.  The user will provide a voice command which describes the code they want you to generate.

Voice Command: {{{voiceCommand}}}

Generate the code snippet that satisfies the voice command. Enclose code snippet with markdown code fences.
`,
});

const voiceActivatedCodeGenerationFlow = ai.defineFlow(
  {
    name: 'voiceActivatedCodeGenerationFlow',
    inputSchema: VoiceActivatedCodeGenerationInputSchema,
    outputSchema: VoiceActivatedCodeGenerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
