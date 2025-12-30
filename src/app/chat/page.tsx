'use client';

export const dynamic = 'force-dynamic';

import { chatAction } from './actions';

import { useState, useRef, useEffect } from 'react';
import {
  Loader2,
  Send,
  User,
  Plus,
  MessageSquare,
  Trash2,
} from 'lucide-react';

import AppLayout from '../app-layout';

import { Logo } from '@/components/logo';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import {
  useAuth,
  useCollection,
  useFirebase,
  useUser,
  useMemoFirebase,
  initiateAnonymousSignIn,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';

import {
  collection,
  query,
  orderBy,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  /* 🔐 Anonymous login */
  useEffect(() => {
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  /* 📂 Sessions */
  const sessionsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, `users/${user.uid}/sessions`),
            orderBy('startTime', 'desc')
          )
        : null,
    [firestore, user]
  );

  const { data: sessions } = useCollection(sessionsQuery);

  /* 💬 Messages */
  const messagesQuery = useMemoFirebase(
    () =>
      user && activeSessionId
        ? query(
            collection(
              firestore,
              `users/${user.uid}/sessions/${activeSessionId}/messages`
            ),
            orderBy('createdAt')
          )
        : null,
    [firestore, user, activeSessionId]
  );

  const { data: firestoreMessages } = useCollection(messagesQuery);

  useEffect(() => {
    if (firestoreMessages) {
      setMessages(
        firestoreMessages.map((m) => ({
          role: m.isUserMessage ? 'user' : 'assistant',
          content: m.content,
        }))
      );
    } else {
      setMessages([]);
    }
  }, [firestoreMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  useEffect(() => {
    if (!activeSessionId && sessions?.length) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  /* ➕ New session */
  const handleNewSession = async () => {
    if (!user) return;
    const ref = collection(firestore, `users/${user.uid}/sessions`);
    const docRef = await addDocumentNonBlocking(ref, {
      startTime: serverTimestamp(),
      sessionName: `New Chat ${(sessions?.length ?? 0) + 1}`,
    });
    if (docRef) setActiveSessionId(docRef.id);
  };

  /* 🗑 Delete session */
  const handleDeleteSession = async (id: string) => {
    if (!user) return;
    await deleteDocumentNonBlocking(
      doc(firestore, `users/${user.uid}/sessions`, id)
    );
    if (id === activeSessionId) setActiveSessionId(null);
  };

  /* ✉ Send message — SERVER ACTION (FINAL FIX) */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !activeSessionId) return;

    const content = input;
    setInput('');
    setIsLoading(true);

    const userMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);

    const ref = collection(
      firestore,
      `users/${user.uid}/sessions/${activeSessionId}/messages`
    );

    await addDocumentNonBlocking(ref, {
      content,
      isUserMessage: true,
      createdAt: serverTimestamp(),
    });

    try {
      const cleanHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await chatAction(content, cleanHistory);

      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      await addDocumentNonBlocking(ref, {
        content: result.response,
        isUserMessage: false,
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Chat error',
        description: err.message || 'AI failed',
        variant: 'destructive',
      });

      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex h-full">
        {/* Sessions */}
        <aside className="hidden md:flex w-64 border-r bg-card">
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Chat History</h3>
              <Button size="icon" variant="ghost" onClick={handleNewSession}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {sessions?.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    className={cn(
                      'group flex justify-between px-3 py-2 rounded-md text-sm cursor-pointer',
                      activeSessionId === s.id
                        ? 'bg-muted'
                        : 'hover:bg-muted'
                    )}
                  >
                    <span className="truncate flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      {s.sessionName}
                    </span>
                    <Trash2
                      className="h-4 w-4 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(s.id);
                      }}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </aside>

        {/* Chat */}
        <div className="flex flex-col flex-1">
          <div className="border-b p-4">
            <PageHeader
              title="Cognitive Memory Core™"
              description="AI chat with persistent memory."
            />
          </div>

          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex gap-3',
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {m.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <Logo className="h-5 w-5" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'px-4 py-2 rounded-lg max-w-lg text-sm',
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {m.content}
                  </div>
                  {m.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              )}
            </div>
          </ScrollArea>

          <form
            onSubmit={handleSendMessage}
            className="flex gap-2 p-4 border-t"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
