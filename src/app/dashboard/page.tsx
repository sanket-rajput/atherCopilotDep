'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  BookOpenText,
  Bot,
  CodeXml,
  MessageCircle,
  Sparkles,
  Mic,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const features = [
  {
    title: 'Quantum CodeForge™',
    description: 'Generate intelligent code snippets using AI or voice commands.',
    href: '/code-generator',
    icon: CodeXml,
    gradient: 'from-indigo-500/20 to-purple-500/20',
  },
  {
    title: 'Cognitive Memory Core™',
    description: 'Context-aware AI chat with persistent memory and sessions.',
    href: '/chat',
    icon: MessageCircle,
    gradient: 'from-cyan-500/20 to-blue-500/20',
  },
  {
    title: 'Knowledge Navigator™',
    description: 'Ask questions, summarize content, and learn faster.',
    href: '/study-support',
    icon: BookOpenText,
    gradient: 'from-emerald-500/20 to-green-500/20',
  },
  {
    title: 'Task Automation',
    description: 'Describe workflows and get automation scripts instantly.',
    href: '/task-automation',
    icon: Bot,
    gradient: 'from-orange-500/20 to-amber-500/20',
  },
];

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();

  const quickActions = [
    { label: 'Deep Research', mode: 'knowledge' },
    { label: 'Create video', mode: 'general' },
    { label: 'Create image', mode: 'general' },
    { label: 'Help me learn', mode: 'cognitive' },
    { label: 'Explore visually', mode: 'general' },
  ];

  const onQuickAction = (mode: string, prompt?: string) => {
    const q = new URLSearchParams();
    q.set('mode', mode);
    if (prompt) q.set('prompt', prompt);
    router.push(`/chat?${q.toString()}`);
  };

  return (
    <div className="space-y-12">
      {/* Gemini-like Hero */}
      <div className="relative rounded-2xl p-8 bg-card border">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{user ? `✨ Hi ${user.firstName || 'there'}` : '✨ Hi'}</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
              Happy New Year! Let’s make it your best yet
            </h1>

            <p className="mt-3 text-muted-foreground max-w-2xl">
              Ask Aether Co-Pilot anything — deep research, code generation, knowledge lookups, or run automations.
            </p>

            {/* Search bar */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center flex-1 gap-3 rounded-full bg-background p-3 shadow-sm">
                <button
                  className="rounded-md px-3 py-1 text-sm font-medium border bg-card"
                  aria-label="tools"
                >
                  Tools
                </button>

                <input
                  className="flex-1 bg-transparent outline-none text-lg"
                  placeholder="Ask Aether Co-Pilot"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val.trim()) {
                        const q = new URLSearchParams();
                        q.set('prompt', val);
                        router.push(`/chat?${q.toString()}`);
                      }
                    }
                  }}
                />

                <select className="rounded-md border bg-card px-2 py-1 text-sm">
                  <option>Fast</option>
                </select>

                <button className="rounded-full bg-primary/10 p-2 text-primary" aria-label="voice">
                  <Mic className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick action chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {quickActions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => onQuickAction(a.mode, a.label)}
                  className="rounded-full bg-muted/40 px-3 py-1 text-sm"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right side: small app quick summary */}
          <div className="hidden w-64 flex-col gap-4 md:flex">
            <div className="rounded-md border bg-card p-4">
              <h4 className="text-sm font-semibold">Quick Links</h4>
              <div className="mt-3 space-y-2">
                {features.slice(0, 4).map((f) => (
                  <Link key={f.href} href={f.href} className="flex items-center gap-2 text-sm">
                    <f.icon className="h-4 w-4 text-primary" />
                    <span>{f.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-md border bg-card p-4">
              <h4 className="text-sm font-semibold">Usage</h4>
              <p className="mt-2 text-sm text-muted-foreground">Sessions, saved prompts, and recent automations will appear here.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid (kept) */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <Link key={feature.href} href={feature.href} className="group">
              <Card className="relative h-full overflow-hidden border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                {/* Gradient glow */}
                <div
                  className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br ${feature.gradient}`}
                />

                <CardHeader className="relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>

                  <CardTitle className="mt-4 text-lg">
                    {feature.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10 flex flex-col justify-between">
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>

                  <div className="mt-6 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Open →
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
