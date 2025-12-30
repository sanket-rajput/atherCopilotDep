'use client'

import {
  intelligentChatMemory,
} from '@/ai/flows/intelligent-chat-memory'
import { Logo } from '@/components/logo'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Loader2, Send, User, Plus, MessageSquare, Trash2 } from 'lucide-react'
import { useState, useRef, useEffect, useMemo } from 'react'

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
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const sessionsQuery = useMemoFirebase(
    () =>
      user ? query(collection(firestore, `users/${user.uid}/sessions`), orderBy('startTime', 'desc')) : null,
    [firestore, user]
  );
  const { data: sessions, isLoading: sessionsLoading } = useCollection(sessionsQuery);

  const messagesQuery = useMemoFirebase(
    () =>
      user && activeSessionId
        ? query(collection(firestore, `users/${user.uid}/sessions/${activeSessionId}/messages`), orderBy('createdAt'))
        : null,
    [firestore, user, activeSessionId]
  );
  const { data: firestoreMessages, isLoading: messagesLoading } = useCollection(messagesQuery);

  useEffect(() => {
    if (firestoreMessages) {
      const formattedMessages = firestoreMessages.map(msg => ({
        role: msg.isUserMessage ? 'user' : 'assistant',
        content: msg.content
      }));
      setMessages(formattedMessages);
    } else {
      setMessages([]);
    }
  }, [firestoreMessages]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])
  
  useEffect(() => {
    if (!activeSessionId && sessions && sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  const handleNewSession = async () => {
    if (!user) return;
    const sessionsCollection = collection(firestore, `users/${user.uid}/sessions`);
    const newSession = {
      startTime: serverTimestamp(),
      sessionName: `New Chat ${sessions ? sessions.length + 1 : 1}`,
      userId: user.uid,
    };
    const docRef = await addDocumentNonBlocking(sessionsCollection, newSession);
    if (docRef) {
      setActiveSessionId(docRef.id);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!user) return;
    const sessionDoc = doc(firestore, `users/${user.uid}/sessions`, sessionId);
    await deleteDocumentNonBlocking(sessionDoc);
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !user || !activeSessionId) return

    const userMessageContent = input;
    const userMessageForUI: Message = { role: 'user', content: userMessageContent };
    setMessages((prev) => [...prev, userMessageForUI]);
    setInput('')
    setIsLoading(true)

    const messagesCollection = collection(firestore, `users/${user.uid}/sessions/${activeSessionId}/messages`);
    await addDocumentNonBlocking(messagesCollection, {
      content: userMessageContent,
      isUserMessage: true,
      createdAt: serverTimestamp(),
      userId: user.uid,
    });
    
    try {
      const chatHistory = [...messages, userMessageForUI].map(
        (msg) => ({
          role: msg.role,
          content: msg.content,
        })
      );

      const result = await intelligentChatMemory({
        message: userMessageContent,
        chatHistory: chatHistory as { role: 'user' | 'assistant'; content: string }[],
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response,
      }
      
      await addDocumentNonBlocking(messagesCollection, {
        content: result.response,
        isUserMessage: false,
        createdAt: serverTimestamp(),
        userId: user.uid
      });

    } catch (error) {
      console.error(error)
      toast({
        title: 'Error in Chat',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      {/* Sessions Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r bg-card/50">
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <Button variant="ghost" size="icon" onClick={handleNewSession}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          {sessionsLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {sessions?.map(session => (
                <div
                  key={session.id}
                  className={cn(
                    "group flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted",
                    activeSessionId === session.id && "bg-muted"
                  )}
                  onClick={() => setActiveSessionId(session.id)}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate">{session.sessionName}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>


      {/* Chat Area */}
      <div className="flex flex-col flex-1">
        <div className="border-b p-4">
            <PageHeader
                title="Cognitive Memory Core™"
                description="Engage in a continuous conversation with your AI assistant."
            />
        </div>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
              {messagesLoading && messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground pt-24">
                  <Loader2 className="h-12 w-12 animate-spin" />
                </div>
              )}

              {!messagesLoading && messages.length === 0 && !activeSessionId && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-24">
                    <Logo className="h-12 w-12 mb-4" />
                    <p className="text-lg font-semibold">Start a new conversation</p>
                    <p>Click the '+' button to begin a new chat session.</p>
                  </div>
              )}
              
              {!messagesLoading && messages.length === 0 && activeSessionId && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-24">
                    <Logo className="h-12 w-12 mb-4" />
                    <p className="text-lg font-semibold">Start a conversation</p>
                    <p>Ask me anything!</p>
                  </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Logo className="w-5 h-5" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'p-3 rounded-lg max-w-sm md:max-w-md lg:max-w-lg',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Logo className="w-5 h-5" />
                    </div>
                  <div className="p-3 rounded-lg bg-muted flex items-center">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground"/>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading || !activeSessionId || messagesLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim() || !activeSessionId || messagesLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
