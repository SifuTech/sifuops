import { SidebarNav } from '@/components/sidebar-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { SyncStatus } from '@/components/sync-status'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="app-header sticky top-0 z-20 border-b backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <a href="/" className="flex items-center">
            <span className="text-sm font-bold tracking-wide" style={{ color: '#ffffff', WebkitFontSmoothing: 'antialiased' }}>
              SifuTechGaming
            </span>
          </a>
          <div className="flex items-center gap-3">
            <SyncStatus />
            <ThemeToggle />
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded-xl border px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
                style={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  WebkitFontSmoothing: 'antialiased',
                  fontWeight: 600,
                }}
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="app-sidebar hidden lg:block px-4 py-6">
          <SidebarNav />
        </aside>
        <main className="p-6">{children}</main>
      </div>
    </>
  )
}
