'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageCircle,
  CodeXml,
  BookOpenText,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Chat' , icon: MessageCircle },
  { href: '/code-generator', label: 'Code Generator', icon: CodeXml },
  { href: '/study-support', label: 'Study Support', icon: BookOpenText },
  { href: '/task-automation', label: 'Task Automation', icon: Bot },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background">
      {/* 🔒 FIXED SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r bg-card">
        <div className="p-6 text-lg font-bold">
          Aether Co-Pilot
        </div>

        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 🧠 MAIN PANEL (ONLY THIS CHANGES) */}
      <main className="ml-64 flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
