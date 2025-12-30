'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  BookOpenText,
  Bot,
  CodeXml,
  LayoutDashboard,
  MessageCircle,
} from 'lucide-react'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { UserNav } from '@/components/user-nav'
import { Logo } from '@/components/logo'
import { FirebaseClientProvider } from '@/firebase'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    tooltip: 'Dashboard',
  },
  {
    href: '/code-generator',
    label: 'CodeForge™',
    icon: CodeXml,
    tooltip: 'Quantum CodeForge™',
  },
  {
    href: '/chat',
    label: 'Chat',
    icon: MessageCircle,
    tooltip: 'Cognitive Memory Core™',
  },
  {
    href: '/study-support',
    label: 'Study AI',
    icon: BookOpenText,
    tooltip: 'Knowledge Navigator™',
  },
  {
    href: '/task-automation',
    label: 'Automation',
    icon: Bot,
    tooltip: 'Task Automation',
  },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <FirebaseClientProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="p-4 border-b">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 group/logo"
            >
              <Logo className="h-8 w-8 transition-transform group-hover/logo:scale-110" />
              <span
                className={cn(
                  'text-lg font-semibold text-sidebar-foreground transition-opacity',
                  'group-data-[collapsible=icon]:opacity-0'
                )}
              >
                Aether
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.tooltip}
                    asChild
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1" />
            <UserNav />
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </FirebaseClientProvider>
  )
}
