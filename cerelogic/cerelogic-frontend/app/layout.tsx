'use client' 
import type { Viewport } from 'next'
import { Inter as FontSans } from 'next/font/google'

import { Analytics } from '@vercel/analytics/next'

import { useAuthStore } from '@/lib/stores/auth'
import { useAuthListener } from '@/lib/hooks/useAuthListener'

import { cn } from '@/lib/utils'

import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'

import AppSidebar from '@/components/app-sidebar'
import ArtifactRoot from '@/components/artifact/artifact-root'
import Header from '@/components/header'
import { ThemeProvider } from '@/components/theme-provider'

import './globals.css'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

const title = 'CereLogic'
const description =
  'A fully open-source AI-powered answer engine with a generative UI.'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user } = useAuthStore()
  useAuthListener()

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen flex flex-col font-sans antialiased',
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultOpen>
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <Header user={user} />
              <main className="flex flex-1 min-h-0">
                <ArtifactRoot>{children}</ArtifactRoot>
              </main>
            </div>
          </SidebarProvider>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
