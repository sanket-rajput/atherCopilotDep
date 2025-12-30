'use client'

import { studyAssistant, type StudyAssistantOutput } from '@/ai/flows/ai-based-study-support'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function StudySupportPage() {
  const [document, setDocument] = useState('')
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<StudyAssistantOutput | null>(null)
  const { toast } = useToast()

  const handleGetAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!document.trim() || !query.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both a document and a question.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    setResult(null)
    try {
      const response = await studyAssistant({ document, query })
      setResult(response)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error Getting Answer',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Knowledge Navigator™"
        description="Paste any content and ask questions to get AI-powered study support."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Study Material</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGetAnswer} className="space-y-4">
              <Textarea
                placeholder="Paste your article, notes, or any text here..."
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                className="min-h-[300px] font-body"
              />
              <Input
                placeholder="Ask a question about the text..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button type="submit" disabled={isLoading || !document || !query}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Get Answer
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Answer</CardTitle>
              <CardDescription>
                The AI's direct answer to your question.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                 <div className="flex items-center justify-center min-h-[100px]">
                   <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                 </div>
              )}
              {result?.answer && (
                <p className="text-sm whitespace-pre-wrap">{result.answer}</p>
              )}
              {!isLoading && !result?.answer && (
                <div className="flex items-center justify-center min-h-[100px] text-muted-foreground text-sm">
                  The answer to your question will appear here.
                </div>
              )}
            </CardContent>
          </Card>
          {result?.requiresSummary && result?.summary && (
            <Card className="animate-in fade-in-50">
              <CardHeader>
                <CardTitle>AI Summary</CardTitle>
                <CardDescription>
                  A summary was generated to help answer your question.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{result.summary}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
