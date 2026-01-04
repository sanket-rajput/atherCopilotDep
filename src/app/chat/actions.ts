'use server';

import { intelligentChatMemory } from '@/ai/flows/intelligent-chat-memory';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export async function chatAction(
  message: string,
  chatHistory: Message[],
  mode?: 'general' | 'coding' | 'cognitive' | 'knowledge' | 'task'
) {
  if (!message || !Array.isArray(chatHistory)) {
    throw new Error('Invalid payload');
  }

  const result = await intelligentChatMemory({
    message,
    chatHistory,
    mode,
  });

  return {
    response: result.response,
  };
}
