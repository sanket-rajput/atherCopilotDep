'use client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { useState } from 'react';
import { Check, Copy, Loader2 } from 'lucide-react';

import AppLayout from '../app-layout';

import { automateTask, type AutomateTaskOutput } from '@/ai/flows/task-automation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const removeMarkdown = (text: string) =>
  text.replace(/```[\w-]*\n/g, '').replace(/```/g, '');

export default function TaskAutomationPage() {
  const [taskDescription, setTaskDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AutomateTaskOutput | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const { toast } = useToast();

  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskDescription.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please describe the task you want to automate.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setHasCopied(false);

    try {
      const response = await automateTask({ taskDescription });
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Generating Script',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.automationScript) {
      navigator.clipboard.writeText(
        removeMarkdown(result.automationScript)
      );
      setHasCopied(true);
      toast({ title: 'Script copied to clipboard!' });
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-10">
        <PageHeader
          title="Task Automation"
          description="Describe a repetitive task, and let AI generate an automation script for you."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* LEFT: INPUT */}
          <Card>
            <CardHeader>
              <CardTitle>Describe Your Task</CardTitle>
              <CardDescription>
                Be specific about triggers, timing, and expected output.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleGenerateScript}
                className="space-y-4"
              >
                <Textarea
                  placeholder="e.g. Every day at 9 AM, scan my unread emails for invoices and save attachments to an 'Invoices' folder."
                  value={taskDescription}
                  onChange={(e) =>
                    setTaskDescription(e.target.value)
                  }
                  className="min-h-[220px] font-body"
                />

                <Button
                  type="submit"
                  disabled={isLoading || !taskDescription}
                  className="w-full sm:w-auto"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Script
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* RIGHT: OUTPUT */}
          <div className="space-y-6">
            <Card className="relative">
              <CardHeader>
                <CardTitle>Automation Script</CardTitle>
                <CardDescription>
                  Generated automation code based on your task.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {isLoading && (
                  <div className="flex min-h-[160px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}

                {result?.automationScript && (
                  <pre className="rounded-md bg-muted p-4 text-sm font-code overflow-x-auto">
                    <code>
                      {removeMarkdown(
                        result.automationScript
                      )}
                    </code>
                  </pre>
                )}

                {!isLoading &&
                  !result?.automationScript && (
                    <div className="flex min-h-[160px] items-center justify-center text-sm text-muted-foreground">
                      Your generated script will appear here.
                    </div>
                  )}
              </CardContent>

              {result?.automationScript && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-4 text-muted-foreground"
                  onClick={handleCopy}
                >
                  {hasCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </Card>

            <Card className="animate-in fade-in-50">
              <CardHeader>
                <CardTitle>Explanation</CardTitle>
                <CardDescription>
                  How the generated script works.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {isLoading && (
                  <div className="flex min-h-[120px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}

                {result?.explanation && (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {result.explanation}
                  </p>
                )}

                {!isLoading && !result?.explanation && (
                  <div className="flex min-h-[120px] items-center justify-center text-sm text-muted-foreground">
                    An explanation of the script will appear here.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
