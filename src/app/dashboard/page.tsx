import { PageHeader } from '@/components/page-header'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BookOpenText,
  Bot,
  CodeXml,
  MessageCircle,
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    title: 'Quantum CodeForge™',
    description: 'Generate code snippets using voice commands.',
    href: '/code-generator',
    icon: <CodeXml className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Cognitive Memory Core™',
    description: 'Context-aware chat with intelligent memory.',
    href: '/chat',
    icon: <MessageCircle className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Knowledge Navigator™',
    description: 'AI-based study support for summaries and answers.',
    href: '/study-support',
    icon: <BookOpenText className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Task Automation',
    description: 'Automate repetitive tasks with AI-driven scripts.',
    href: '/task-automation',
    icon: <Bot className="h-8 w-8 text-primary" />,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome, Developer"
        description="Your AI-powered desktop assistant is ready to help."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.href} className="group">
            <Card className="h-full transition-all group-hover:shadow-lg group-hover:-translate-y-1 bg-card/50 hover:bg-card">
             <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                    <CardTitle className="text-lg font-semibold">
                    {feature.title}
                    </CardTitle>
                    {feature.icon}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
