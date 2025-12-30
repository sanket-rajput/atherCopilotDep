'use server';

/**
 * @fileOverview Provides AI-based study support by summarizing content and answering questions.
 *
 * - studyAssistant - A function that handles study assistance.
 * - StudyAssistantInput - The input type for the studyAssistant function.
 * - StudyAssistantOutput - The return type for the studyAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StudyAssistantInputSchema = z.object({
  query: z.string().describe('The question asked by the student.'),
  document: z.string().describe('The document content to study.'),
});

export type StudyAssistantInput = z.infer<typeof StudyAssistantInputSchema>;

const StudyAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
  requiresSummary: z.boolean().describe('Whether the question requires summarization of the document to answer.'),
  summary: z.string().optional().describe('A summary of the document, if the question requires it.'),
});

export type StudyAssistantOutput = z.infer<typeof StudyAssistantOutputSchema>;

export async function studyAssistant(input: StudyAssistantInput): Promise<StudyAssistantOutput> {
  return studyAssistantFlow(input);
}

const requiresSummaryPrompt = ai.definePrompt({
  name: 'requiresSummaryPrompt',
  input: {schema: StudyAssistantInputSchema},
  output: {schema: z.object({requiresSummary: z.boolean()})},
  prompt: `You are an AI study assistant. Determine if the following question requires a summary of the document to answer it. Return true if a summary is required, false otherwise.\n\nQuestion: {{{query}}}\nDocument: {{{document}}}`,
});

const summaryPrompt = ai.definePrompt({
  name: 'summaryPrompt',
  input: {schema: StudyAssistantInputSchema},
  output: {schema: z.object({summary: z.string()})},
  prompt: `You are an AI study assistant. Summarize the following document.\n\nDocument: {{{document}}}`,
});

const answerPrompt = ai.definePrompt({
  name: 'answerPrompt',
  input: {schema: z.object({query: z.string(), document: z.string(), summary: z.string().optional()})},
  output: {schema: z.object({answer: z.string()})},
  prompt: `You are an AI study assistant. Answer the following question using the provided document and summary if available.\n\nQuestion: {{{query}}}\nDocument: {{{document}}}\nSummary: {{{summary}}}`,
});

const studyAssistantFlow = ai.defineFlow(
  {
    name: 'studyAssistantFlow',
    inputSchema: StudyAssistantInputSchema,
    outputSchema: StudyAssistantOutputSchema,
  },
  async input => {
    const {output: {requiresSummary}} = await requiresSummaryPrompt(input);

    let summary: string | undefined = undefined;
    if (requiresSummary) {
      const {output: {summary: generatedSummary}} = await summaryPrompt(input);
      summary = generatedSummary;
    }

    const {output: {answer}} = await answerPrompt({
      query: input.query,
      document: input.document,
      summary,
    });

    return {
      answer,
      requiresSummary,
      summary,
    };
  }
);
