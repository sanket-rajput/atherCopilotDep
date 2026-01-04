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
  mode: z
    .enum(['general', 'coding', 'cognitive', 'knowledge', 'task'])
    .optional()
    .describe('Operational mode to tailor assistant behavior.'),
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
      mode: z.string().optional(),
    }),
  },
  output: { schema: IntelligentChatMemoryOutputSchema },
  prompt: `
You are a helpful, intelligent AI assistant.
Use the chat history to maintain context.

Mode: {{mode}}

Behavior guidance:
- If Mode is 'coding': act as a coding assistant. Provide runnable code snippets, explain design decisions, and include tests or examples when helpful.
- If Mode is 'cognitive': focus on memory, summarization, and recalling prior details from the conversation.
- If Mode is 'knowledge': prioritize factual answers and provide sources or citations where possible.
- If Mode is 'task': provide step-by-step actionable plans, checklists, and commands the user can run to automate tasks.
- Otherwise, be general and concise.

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
