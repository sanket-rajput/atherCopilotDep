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
} from 'lucide-react';

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
  return (
    <div className="space-y-12">
      {/* 🌌 Hero */}
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-background p-10">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />

        <div className="relative space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Aether Co-Pilot
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Your AI Control Center
          </h1>

          <p className="max-w-2xl text-muted-foreground">
            Build faster, learn smarter, and automate effortlessly with your
            all-in-one AI desktop assistant.
          </p>
        </div>
      </div>

      {/* 🚀 Feature Grid */}
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
