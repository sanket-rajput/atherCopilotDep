'use client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Loader2,
  Mic,
  StopCircle,
} from 'lucide-react';

import AppLayout from '../app-layout';

import { generateCodeSnippet } from '@/ai/flows/voice-activated-code-generation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const removeMarkdown = (text: string) =>
  text.replace(/```[\w-]*\n/g, '').replace(/```/g, '');

export default function CodeGeneratorPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const { toast } = useToast();
  // Use a loose 'any' type here to avoid lib.dom type dependency for SpeechRecognition
  const recognitionRef = useRef<any>(null);

  /* 🎙 Speech Recognition Setup */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        title: 'Browser Not Supported',
        description:
          'Your browser does not support the Web Speech API. Please try Chrome or Edge.',
        variant: 'destructive',
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript((prev) => prev + finalTranscript);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, [toast]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  const handleGenerateCode = async () => {
    if (!transcript.trim()) {
      toast({
        title: 'No command provided',
        description:
          'Please say something or type a command to generate code.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setCodeSnippet('');
    setHasCopied(false);

    try {
      const result = await generateCodeSnippet({
        voiceCommand: transcript,
      });
      setCodeSnippet(removeMarkdown(result.codeSnippet));
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Generating Code',
        description:
          'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!codeSnippet) return;

    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        await navigator.clipboard.writeText(codeSnippet);
      } else {
        // Fallback for environments without Clipboard API
        const el = document.createElement('textarea');
        el.value = codeSnippet;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }

      setHasCopied(true);
      toast({ title: 'Code copied to clipboard!' });
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
      toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-10">
        <PageHeader
          title="Quantum CodeForge™"
          description="Generate code snippets using your voice or by typing a command."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* LEFT: COMMAND INPUT */}
          <Card>
            <CardHeader>
              <CardTitle>Your Command</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g. Create a React button component with a primary variant"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[220px] font-body"
                disabled={isListening}
              />

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={toggleListening}
                  size="icon"
                  variant={isListening ? 'destructive' : 'outline'}
                >
                  {isListening ? (
                    <StopCircle className="animate-pulse" />
                  ) : (
                    <Mic />
                  )}
                </Button>

                <Button
                  onClick={handleGenerateCode}
                  disabled={isLoading || !transcript.trim()}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Code
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: OUTPUT */}
          <Card className="relative">
            <CardHeader>
              <CardTitle>Generated Code</CardTitle>
            </CardHeader>

            <CardContent>
              {isLoading && (
                <div className="flex h-[220px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {codeSnippet && (
                <pre className="rounded-md bg-muted p-4 text-sm font-code overflow-x-auto">
                  <code>{codeSnippet}</code>
                </pre>
              )}

              {!isLoading && !codeSnippet && (
                <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                  Your generated code will appear here.
                </div>
              )}
            </CardContent>

            {codeSnippet && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-4 top-4 text-muted-foreground"
                onClick={handleCopy}
              >
                {hasCopied ? <Check /> : <Copy />}
              </Button>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
