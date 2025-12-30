'use server';

/**
 * Intelligent Chat Memory Flow
 * Safely processes chat history and maintains conversational context.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/* -------------------- SCHEMAS -------------------- */

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const IntelligentChatMemoryInputSchema = z.object({
  message: z.string().describe('The current message from the user.'),
  chatHistory: z
    .array(ChatMessageSchema)
    .optional()
    .describe('Previous conversation messages.'),
});

export type IntelligentChatMemoryInput = z.infer<
  typeof IntelligentChatMemoryInputSchema
>;

const IntelligentChatMemoryOutputSchema = z.object({
  response: z.string().describe("The AI assistant's response."),
});

export type IntelligentChatMemoryOutput = z.infer<
  typeof IntelligentChatMemoryOutputSchema
>;

/* -------------------- PROMPT -------------------- */

const prompt = ai.definePrompt({
  name: 'intelligentChatMemoryPrompt',
  input: {
    schema: z.object({
      message: z.string(),
      chatHistory: z.array(
        z.object({
          content: z.string(),
          isUser: z.boolean(),
        })
      ),
    }),
  },
  output: { schema: IntelligentChatMemoryOutputSchema },
  prompt: `
You are a helpful, intelligent AI assistant.
Use the chat history to maintain context.

Chat History:
{{#each chatHistory}}
{{#if this.isUser}}
User: {{this.content}}
{{else}}
Assistant: {{this.content}}
{{/if}}
{{/each}}

Current User Message:
{{message}}

Respond clearly and helpfully:
`,
});

/* -------------------- FLOW -------------------- */

export async function intelligentChatMemory(
  input: IntelligentChatMemoryInput
): Promise<IntelligentChatMemoryOutput> {
  return intelligentChatMemoryFlow(input);
}

const intelligentChatMemoryFlow = ai.defineFlow(
  {
    name: 'intelligentChatMemoryFlow',
    inputSchema: IntelligentChatMemoryInputSchema,
    outputSchema: IntelligentChatMemoryOutputSchema,
  },
  async (input) => {
    // ✅ DERIVE isUser HERE (NOT IN UI)
    const normalizedHistory =
      input.chatHistory?.map((m) => ({
        content: m.content,
        isUser: m.role === 'user',
      })) ?? [];

    const { output } = await prompt({
      message: input.message,
      chatHistory: normalizedHistory,
    });

    return output!;
  }
);
