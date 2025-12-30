'use client'

import { automateTask, type AutomateTaskOutput } from '@/ai/flows/task-automation'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Check, Copy, Loader2 } from 'lucide-react'
import { useState } from 'react'

const removeMarkdown = (text: string) => {
    return text.replace(/```[\w-]*\n/g, '').replace(/```/g, '');
}

export default function TaskAutomationPage() {
  const [taskDescription, setTaskDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AutomateTaskOutput | null>(null)
  const [hasCopied, setHasCopied] = useState(false)
  const { toast } = useToast()

  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskDescription.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please describe the task you want to automate.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    setResult(null)
    setHasCopied(false)
    try {
      const response = await automateTask({ taskDescription })
      setResult(response)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error Generating Script',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (result?.automationScript) {
      navigator.clipboard.writeText(removeMarkdown(result.automationScript))
      setHasCopied(true)
      toast({ title: 'Script copied to clipboard!' })
      setTimeout(() => setHasCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Task Automation"
        description="Describe a repetitive task, and let AI generate an automation script for you."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Describe Your Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateScript} className="space-y-4">
              <Textarea
                placeholder="e.g., 'Every day at 9 AM, check my unread emails for invoices, and save their attachments to a folder named 'Invoices' on my desktop.'"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="min-h-[200px] font-body"
              />
              <Button type="submit" disabled={isLoading || !taskDescription}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Script
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card className="relative">
            <CardHeader>
              <CardTitle>Automation Script</CardTitle>
            </CardHeader>
            <CardContent>
               {isLoading && (
                 <div className="flex items-center justify-center min-h-[150px]">
                   <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                 </div>
              )}
              {result?.automationScript && (
                <pre className="p-4 rounded-md bg-muted text-sm font-code overflow-x-auto">
                  <code>{removeMarkdown(result.automationScript)}</code>
                </pre>
              )}
               {!isLoading && !result?.automationScript && (
                <div className="flex items-center justify-center min-h-[150px] text-muted-foreground text-sm">
                  Your generated script will appear here.
                </div>
              )}
            </CardContent>
             {result?.automationScript && (
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
          <Card className='animate-in fade-in-50'>
            <CardHeader>
              <CardTitle>Explanation</CardTitle>
              <CardDescription>An explanation of how the script works.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                 <div className="flex items-center justify-center min-h-[100px]">
                   <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                 </div>
              )}
              {result?.explanation && (
                <p className="text-sm whitespace-pre-wrap">{result.explanation}</p>
              )}
              {!isLoading && !result?.explanation && (
                <div className="flex items-center justify-center min-h-[100px] text-muted-foreground text-sm">
                  An explanation of the script will appear here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
