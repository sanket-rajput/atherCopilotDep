'use client'

import { generateCodeSnippet } from '@/ai/flows/voice-activated-code-generation'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Check, Copy, Loader2, Mic, StopCircle } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'

const removeMarkdown = (text: string) => {
  return text.replace(/```[\w-]*\n/g, '').replace(/```/g, '')
}

export default function CodeGeneratorPage() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [codeSnippet, setCodeSnippet] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)
  const { toast } = useToast()

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast({
        title: 'Browser Not Supported',
        description:
          'Your browser does not support the Web Speech API. Please try Chrome or Edge.',
        variant: 'destructive',
      })
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      setTranscript((prev) => prev + finalTranscript)
    }
    
    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }, [toast])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      setTranscript('')
      recognitionRef.current?.start()
    }
    setIsListening(!isListening)
  }

  const handleGenerateCode = async () => {
    if (!transcript) {
      toast({
        title: 'No command provided',
        description: 'Please say something or type a command to generate code.',
        variant: 'destructive',
      })
      return
    }
    setIsLoading(true)
    setCodeSnippet('')
    setHasCopied(false)
    try {
      const result = await generateCodeSnippet({ voiceCommand: transcript })
      setCodeSnippet(removeMarkdown(result.codeSnippet))
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error Generating Code',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (codeSnippet) {
      navigator.clipboard.writeText(codeSnippet)
      setHasCopied(true)
      toast({ title: 'Code copied to clipboard!' })
      setTimeout(() => setHasCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Quantum CodeForge™"
        description="Generate code snippets using your voice or by typing a command."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Command</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g., 'Create a React component for a button with a primary style'"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-[200px] font-body"
              disabled={isListening}
            />
            <div className="flex items-center gap-2">
              <Button onClick={toggleListening} size="icon" variant={isListening ? 'destructive' : 'outline'}>
                {isListening ? (
                  <StopCircle className="animate-pulse" />
                ) : (
                  <Mic />
                )}
                <span className="sr-only">
                  {isListening ? 'Stop Listening' : 'Start Listening'}
                </span>
              </Button>
               <Button onClick={handleGenerateCode} disabled={isLoading || !transcript}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Code
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="relative">
          <CardHeader>
            <CardTitle>Generated Code</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
               <div className="flex items-center justify-center h-[200px]">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
               </div>
            )}
            {codeSnippet && (
              <pre className="p-4 rounded-md bg-muted text-sm font-code overflow-x-auto">
                <code>{codeSnippet}</code>
              </pre>
            )}
            {!isLoading && !codeSnippet && (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                Your generated code will appear here.
              </div>
            )}
          </CardContent>
           {codeSnippet && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 text-muted-foreground"
              onClick={handleCopy}
            >
              {hasCopied ? <Check /> : <Copy />}
            </Button>
          )}
        </Card>
      </div>
    </div>
  )
}
