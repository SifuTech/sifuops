import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SidebarNav } from '@/components/sidebar-nav'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SifuOps',
  description: 'AI Delivery Crew',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <header className="app-header sticky top-0 z-20 border-b backdrop-blur-xl">
          <div className="flex h-16 items-center px-6">
            <a href="/" className="flex items-center">
              <span className="text-sm font-semibold tracking-wide" style={{ color: 'var(--foreground-strong)' }}>SifuOps</span>
            </a>
          </div>
        </header>

        <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="app-sidebar hidden lg:block px-4 py-6">
            <SidebarNav />
          </aside>
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
