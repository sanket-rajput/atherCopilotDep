import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/toaster'
import { Inter, Roboto_Mono } from 'next/font/google'
import './globals.css'
import { FirebaseClientProvider } from '@/firebase'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
})

export const metadata: Metadata = {
  title: 'Aether Co-Pilot',
  description:
    'An AI-powered desktop assistant to improve productivity, learning, and security on a PC.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto_mono.variable} dark`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0A192F" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  )
}
