'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Logo } from '@/components/logo'
import { useRouter } from 'next/navigation'
import { useAuth, initiateAnonymousSignIn, useUser } from '@/firebase'
import { useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const auth = useAuth()
  const { user, isUserLoading } = useUser()

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    initiateAnonymousSignIn(auth);
  }
  
  if (isUserLoading || user) {
    return (
       <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 overflow-hidden">
        <Logo className="h-16 w-16 animate-pulse" />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 overflow-hidden">
       <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/50 to-transparent w-full h-full"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/30 rounded-full mix-blend-screen filter blur-3xl animate-blob opacity-40"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-secondary/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000 opacity-40"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center space-y-4 text-center">
        <Logo className="h-16 w-16" />
        <h1 className="text-4xl font-bold tracking-tight font-headline">Aether Co-Pilot</h1>
        <p className="text-muted-foreground">Your AI-Powered Desktop Assistant</p>
      </div>

      <Card className="relative z-10 mt-8 w-full max-w-sm bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Anonymous Login</CardTitle>
          <CardDescription>
            Sign in anonymously to start chatting.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardFooter>
            <Button type="submit" className="w-full" variant="default">
              Sign In Anonymously
            </Button>
          </CardFooter>
        </form>
      </Card>
      <p className="relative z-10 mt-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Aether Co. All rights reserved.
      </p>
    </main>
  )
}
