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
      {/* 🔒 FIXED SIDEBAR (desktop only) */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:w-64 md:border-r md:bg-card md:block">
        <div className="p-6 text-lg font-bold">Aether Co-Pilot</div>

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
                  active ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 w-full px-6">
          <div className="border rounded-md bg-card p-3">
            {/* Reuse existing UserNav component for consistency */}
            <div className="text-sm">
              <p className="font-medium">Account</p>
              <p className="text-xs text-muted-foreground">Manage your profile and settings</p>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <Link href="/profile" className="text-sm text-primary">Open Profile</Link>
                <Link href="/login" className="text-sm">Sign out</Link>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed inset-x-0 top-0 z-40 bg-card border-b">
        <div className="flex items-center justify-between p-3">
          <div className="text-lg font-bold">Aether Co-Pilot</div>
          <div className="flex items-center gap-2">
            <Link href="/chat" className="text-sm px-3 py-1 rounded-md bg-muted/40">Chat</Link>
            <Link href="/code-generator" className="text-sm px-3 py-1 rounded-md bg-muted/40">Code</Link>
          </div>
        </div>
      </header>

      {/* 🧠 MAIN PANEL (ONLY THIS CHANGES) */}
      <main className="flex-1 overflow-y-auto p-8 md:ml-64 pt-20 md:pt-8">
        {children}
      </main>
    </div>
  );
}
