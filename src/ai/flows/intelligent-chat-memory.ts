'use server';

/**
 * @fileOverview A flow for intelligent chat memory, allowing the AI assistant to remember previous conversations.
 *
 * - intelligentChatMemory - A function that handles the chat memory process.
 * - IntelligentChatMemoryInput - The input type for the intelligentChatMemory function, including the user's message and chat history.
 * - IntelligentChatMemoryOutput - The return type for the intelligentChatMemory function, which includes the AI's response.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentChatMemoryInputSchema = z.object({
  message: z.string().describe('The current message from the user.'),
  chatHistory: z
    .array(z.object({role: z.enum(['user', 'assistant']), content: z.string()}))
    .optional()
    .describe('The chat history between the user and the assistant.'),
});
export type IntelligentChatMemoryInput = z.infer<typeof IntelligentChatMemoryInputSchema>;

const IntelligentChatMemoryOutputSchema = z.object({
  response: z.string().describe("The AI assistant's response to the user message."),
});
export type IntelligentChatMemoryOutput = z.infer<typeof IntelligentChatMemoryOutputSchema>;

export async function intelligentChatMemory(input: IntelligentChatMemoryInput): Promise<IntelligentChatMemoryOutput> {
  return intelligentChatMemoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentChatMemoryPrompt',
  input: {schema: IntelligentChatMemoryInputSchema},
  output: {schema: IntelligentChatMemoryOutputSchema},
  prompt: `You are a helpful AI assistant. Your goal is to provide informative and relevant responses to the user's messages, taking into account the chat history to maintain context and coherence.

Chat History:
{{#each chatHistory}}
  {{#if (this.role == 'user')}}User: {{content}}{{/if}}
  {{#if (this.role == 'assistant')}}Assistant: {{content}}{{/if}}
{{/each}}

Current Message: {{message}}

Response:`,
});

const intelligentChatMemoryFlow = ai.defineFlow(
  {
    name: 'intelligentChatMemoryFlow',
    inputSchema: IntelligentChatMemoryInputSchema,
    outputSchema: IntelligentChatMemoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
